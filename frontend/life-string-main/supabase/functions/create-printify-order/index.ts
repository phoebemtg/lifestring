import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const printifyToken = Deno.env.get("PRINTIFY_API_KEY");
    if (!printifyToken) {
      throw new Error("PRINTIFY_API_KEY is not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { 
      order_id, 
      shop_id, 
      line_items, 
      shipping_address, 
      external_id 
    } = await req.json();

    console.log("Creating Printify order for order:", order_id);

    // Create order in Printify
    const printifyOrder = {
      external_id: external_id || order_id,
      line_items: line_items,
      shipping_address: shipping_address,
      address_to: shipping_address
    };

    const response = await fetch(`https://api.printify.com/v1/shops/${shop_id}/orders.json`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${printifyToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(printifyOrder),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Printify order creation error:", response.status, errorText);
      throw new Error(`Printify API error: ${response.status} ${errorText}`);
    }

    const printifyOrderData = await response.json();
    console.log("Printify order created:", printifyOrderData.id);

    // Update our order with Printify order ID
    const { error: updateError } = await supabaseClient
      .from("orders")
      .update({ 
        printify_order_id: printifyOrderData.id,
        status: "processing"
      })
      .eq("id", order_id);

    if (updateError) {
      console.error("Error updating order:", updateError);
      throw new Error("Failed to update order with Printify ID");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      printify_order_id: printifyOrderData.id,
      order: printifyOrderData 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error creating Printify order:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});