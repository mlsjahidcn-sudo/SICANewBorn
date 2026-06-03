import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { universities, programs, scholarships } from '@/lib/data';

export async function GET() {
  if (isSupabaseServerConfigured() && supabaseServer) {
    const [uniRes, progRes, scholRes, appRes] = await Promise.all([
      supabaseServer.from('universities').select('id', { count: 'exact', head: true }),
      supabaseServer.from('programs').select('id', { count: 'exact', head: true }),
      supabaseServer.from('scholarships').select('id', { count: 'exact', head: true }),
      supabaseServer.from('applications').select('id', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      universities: uniRes.count || 0,
      programs: progRes.count || 0,
      scholarships: scholRes.count || 0,
      applications: appRes.count || 0,
    });
  }

  // Fallback to static data counts
  return NextResponse.json({
    universities: universities.length,
    programs: programs.length,
    scholarships: scholarships.length,
    applications: 24,
  });
}
