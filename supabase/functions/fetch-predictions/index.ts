import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LEAGUE_IDS = [39, 40, 41, 42, 2, 3, 848, 78, 140, 135, 61];

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

  const BASE = 'https://v3.football.api-sports.io';
  const apiHeaders = { 'x-apisports-key': API_KEY };

  try {
    // Fetch fixtures for today + next 2 days
    const dates: string[] = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(Date.now() + i * 86400000);
      dates.push(d.toISOString().split('T')[0]);
    }

    const fixtureResponses = await Promise.all(
      dates.map(date =>
        fetch(`${BASE}/fixtures?date=${date}`, { headers: apiHeaders })
          .then(r => r.json())
          .catch(() => ({ response: [] }))
      )
    );

    const allFixtures = fixtureResponses.flatMap(r => r.response || []);
    const filtered = allFixtures.filter((f: any) => LEAGUE_IDS.includes(f.league.id));
    const limited = filtered.slice(0, 30);

    // Fetch predictions for each fixture (API-Football predictions endpoint)
    const predictions = await Promise.all(
      limited.map(async (fixture: any) => {
        try {
          const res = await fetch(
            `${BASE}/predictions?fixture=${fixture.fixture.id}`,
            { headers: apiHeaders }
          );
          if (!res.ok) return mapFixture(fixture, null);
          const data = await res.json();
          return mapFixture(fixture, data.response?.[0] || null);
        } catch {
          return mapFixture(fixture, null);
        }
      })
    );

    return new Response(JSON.stringify({ predictions, count: predictions.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error fetching predictions:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function pct(s: string | undefined | null): number {
  if (!s) return 50;
  return parseInt(String(s).replace('%', '')) || 50;
}

function mapFixture(fixture: any, pred: any) {
  const f = fixture.fixture;
  const teams = fixture.teams;
  const goals = fixture.goals;
  const league = fixture.league;

  // Extract probabilities from API-Football predictions
  let homeWinProb = 33, drawProb = 34, awayWinProb = 33;
  if (pred?.predictions?.percent) {
    homeWinProb = pct(pred.predictions.percent.home);
    drawProb = pct(pred.predictions.percent.draw);
    awayWinProb = pct(pred.predictions.percent.away);
  }

  // Extract comparison data for our weighted model
  const comp = pred?.comparison || {};
  const homeAtt = pct(comp.att?.home) / 100;
  const awayAtt = pct(comp.att?.away) / 100;
  const homeDef = pct(comp.def?.home) / 100;
  const awayDef = pct(comp.def?.away) / 100;
  const homeForm = pct(comp.form?.home) / 100;
  const awayForm = pct(comp.form?.away) / 100;
  const h2hHome = pct(comp.h2h?.home) / 100;

  // Our weighted team strength scores
  const homeTeamScore =
    0.30 * homeAtt +
    0.20 * homeDef +
    0.15 * (homeAtt * 0.8) +
    0.10 * homeForm +
    0.10 * 0.6 +
    0.05 * h2hHome +
    0.05 * homeForm +
    0.05 * homeAtt;

  const awayTeamScore =
    0.30 * awayAtt +
    0.20 * awayDef +
    0.15 * (awayAtt * 0.8) +
    0.10 * awayForm +
    0.10 * 0.4 +
    0.05 * (1 - h2hHome) +
    0.05 * awayForm +
    0.05 * awayAtt;

  // Goals market calculations
  const attackPower = homeAtt + awayAtt;
  const defWeakness = 2 - (homeDef + awayDef);
  const goalFactor = attackPower * 0.6 + defWeakness * 0.4;

  const over25Prob = Math.round(Math.min(92, Math.max(15, goalFactor * 50 + 5)));
  const over35Prob = Math.round(Math.min(80, Math.max(5, goalFactor * 35 - 5)));
  const bttsProb = Math.round(Math.min(88, Math.max(12, homeAtt * awayAtt * 200 + defWeakness * 15)));

  // Predicted result
  let predictedResult = 'Draw';
  if (homeWinProb > drawProb && homeWinProb > awayWinProb) predictedResult = 'Home Win';
  else if (awayWinProb > drawProb && awayWinProb > homeWinProb) predictedResult = 'Away Win';

  // Confidence score
  const probs = [homeWinProb, drawProb, awayWinProb].sort((a, b) => b - a);
  const gap = probs[0] - probs[1];
  const confidence = Math.round(Math.min(95, Math.max(35, gap * 1.5 + 40)));
  const confidenceLevel = confidence >= 80 ? 'high' : confidence >= 60 ? 'medium' : 'low';

  // Predicted score
  const homeGoals = Math.max(0, Math.round(homeAtt * 2 + (1 - awayDef) * 0.5 - 0.3));
  const awayGoals = Math.max(0, Math.round(awayAtt * 1.7 + (1 - homeDef) * 0.5 - 0.3));

  // Upset detection
  const isUpset =
    (predictedResult === 'Away Win' && awayWinProb < 35) ||
    (predictedResult === 'Home Win' && homeWinProb < 35) ||
    (predictedResult === 'Draw' && drawProb > Math.max(homeWinProb, awayWinProb));

  // Status mapping
  const statusShort = f.status?.short || 'NS';
  const isLive = ['1H', '2H', 'ET', 'BT', 'P'].includes(statusShort);
  const isHT = statusShort === 'HT';
  const isFT = ['FT', 'AET', 'PEN'].includes(statusShort);

  const reasoning = pred?.predictions?.advice || 'Model analysis based on team form, attack and defence metrics.';

  return {
    id: String(f.id),
    fixtureId: f.id,
    league: league.name,
    leagueCountry: league.country,
    leagueLogo: league.logo,
    homeTeam: teams.home.name,
    awayTeam: teams.away.name,
    homeLogo: teams.home.logo,
    awayLogo: teams.away.logo,
    matchDate: f.date,
    homeScore: goals?.home ?? 0,
    awayScore: goals?.away ?? 0,
    homeWinProb,
    drawProb,
    awayWinProb,
    predictedResult,
    predictedScore: `${homeGoals}-${awayGoals}`,
    confidence,
    confidenceLevel,
    over25Prob,
    over35Prob,
    bttsProb,
    bttsResult: bttsProb >= 50 ? 'Yes' : 'No',
    isUpset,
    upsetConfidence: isUpset ? Math.round(confidence * 0.85) : undefined,
    riskLevel: isUpset ? (confidence < 50 ? 'High' : confidence < 65 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low' : undefined,
    reasoning,
    homeTeamScore,
    awayTeamScore,
    minute: f.status?.elapsed || 0,
    status: isFT ? 'finished' : isHT ? 'halftime' : isLive ? 'live' : 'scheduled',
  };
}
