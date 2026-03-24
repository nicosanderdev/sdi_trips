import { supabase } from '../lib/supabase';

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface TopPropertyMetric {
  propertyId: string;
  value: number;
}

export async function getPropertyVisitTimeSeries(fromDateInclusive: string, toDateInclusive: string): Promise<TimeSeriesPoint[]> {
  const { data, error } = await supabase.rpc('get_property_visit_timeseries', {
    from_date: fromDateInclusive,
    to_date: toDateInclusive,
  });

  if (error) {
    console.error('[Metrics] getPropertyVisitTimeSeries failed:', error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    date: row.date,
    value: row.visit_count,
  }));
}

export async function getTopVisitedProperties(limit: number): Promise<TopPropertyMetric[]> {
  const { data, error } = await supabase.rpc('get_top_visited_properties', {
    limit_count: limit,
  });

  if (error) {
    console.error('[Metrics] getTopVisitedProperties failed:', error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    propertyId: row.property_id,
    value: row.visit_count,
  }));
}

