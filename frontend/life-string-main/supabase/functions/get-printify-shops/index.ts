import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    console.log("Fetching Printify shops");

    const response = await fetch("https://api.printify.com/v1/shops.json", {
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
    console.log("Fetched shops:", data.length);

    return new Response(JSON.stringify({ shops: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error fetching Printify shops:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});