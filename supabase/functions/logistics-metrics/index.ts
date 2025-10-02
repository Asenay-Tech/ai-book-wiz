// curl -X POST $BASE/logistics-metrics -H "Authorization: Bearer JWT" -H "Content-Type: application/json" -d '{"userId":"<uuid>","period":{"start":"2024-01-01","end":"2024-01-31"}}'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface LogisticsRequest {
  userId: string;
  period: { start: string; end: string };
  vehicleIds?: string[];
}

interface VehicleMetrics {
  vehicle_id: string;
  cost_per_mile: number;
  fuel_pct_revenue: number;
  miles: number;
  flags: string[];
}

interface LogisticsResponse {
  vehicles: VehicleMetrics[];
  fleet: {
    median_cpm: number;
    total_miles: number;
    total_revenue: number;
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("[logistics-metrics] Start");

  try {
    const { userId, period, vehicleIds }: LogisticsRequest = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get vehicles
    let vehicleQuery = supabaseClient
      .from("vehicles")
      .select("*")
      .eq("user_id", userId);
    
    if (vehicleIds && vehicleIds.length > 0) {
      vehicleQuery = vehicleQuery.in("id", vehicleIds);
    }

    const { data: vehicles } = await vehicleQuery;

    if (!vehicles || vehicles.length === 0) {
      return new Response(
        JSON.stringify({ vehicles: [], fleet: { median_cpm: 0, total_miles: 0, total_revenue: 0 } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const vehicleMetrics: VehicleMetrics[] = [];
    const allCPMs: number[] = [];

    for (const vehicle of vehicles) {
      // Get expenses for vehicle
      const { data: expenses } = await supabaseClient
        .from("transactions")
        .select("amount, category")
        .eq("user_id", userId)
        .eq("entity_id", vehicle.id)
        .gte("date", period.start)
        .lte("date", period.end);

      const fuel = expenses?.filter(e => e.category === 'transportation' || e.category === 'fuel')
        .reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const maintenance = expenses?.filter(e => e.category === 'maintenance')
        .reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const tolls = expenses?.filter(e => e.category === 'tolls')
        .reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const other = expenses?.filter(e => !['transportation', 'fuel', 'maintenance', 'tolls'].includes(e.category))
        .reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      // Get routes for vehicle
      const { data: routes } = await supabaseClient
        .from("routes")
        .select("*")
        .eq("vehicle_id", vehicle.id);

      // Mock miles and revenue (in production, store this in routes table)
      const miles = (routes?.length || 1) * 100; // Mock: 100 miles per route
      const revenue = (routes?.length || 1) * 500; // Mock: $500 per route

      const totalCost = fuel + maintenance + tolls + other;
      const cpm = miles > 0 ? totalCost / miles : 0;
      const fuelPct = revenue > 0 ? (fuel / revenue) * 100 : 0;

      allCPMs.push(cpm);

      const flags: string[] = [];
      vehicleMetrics.push({
        vehicle_id: vehicle.id,
        cost_per_mile: Math.round(cpm * 100) / 100,
        fuel_pct_revenue: Math.round(fuelPct * 100) / 100,
        miles,
        flags
      });
    }

    // Calculate fleet median
    allCPMs.sort((a, b) => a - b);
    const medianCPM = allCPMs.length > 0 
      ? allCPMs[Math.floor(allCPMs.length / 2)] 
      : 0;

    // Flag vehicles >20% over median
    for (const vm of vehicleMetrics) {
      if (vm.cost_per_mile > medianCPM * 1.2) {
        vm.flags.push('high_cpm');
      }
    }

    const totalMiles = vehicleMetrics.reduce((sum, v) => sum + v.miles, 0);
    const totalRevenue = (vehicles.length || 1) * 500; // Mock revenue

    const duration = Date.now() - startTime;
    console.log(`[logistics-metrics] Done in ${duration}ms, vehicles: ${vehicles.length}`);

    const response: LogisticsResponse = {
      vehicles: vehicleMetrics,
      fleet: {
        median_cpm: Math.round(medianCPM * 100) / 100,
        total_miles: totalMiles,
        total_revenue: totalRevenue
      }
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[logistics-metrics] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
