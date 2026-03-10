import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LEAGUE_IDS = new Set([39, 2, 3, 848, 140, 78, 135]);

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
    // Free plan: only today + tomorrow allowed
    const dates: string[] = [];
    for (let i = 0; i < 2; i++) {
      const d = new Date(Date.now() + i * 86400000);
      dates.push(d.toISOString().split('T')[0]);
    }

    console.log(`Fetching fixtures for dates: ${dates.join(', ')}`);

    // Fetch fixtures by date (works on free plan)
    const fixtureResponses = await Promise.all(
      dates.map(async date => {
        try {
          const res = await fetch(`${BASE}/fixtures?date=${date}`, { headers: apiHeaders });
          const data = await res.json();
          if (data.errors && Object.keys(data.errors).length > 0) {
            console.error(`API error for date ${date}:`, JSON.stringify(data.errors));
            return { response: [] };
          }
          console.log(`Date ${date}: ${(data.response || []).length} fixtures`);
          return data;
        } catch (e) {
          console.error(`Fetch error for date ${date}:`, (e as Error).message);
          return { response: [] };
        }
      })
    );

    const allFixtures = fixtureResponses.flatMap(r => r.response || []);
    console.log(`Total fixtures: ${allFixtures.length}`);

    // Filter to our target leagues
    const filtered = allFixtures.filter((f: any) => LEAGUE_IDS.has(f.league.id));
    console.log(`Target league fixtures: ${filtered.length}`);

    // Sort by date, take up to 30
    filtered.sort((a: any, b: any) =>
      new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    );
    const limited = filtered.slice(0, 30);

    // Fetch predictions for each fixture (with rate limit awareness)
    const predictions = await Promise.all(
      limited.map(async (fixture: any) => {
        try {
          const res = await fetch(
            `${BASE}/predictions?fixture=${fixture.fixture.id}`,
            { headers: apiHeaders }
          );
          if (!res.ok) {
            console.error(`Prediction API ${res.status} for fixture ${fixture.fixture.id}`);
            return mapFixture(fixture, null);
          }
          const data = await res.json();
          if (data.errors && Object.keys(data.errors).length > 0) {
            console.error(`Prediction error for ${fixture.fixture.id}:`, JSON.stringify(data.errors));
            return mapFixture(fixture, null);
          }
          return mapFixture(fixture, data.response?.[0] || null);
        } catch (e) {
          console.error(`Prediction fetch error ${fixture.fixture.id}:`, (e as Error).message);
          return mapFixture(fixture, null);
        }
      })
    );

    console.log(`Returning ${predictions.length} predictions`);

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
  if (!s) return 0;
  return parseInt(String(s).replace('%', '')) || 0;
}

function mapFixture(fixture: any, pred: any) {
  const f = fixture.fixture;
  const teams = fixture.teams;
  const goals = fixture.goals;
  const league = fixture.league;

  // Extract probabilities from API-Football predictions
  let homeWinProb = 33, drawProb = 34, awayWinProb = 33;
  let hasApiPrediction = false;

  if (pred?.predictions?.percent) {
    const h = pct(pred.predictions.percent.home);
    const d = pct(pred.predictions.percent.draw);
    const a = pct(pred.predictions.percent.away);
    if (h + d + a > 0) {
      homeWinProb = h;
      drawProb = d;
      awayWinProb = a;
      hasApiPrediction = true;
    }
  }

  // Use API-Football's predicted winner directly when available
  const apiWinner = pred?.predictions?.winner?.name || null;

  // Predicted result - use API winner first, then probabilities
  let predictedResult = 'Draw';
  if (apiWinner) {
    if (apiWinner === teams.home.name) predictedResult = 'Home Win';
    else if (apiWinner === teams.away.name) predictedResult = 'Away Win';
    else predictedResult = 'Draw';
  } else {
    if (homeWinProb > drawProb && homeWinProb >= awayWinProb) predictedResult = 'Home Win';
    else if (awayWinProb > drawProb && awayWinProb >= homeWinProb) predictedResult = 'Away Win';
    else if (homeWinProb === awayWinProb && homeWinProb > drawProb) predictedResult = 'Home Win';
  }

  // Extract comparison data
  const comp = pred?.comparison || {};
  const homeAtt = pct(comp.att?.home) / 100 || 0.5;
  const awayAtt = pct(comp.att?.away) / 100 || 0.5;
  const homeDef = pct(comp.def?.home) / 100 || 0.5;
  const awayDef = pct(comp.def?.away) / 100 || 0.5;
  const homeForm = pct(comp.form?.home) / 100 || 0.5;
  const awayForm = pct(comp.form?.away) / 100 || 0.5;
  const h2hHome = pct(comp.h2h?.home) / 100 || 0.5;
  const homePoissonStr = pct(comp.poisson_distribution?.home) / 100 || 0.5;
  const awayPoissonStr = pct(comp.poisson_distribution?.away) / 100 || 0.5;

  // Team strength scores
  const homeTeamScore =
    0.30 * homeAtt + 0.20 * homeDef + 0.15 * homeForm +
    0.10 * 0.6 + 0.10 * h2hHome + 0.15 * homePoissonStr;

  const awayTeamScore =
    0.30 * awayAtt + 0.20 * awayDef + 0.15 * awayForm +
    0.10 * 0.4 + 0.10 * (1 - h2hHome) + 0.15 * awayPoissonStr;

  // Goals market calculations
  const attackPower = homeAtt + awayAtt;
  const defWeakness = 2 - (homeDef + awayDef);
  const goalFactor = attackPower * 0.6 + defWeakness * 0.4;

  const over25Prob = Math.round(Math.min(92, Math.max(15, goalFactor * 50 + 5)));
  const over35Prob = Math.round(Math.min(80, Math.max(5, goalFactor * 35 - 5)));
  const bttsProb = Math.round(Math.min(88, Math.max(12, homeAtt * awayAtt * 200 + defWeakness * 15)));

  // Predicted score
  let homeGoals: number, awayGoals: number;

  if (hasApiPrediction) {
    const expectedHomeGoals = homeWinProb / 100 * 2.2 + homeAtt * 1.5 + (1 - awayDef) * 0.6;
    const expectedAwayGoals = awayWinProb / 100 * 2.2 + awayAtt * 1.5 + (1 - homeDef) * 0.6;

    homeGoals = Math.max(0, Math.round(expectedHomeGoals - 0.5));
    awayGoals = Math.max(0, Math.round(expectedAwayGoals - 0.5));

    if (predictedResult === 'Home Win' && homeGoals <= awayGoals) {
      homeGoals = awayGoals + 1;
    } else if (predictedResult === 'Away Win' && awayGoals <= homeGoals) {
      awayGoals = homeGoals + 1;
    } else if (predictedResult === 'Draw') {
      const avg = Math.round((homeGoals + awayGoals) / 2);
      homeGoals = avg;
      awayGoals = avg;
    }
  } else {
    homeGoals = 1;
    awayGoals = 1;
  }

  // Confidence score
  const probs = [homeWinProb, drawProb, awayWinProb].sort((a, b) => b - a);
  const gap = probs[0] - probs[1];
  const confidence = Math.round(Math.min(95, Math.max(35, gap * 1.5 + 40)));
  const confidenceLevel = confidence >= 80 ? 'high' : confidence >= 60 ? 'medium' : 'low';

  // Upset detection
  const isUpset =
    (predictedResult === 'Away Win' && awayWinProb < 35) ||
    (predictedResult === 'Home Win' && homeWinProb < 35) ||
    (gap < 5 && predictedResult !== 'Draw');

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
