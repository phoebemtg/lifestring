import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  options: Array<{
    name: string;
    type: string;
    values: Array<{
      id: number;
      title: string;
    }>;
  }>;
  variants: Array<{
    id: number;
    price: number;
    title: string;
    options: Record<string, number>;
  }>;
  images: Array<{
    src: string;
    variant_ids: number[];
    position: string;
    is_default: boolean;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const printifyToken = Deno.env.get("PRINTIFY_API_KEY");
    if (!printifyToken) {
      throw new Error("PRINTIFY_API_KEY is not configured");
    }

    const { shop_id } = await req.json();
    if (!shop_id) {
      throw new Error("shop_id is required");
    }

    console.log("Fetching products from Printify shop:", shop_id);

    // Fetch products from Printify
    const response = await fetch(`https://api.printify.com/v1/shops/${shop_id}/products.json`, {
      headers: {
        "Authorization": `Bearer ${printifyToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Printify API error:", response.status, errorText);
      throw new Error(`Printify API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Fetched products:", data.data?.length || 0);

    // Transform Printify products to our format
    const products = data.data?.map((product: PrintifyProduct) => {
      const defaultImage = product.images?.find(img => img.is_default)?.src || 
                          product.images?.[0]?.src || 
                          '';

      // Extract available sizes and colors from variants
      const sizes = new Set<string>();
      const colors = new Set<string>();
      
      product.variants?.forEach(variant => {
        // Find size and color options
        product.options?.forEach(option => {
          if (option.name.toLowerCase().includes('size')) {
            const sizeValue = option.values.find(v => v.id === variant.options[option.name]);
            if (sizeValue) sizes.add(sizeValue.title);
          }
          if (option.name.toLowerCase().includes('color')) {
            const colorValue = option.values.find(v => v.id === variant.options[option.name]);
            if (colorValue) colors.add(colorValue.title);
          }
        });
      });

      return {
        printify_product_id: product.id,
        name: product.title,
        description: product.description,
        product_type: product.tags?.[0] || 'apparel',
        base_price: Math.min(...(product.variants?.map(v => v.price) || [0])) / 100, // Convert cents to dollars
        image_url: defaultImage,
        sizes: Array.from(sizes),
        colors: Array.from(colors),
        variants: product.variants || [],
        options: product.options || [],
        images: product.images || []
      };
    }) || [];

    return new Response(JSON.stringify({ products }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error fetching Printify products:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});