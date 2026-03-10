import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BASE = 'https://sports.bzzoiro.com/api';
const CACHE_MAX_AGE_MS = 4 * 60 * 60 * 1000;

const TARGET_LEAGUES = new Set([
  'premier league', 'la liga', 'bundesliga', 'serie a',
  'champions league', 'europa league', 'conference league',
  'uefa champions league', 'uefa europa league', 'uefa europa conference league',
]);

// --- Poisson distribution helper ---
function poissonPmf(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

function topCorrectScores(homeLambda: number, awayLambda: number, count = 3) {
  const scores: { score: string; prob: number }[] = [];
  for (let h = 0; h <= 6; h++) {
    for (let a = 0; a <= 6; a++) {
      scores.push({ score: `${h}-${a}`, prob: poissonPmf(h, homeLambda) * poissonPmf(a, awayLambda) });
    }
  }
  scores.sort((a, b) => b.prob - a.prob);
  return scores.slice(0, count).map(s => ({ score: s.score, probability: Math.round(s.prob * 100) }));
}

// --- Enhanced confidence scoring (5-tier) ---
function calculateEnhancedConfidence(
  homeWin: number, draw: number, awayWin: number,
  bsdConfidence: number,
) {
  const probs = [homeWin, draw, awayWin].sort((a, b) => b - a);
  const probabilityGap = (probs[0] - probs[1]) / 100;
  const modelAgreement = probs[0] > 50 ? 1.0 : probs[0] > 40 ? 0.8 : 0.6;
  const calibrationStrength = bsdConfidence / 100;
  const teamConsistency = Math.min(1, (probs[0] - probs[2]) / 60);

  const score = Math.round(
    (0.35 * probabilityGap +
     0.25 * modelAgreement +
     0.20 * calibrationStrength +
     0.10 * teamConsistency +
     0.10 * (bsdConfidence / 100)) * 100
  );

  const clamped = Math.min(100, Math.max(0, score));

  let band: string;
  if (clamped >= 85) band = 'elite';
  else if (clamped >= 75) band = 'high';
  else if (clamped >= 60) band = 'medium';
  else if (clamped >= 45) band = 'low';
  else band = 'very_risky';

  return { confidence: clamped, confidenceLevel: band };
}

// --- Value detection ---
function detectValue(modelProb: number, impliedProb: number | null) {
  if (!impliedProb || impliedProb <= 0) return { isValue: false, edge: 0 };
  const edge = modelProb - impliedProb;
  return { isValue: edge > 5, edge: Math.round(edge * 10) / 10 };
}

// --- Upset scoring ---
function calculateUpsetScore(
  predictedResult: string,
  homeWin: number, awayWin: number,
  confidence: number,
) {
  const favourite = homeWin > awayWin ? 'Home Win' : 'Away Win';
  const underdog = favourite === 'Home Win' ? 'Away Win' : 'Home Win';
  const underdogProb = favourite === 'Home Win' ? awayWin : homeWin;

  if (predictedResult !== underdog && underdogProb < 30) return { isUpset: false, upsetScore: 0 };

  const modelEdge = underdogProb / 100;
  const favouriteInstability = 1 - (Math.max(homeWin, awayWin) / 100);
  const probGap = Math.abs(homeWin - awayWin) / 100;

  const upsetScore = Math.round(
    (0.40 * modelEdge +
     0.25 * favouriteInstability +
     0.20 * (1 - probGap) +
     0.15 * (confidence < 50 ? 0.8 : 0.4)) * 100
  );

  return { isUpset: upsetScore >= 35, upsetScore: Math.min(100, upsetScore) };
}

// --- Pick of the Day scoring ---
function calculatePickScore(confidence: number, homeWin: number, draw: number, awayWin: number, xgAdv: number) {
  const probs = [homeWin, draw, awayWin].sort((a, b) => b - a);
  const probGap = (probs[0] - probs[1]) / 100;
  return Math.round(
    (0.50 * (confidence / 100) +
     0.20 * probGap +
     0.15 * Math.min(1, confidence / 80) +
     0.15 * Math.min(1, xgAdv)) * 100
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let forceRefresh = false;
  try {
    const body = await req.json().catch(() => ({}));
    forceRefresh = body?.force === true || body?.time != null;
  } catch { /* ignore */ }

  try {
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('cached_predictions')
        .select('predictions_data, fetched_at')
        .order('fetched_at', { ascending: false })
        .limit(1)
        .single();

      if (cached && (Date.now() - new Date(cached.fetched_at).getTime()) < CACHE_MAX_AGE_MS) {
        const predictions = cached.predictions_data as any[];
        return new Response(JSON.stringify({ predictions, count: predictions.length, cached: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const API_KEY = Deno.env.get('BSD_API_KEY');
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'BSD_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiHeaders = { 'Authorization': `Token ${API_KEY}` };

    let allResults: any[] = [];
    let url: string | null = `${BASE}/predictions/`;

    while (url && allResults.length < 100) {
      const res = await fetch(url, { headers: apiHeaders });
      if (!res.ok) throw new Error(`BSD API error: ${res.status}`);
      const data = await res.json();
      allResults = allResults.concat(data.results || []);
      url = data.next;
    }

    const filtered = allResults.filter((pred: any) => {
      const leagueName = (pred.event?.league?.name || '').toLowerCase();
      return TARGET_LEAGUES.has(leagueName);
    });

    const predictions = filtered.map((pred: any) => mapEnhancedPrediction(pred, API_KEY));

    // Save to cache
    await supabase.from('cached_predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('cached_predictions').insert({
      predictions_data: predictions,
      fetched_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ predictions, count: predictions.length, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function mapEnhancedPrediction(pred: any, apiKey: string) {
  const event = pred.event || {};
  const league = event.league || {};
  const homeTeamObj = event.home_team_obj;
  const awayTeamObj = event.away_team_obj;
  const IMG_BASE = 'https://sports.bzzoiro.com/img';

  const homeLogo = homeTeamObj?.api_id ? `${IMG_BASE}/team/${homeTeamObj.api_id}/?token=${apiKey}` : undefined;
  const awayLogo = awayTeamObj?.api_id ? `${IMG_BASE}/team/${awayTeamObj.api_id}/?token=${apiKey}` : undefined;
  const leagueLogo = league.api_id ? `${IMG_BASE}/league/${league.api_id}/?token=${apiKey}` : undefined;

  const homeWinProb = Math.round(pred.prob_home_win || 33);
  const drawProb = Math.round(pred.prob_draw || 34);
  const awayWinProb = Math.round(pred.prob_away_win || 33);

  let predictedResult: string = 'Draw';
  if (pred.predicted_result === 'H') predictedResult = 'Home Win';
  else if (pred.predicted_result === 'A') predictedResult = 'Away Win';

  // BSD confidence
  const rawConf = pred.confidence ?? 0.5;
  const bsdConfidence = rawConf <= 1 ? Math.round(rawConf * 100) : Math.round(rawConf);

  // Enhanced confidence (5-tier)
  const { confidence, confidenceLevel } = calculateEnhancedConfidence(homeWinProb, drawProb, awayWinProb, bsdConfidence);

  // Poisson correct score
  const homeLambda = pred.expected_home_goals ?? (homeWinProb / 100 * 2.5 + 0.3);
  const awayLambda = pred.expected_away_goals ?? (awayWinProb / 100 * 2.5 + 0.3);
  const topScores = topCorrectScores(homeLambda, awayLambda, 3);
  const predictedScore = topScores[0]?.score || pred.most_likely_score || '1-1';

  // Goals markets
  const over25Prob = Math.round(pred.prob_over_25 || 50);
  const over35Prob = Math.round(pred.prob_over_35 || 25);
  const bttsProb = Math.round(pred.prob_btts_yes || 50);

  // Value detection (use implied odds if available)
  const impliedHomeOdds = pred.odds_home ? (1 / pred.odds_home) * 100 : null;
  const bestProb = Math.max(homeWinProb, drawProb, awayWinProb);
  const bestImplied = predictedResult === 'Home Win' ? impliedHomeOdds :
                      predictedResult === 'Away Win' ? (pred.odds_away ? (1 / pred.odds_away) * 100 : null) :
                      (pred.odds_draw ? (1 / pred.odds_draw) * 100 : null);
  const { isValue, edge } = detectValue(bestProb, bestImplied);

  // Upset scoring
  const { isUpset, upsetScore } = calculateUpsetScore(predictedResult, homeWinProb, awayWinProb, confidence);

  // Pick score
  const xgAdv = Math.abs(homeLambda - awayLambda) / 2;
  const pickScore = calculatePickScore(confidence, homeWinProb, drawProb, awayWinProb, xgAdv);

  // Reasoning
  const tips: string[] = [];
  if (pred.favorite_recommend) tips.push(`Favored: ${predictedResult}`);
  if (pred.over_25_recommend) tips.push('Over 2.5 recommended');
  if (pred.btts_recommend) tips.push('BTTS recommended');
  if (isValue) tips.push(`Value pick (${edge}% edge)`);
  if (isUpset) tips.push(`Upset potential (${upsetScore}%)`);
  const reasoning = tips.length > 0
    ? tips.join('. ') + '.'
    : `ML prediction: ${predictedResult} (${confidence}% confidence)`;

  const statusMap: Record<string, string> = {
    'notstarted': 'scheduled', 'inprogress': 'live', '1st_half': 'live',
    '2nd_half': 'live', 'halftime': 'halftime', 'finished': 'finished',
  };
  const status = statusMap[event.status || 'notstarted'] || 'scheduled';

  return {
    id: String(event.id || pred.id),
    fixtureId: event.api_id || event.id,
    league: league.name || 'Unknown',
    leagueCountry: league.country || '',
    leagueLogo,
    homeTeam: event.home_team || 'Home',
    awayTeam: event.away_team || 'Away',
    homeLogo, awayLogo,
    matchDate: event.event_date,
    homeScore: event.home_score ?? 0,
    awayScore: event.away_score ?? 0,
    homeWinProb, drawProb, awayWinProb,
    predictedResult, predictedScore,
    confidence, confidenceLevel,
    over25Prob, over35Prob, bttsProb,
    bttsResult: bttsProb >= 50 ? 'Yes' : 'No',
    isUpset, upsetScore,
    upsetConfidence: isUpset ? upsetScore : undefined,
    riskLevel: isUpset ? (upsetScore > 60 ? 'High' : upsetScore > 40 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low' : undefined,
    isValue, valueEdge: isValue ? edge : undefined,
    topScores,
    pickScore,
    reasoning,
    homeTeamScore: (homeWinProb / 100) * 0.7 + homeLambda / 4 * 0.3,
    awayTeamScore: (awayWinProb / 100) * 0.7 + awayLambda / 4 * 0.3,
    minute: event.current_minute || 0,
    status,
  };
}
