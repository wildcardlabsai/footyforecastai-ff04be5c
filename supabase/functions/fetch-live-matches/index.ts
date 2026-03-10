import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BASE = 'https://sports.bzzoiro.com/api';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const API_KEY = Deno.env.get('BSD_API_KEY');
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'BSD_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const apiHeaders = { 'Authorization': `Token ${API_KEY}` };
  const IMG_BASE = 'https://sports.bzzoiro.com/img';

  try {
    const res = await fetch(`${BASE}/live/`, { headers: apiHeaders });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`BSD live API error [${res.status}]: ${errText}`);
    }

    const data = await res.json();
    const results = data.results || [];
    console.log(`Live matches from BSD: ${results.length}`);

    const matches = results.map((event: any) => {
      const league = event.league || {};
      const homeTeamObj = event.home_team_obj;
      const awayTeamObj = event.away_team_obj;
      const liveStats = event.live_stats;

      const homeLogo = homeTeamObj?.api_id
        ? `${IMG_BASE}/team/${homeTeamObj.api_id}/?token=${API_KEY}`
        : undefined;
      const awayLogo = awayTeamObj?.api_id
        ? `${IMG_BASE}/team/${awayTeamObj.api_id}/?token=${API_KEY}`
        : undefined;

      const minute = event.current_minute || 0;

      const statusMap: Record<string, string> = {
        'inprogress': 'live',
        '1st_half': 'live',
        '2nd_half': 'live',
        'halftime': 'halftime',
        'finished': 'finished',
        'notstarted': 'scheduled',
      };
      const status = statusMap[event.status] || 'live';

      const homeStats = liveStats?.home || {};
      const awayStats = liveStats?.away || {};

      const homePoss = homeStats.ball_possession ?? 50;
      const awayPoss = awayStats.ball_possession ?? 50;

      return {
        id: String(event.id),
        fixtureId: event.api_id || event.id,
        league: league.name || 'Unknown',
        leagueLogo: league.api_id ? `${IMG_BASE}/league/${league.api_id}/?token=${API_KEY}` : undefined,
        leagueCountry: league.country || '',
        homeTeam: event.home_team || 'Home',
        awayTeam: event.away_team || 'Away',
        homeLogo,
        awayLogo,
        homeScore: event.home_score ?? 0,
        awayScore: event.away_score ?? 0,
        minute,
        status,
        stats: {
          matchId: String(event.id),
          minute,
          homeShots: homeStats.total_shots ?? 0,
          awayShots: awayStats.total_shots ?? 0,
          homeShotsOnTarget: homeStats.shots_on_target ?? 0,
          awayShotsOnTarget: awayStats.shots_on_target ?? 0,
          homeCorners: homeStats.corner_kicks ?? 0,
          awayCorners: awayStats.corner_kicks ?? 0,
          homeDangerousAttacks: (homeStats.total_shots ?? 0) * 8,
          awayDangerousAttacks: (awayStats.total_shots ?? 0) * 8,
          homePossession: homePoss,
          awayPossession: awayPoss,
          homeRedCards: homeStats.red_cards ?? 0,
          awayRedCards: awayStats.red_cards ?? 0,
          homeYellowCards: homeStats.yellow_cards ?? 0,
          awayYellowCards: awayStats.yellow_cards ?? 0,
          homeXg: 0,
          awayXg: 0,
          momentumHome: homePoss,
          momentumAway: awayPoss,
          homeScore: event.home_score ?? 0,
          awayScore: event.away_score ?? 0,
          isLive: status === 'live',
        },
      };
    });

    return new Response(JSON.stringify({ matches, count: matches.length }), {
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
