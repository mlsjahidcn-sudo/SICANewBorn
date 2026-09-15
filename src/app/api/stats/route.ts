import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { universities, programs, scholarships } from '@/lib/data';

export async function GET() {
  if (isSupabaseServerConfigured() && supabaseServer) {
    // Phase 93: the old query counted an `applications` table that
    // doesn't exist in any migration (always errored → 0). The real
    // pipeline is split across student_applications + partner_applications.
    const [uniRes, progRes, scholRes, studAppRes, partnerAppRes] = await Promise.all([
      supabaseServer.from('universities').select('id', { count: 'exact', head: true }),
      supabaseServer.from('programs').select('id', { count: 'exact', head: true }),
      supabaseServer.from('scholarships').select('id', { count: 'exact', head: true }),
      supabaseServer.from('student_applications').select('id', { count: 'exact', head: true }),
      supabaseServer.from('partner_applications').select('id', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      universities: uniRes.count || 0,
      programs: progRes.count || 0,
      scholarships: scholRes.count || 0,
      applications: (studAppRes.count || 0) + (partnerAppRes.count || 0),
    });
  }

  // Fallback to static data counts (no applications without a DB)
  return NextResponse.json({
    universities: universities.length,
    programs: programs.length,
    scholarships: scholarships.length,
    applications: 0,
  });
}
