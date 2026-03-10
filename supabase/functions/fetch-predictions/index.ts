import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BASE = 'https://sports.bzzoiro.com/api';
const CACHE_MAX_AGE_MS = 4 * 60 * 60 * 1000; // 4 hours

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
    // Check cache first (unless forced)
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('cached_predictions')
        .select('predictions_data, fetched_at')
        .order('fetched_at', { ascending: false })
        .limit(1)
        .single();

      if (cached && (Date.now() - new Date(cached.fetched_at).getTime()) < CACHE_MAX_AGE_MS) {
        console.log('Serving cached predictions from', cached.fetched_at);
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

    // Fetch all upcoming predictions from BSD (paginated)
    let allResults: any[] = [];
    let url: string | null = `${BASE}/predictions/`;

    while (url && allResults.length < 100) {
      console.log(`Fetching: ${url}`);
      const res = await fetch(url, { headers: apiHeaders });
      if (!res.ok) {
        const errText = await res.text();
        console.error(`BSD API error [${res.status}]: ${errText}`);
        throw new Error(`BSD API error: ${res.status}`);
      }
      const data = await res.json();
      allResults = allResults.concat(data.results || []);
      url = data.next;
    }

    console.log(`Fetched ${allResults.length} predictions from BSD`);

    const predictions = allResults.map(mapBsdPrediction);

    // Save to cache
    await supabase.from('cached_predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('cached_predictions').insert({
      predictions_data: predictions,
      fetched_at: new Date().toISOString(),
    });

    console.log(`Cached ${predictions.length} predictions`);

    return new Response(JSON.stringify({ predictions, count: predictions.length, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error fetching predictions:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function mapBsdPrediction(pred: any) {
  const event = pred.event || {};
  const league = event.league || {};
  const homeTeamObj = event.home_team_obj;
  const awayTeamObj = event.away_team_obj;

  const API_KEY = Deno.env.get('BSD_API_KEY') || '';
  const IMG_BASE = 'https://sports.bzzoiro.com/img';

  const homeLogo = homeTeamObj?.api_id
    ? `${IMG_BASE}/team/${homeTeamObj.api_id}/?token=${API_KEY}`
    : undefined;
  const awayLogo = awayTeamObj?.api_id
    ? `${IMG_BASE}/team/${awayTeamObj.api_id}/?token=${API_KEY}`
    : undefined;
  const leagueLogo = league.api_id
    ? `${IMG_BASE}/league/${league.api_id}/?token=${API_KEY}`
    : undefined;

  const homeWinProb = Math.round(pred.prob_home_win || 33);
  const drawProb = Math.round(pred.prob_draw || 34);
  const awayWinProb = Math.round(pred.prob_away_win || 33);

  let predictedResult = 'Draw';
  if (pred.predicted_result === 'H') predictedResult = 'Home Win';
  else if (pred.predicted_result === 'A') predictedResult = 'Away Win';

  // BSD confidence is 0-1 scale
  const rawConf = pred.confidence || 0.5;
  const confidence = rawConf > 1 ? Math.round(rawConf) : Math.round(rawConf * 100);
  const confidenceLevel = confidence >= 80 ? 'high' : confidence >= 60 ? 'medium' : 'low';

  const predictedScore = pred.most_likely_score || '1-1';
  const [homeGoals, awayGoals] = predictedScore.split('-').map(Number);

  const over25Prob = Math.round(pred.prob_over_25 || 50);
  const over35Prob = Math.round(pred.prob_over_35 || 25);
  const bttsProb = Math.round(pred.prob_btts_yes || 50);

  const isUpset =
    (predictedResult === 'Away Win' && awayWinProb < 35) ||
    (predictedResult === 'Home Win' && homeWinProb < 35);

  const statusMap: Record<string, string> = {
    'notstarted': 'scheduled',
    'inprogress': 'live',
    '1st_half': 'live',
    '2nd_half': 'live',
    'halftime': 'halftime',
    'finished': 'finished',
  };

  const eventStatus = event.status || 'notstarted';
  const status = statusMap[eventStatus] || 'scheduled';

  // Build reasoning from recommendations
  const tips: string[] = [];
  if (pred.favorite_recommend) tips.push(`Favored: ${predictedResult}`);
  if (pred.over_25_recommend) tips.push('Over 2.5 recommended');
  if (pred.btts_recommend) tips.push('BTTS recommended');
  if (pred.over_35_recommend) tips.push('Over 3.5 recommended');
  const reasoning = tips.length > 0
    ? tips.join('. ') + '.'
    : `ML model prediction: ${predictedResult} (${confidence}% confidence)`;

  // Compute team scores from probabilities
  const homeTeamScore = (homeWinProb / 100) * 0.7 + (pred.expected_home_goals || 1) / 4 * 0.3;
  const awayTeamScore = (awayWinProb / 100) * 0.7 + (pred.expected_away_goals || 1) / 4 * 0.3;

  return {
    id: String(event.id || pred.id),
    fixtureId: event.api_id || event.id,
    league: league.name || 'Unknown',
    leagueCountry: league.country || '',
    leagueLogo,
    homeTeam: event.home_team || 'Home',
    awayTeam: event.away_team || 'Away',
    homeLogo,
    awayLogo,
    matchDate: event.event_date,
    homeScore: event.home_score ?? 0,
    awayScore: event.away_score ?? 0,
    homeWinProb,
    drawProb,
    awayWinProb,
    predictedResult,
    predictedScore,
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
    minute: event.current_minute || 0,
    status,
  };
}
