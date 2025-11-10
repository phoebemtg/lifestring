import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image_url?: string;
  printify_product_id: string;
  house_id: number;
}

interface CheckoutRequest {
  items: CartItem[];
  customer_name: string;
  customer_email: string;
  shipping_address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Stripe secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const { items, customer_name, customer_email, shipping_address }: CheckoutRequest = await req.json();

    console.log("Creating checkout session for user:", user.id);
    console.log("Items:", items);

    // Validate items
    if (!items || items.length === 0) {
      throw new Error("No items in cart");
    }

    // Calculate totals
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
    const total = subtotal + tax;

    // Create line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: `Size: ${item.size}, Color: ${item.color}`,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add tax as a separate line item
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Tax (8%)",
          },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ 
      email: customer_email, 
      limit: 1 
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: customer_email,
        name: customer_name,
        address: {
          line1: shipping_address.line1,
          line2: shipping_address.line2,
          city: shipping_address.city,
          state: shipping_address.state,
          postal_code: shipping_address.postal_code,
          country: shipping_address.country,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/?checkout=cancel`,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      payment_intent_data: {
        metadata: {
          user_id: user.id,
          items_json: JSON.stringify(items),
        },
      },
      metadata: {
        user_id: user.id,
        customer_name,
        customer_email,
        house_id: items[0]?.house_id?.toString() || "",
      },
    });

    // Create order record in database
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert({
        user_id: user.id,
        stripe_session_id: session.id,
        house_id: items[0]?.house_id || 1,
        customer_name,
        customer_email,
        total_amount: total,
        currency: "usd",
        status: "pending",
        shipping_address: shipping_address,
        billing_address: shipping_address, // Use same as shipping for now
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error("Failed to create order record");
    }

    console.log("Order created:", order.id);

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      size: item.size,
      color: item.color,
      printify_variant_id: item.printify_product_id,
    }));

    const { error: itemsError } = await supabaseClient
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Don't throw here, as the order was created successfully
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id,
      order_id: order.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});