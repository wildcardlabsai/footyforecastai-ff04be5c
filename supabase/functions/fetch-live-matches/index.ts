import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const API_KEY = Deno.env.get('API_FOOTBALL_KEY');
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'API_FOOTBALL_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const BASE_URL = 'https://v3.football.api-sports.io';

  try {
    // Fetch live fixtures
    const fixturesRes = await fetch(`${BASE_URL}/fixtures?live=all`, {
      headers: { 'x-apisports-key': API_KEY },
    });

    if (!fixturesRes.ok) {
      throw new Error(`API-Football fixtures failed [${fixturesRes.status}]: ${await fixturesRes.text()}`);
    }

    const fixturesData = await fixturesRes.json();
    const fixtures = fixturesData.response || [];

    // For each live fixture, fetch statistics (batch up to 20 to stay within rate limits)
    const liveFixtures = fixtures.slice(0, 20);

    const matchesWithStats = await Promise.all(
      liveFixtures.map(async (fixture: any) => {
        try {
          const statsRes = await fetch(
            `${BASE_URL}/fixtures/statistics?fixture=${fixture.fixture.id}`,
            { headers: { 'x-apisports-key': API_KEY } }
          );

          let stats = null;
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            stats = statsData.response || [];
          }

          return mapFixtureToMatch(fixture, stats);
        } catch {
          return mapFixtureToMatch(fixture, null);
        }
      })
    );

    return new Response(JSON.stringify({ matches: matchesWithStats, count: matchesWithStats.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error fetching live matches:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getStat(teamStats: any[], name: string): number {
  if (!teamStats) return 0;
  const stat = teamStats.find((s: any) => s.type === name);
  if (!stat) return 0;
  const val = stat.value;
  if (val === null || val === undefined) return 0;
  if (typeof val === 'string') {
    return parseInt(val.replace('%', ''), 10) || 0;
  }
  return Number(val) || 0;
}

function mapFixtureToMatch(fixture: any, statsResponse: any[] | null) {
  const f = fixture.fixture;
  const teams = fixture.teams;
  const goals = fixture.goals;
  const league = fixture.league;

  const minute = f.status?.elapsed || 0;
  const status = f.status?.short;
  const isLive = ['1H', '2H', 'ET', 'P', 'BT'].includes(status);
  const isHalftime = status === 'HT';
  const isFinished = ['FT', 'AET', 'PEN'].includes(status);

  let homeStats: any[] = [];
  let awayStats: any[] = [];

  if (statsResponse && statsResponse.length >= 2) {
    homeStats = statsResponse[0]?.statistics || [];
    awayStats = statsResponse[1]?.statistics || [];
  }

  const homePoss = getStat(homeStats, 'Ball Possession');
  const awayPoss = getStat(awayStats, 'Ball Possession');

  return {
    id: String(f.id),
    fixtureId: f.id,
    league: league.name,
    leagueLogo: league.logo,
    leagueCountry: league.country,
    homeTeam: teams.home.name,
    awayTeam: teams.away.name,
    homeLogo: teams.home.logo,
    awayLogo: teams.away.logo,
    homeScore: goals.home ?? 0,
    awayScore: goals.away ?? 0,
    minute,
    status: isFinished ? 'finished' : isHalftime ? 'halftime' : isLive ? 'live' : 'scheduled',
    stats: {
      matchId: String(f.id),
      minute,
      homeShots: getStat(homeStats, 'Total Shots'),
      awayShots: getStat(awayStats, 'Total Shots'),
      homeShotsOnTarget: getStat(homeStats, 'Shots on Goal'),
      awayShotsOnTarget: getStat(awayStats, 'Shots on Goal'),
      homeCorners: getStat(homeStats, 'Corner Kicks'),
      awayCorners: getStat(awayStats, 'Corner Kicks'),
      homeDangerousAttacks: getStat(homeStats, 'Dangerous Attacks') || getStat(homeStats, 'Total Shots') * 8,
      awayDangerousAttacks: getStat(awayStats, 'Dangerous Attacks') || getStat(awayStats, 'Total Shots') * 8,
      homePossession: homePoss || 50,
      awayPossession: awayPoss || 50,
      homeRedCards: getStat(homeStats, 'Red Cards'),
      awayRedCards: getStat(awayStats, 'Red Cards'),
      homeYellowCards: getStat(homeStats, 'Yellow Cards'),
      awayYellowCards: getStat(awayStats, 'Yellow Cards'),
      homeXg: getStat(homeStats, 'expected_goals'),
      awayXg: getStat(awayStats, 'expected_goals'),
      momentumHome: homePoss || 50,
      momentumAway: awayPoss || 50,
      homeScore: goals.home ?? 0,
      awayScore: goals.away ?? 0,
      isLive: isLive,
    },
  };
}
