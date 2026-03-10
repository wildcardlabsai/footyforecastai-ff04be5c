import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE = "https://sports.bzzoiro.com/api";
const CACHE_MAX_AGE_MS = 2 * 60 * 60 * 1000;

const TARGET_LEAGUES = new Set([
  "premier league",
  "la liga",
  "bundesliga",
  "serie a",
  "champions league",
  "europa league",
  "conference league",
  "uefa champions league",
  "uefa europa league",
  "uefa europa conference league",
]);

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function normalize3Way(home: number, draw: number, away: number) {
  const total = home + draw + away;
  if (total <= 0) {
    return { home: 33.3, draw: 33.4, away: 33.3 };
  }

  const h = (home / total) * 100;
  const d = (draw / total) * 100;
  const a = (away / total) * 100;

  const rounded = {
    home: round1(h),
    draw: round1(d),
    away: round1(a),
  };

  const fix = round1(100 - (rounded.home + rounded.draw + rounded.away));
  rounded.draw = round1(rounded.draw + fix);

  return rounded;
}

function poissonPmf(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

function getDrawBoost(homeLambda: number, awayLambda: number): number {
  const gap = Math.abs(homeLambda - awayLambda);
  const total = homeLambda + awayLambda;

  let boost = 1;

  if (gap < 0.22) boost += 0.18;
  else if (gap < 0.4) boost += 0.1;

  if (total >= 1.9 && total <= 2.8) boost += 0.08;

  return boost;
}

function buildGoalMarkets(homeLambda: number, awayLambda: number) {
  let over25 = 0;
  let over35 = 0;
  let btts = 0;

  for (let h = 0; h <= 6; h++) {
    for (let a = 0; a <= 6; a++) {
      const p = poissonPmf(h, homeLambda) * poissonPmf(a, awayLambda);
      if (h + a >= 3) over25 += p;
      if (h + a >= 4) over35 += p;
      if (h > 0 && a > 0) btts += p;
    }
  }

  return {
    over25Prob: Math.round(over25 * 100),
    over35Prob: Math.round(over35 * 100),
    bttsProb: Math.round(btts * 100),
  };
}

function buildCorrectScores(homeLambda: number, awayLambda: number, count = 5) {
  const scores: { score: string; probability: number; raw: number }[] = [];

  for (let h = 0; h <= 6; h++) {
    for (let a = 0; a <= 6; a++) {
      const raw = poissonPmf(h, homeLambda) * poissonPmf(a, awayLambda);
      scores.push({
        score: `${h}-${a}`,
        probability: round1(raw * 100),
        raw,
      });
    }
  }

  return scores
    .sort((a, b) => b.raw - a.raw)
    .slice(0, count)
    .map(({ score, probability }) => ({ score, probability }));
}

function buildProbabilities(
  inputHomeWin: number,
  inputDraw: number,
  inputAwayWin: number,
  homeLambda: number,
  awayLambda: number,
  providerConfidence: number
) {
  let poissonHome = 0;
  let poissonDraw = 0;
  let poissonAway = 0;

  for (let h = 0; h <= 6; h++) {
    for (let a = 0; a <= 6; a++) {
      const p = poissonPmf(h, homeLambda) * poissonPmf(a, awayLambda);
      if (h > a) poissonHome += p;
      else if (h === a) poissonDraw += p;
      else poissonAway += p;
    }
  }

  poissonDraw *= getDrawBoost(homeLambda, awayLambda);

  const poissonNormalized = normalize3Way(poissonHome, poissonDraw, poissonAway);

  const providerNormalized = normalize3Way(
    inputHomeWin,
    inputDraw,
    inputAwayWin
  );

  const providerWeight = clamp(providerConfidence / 100, 0.35, 0.72);
  const poissonWeight = 1 - providerWeight;

  const mixed = normalize3Way(
    providerNormalized.home * providerWeight + poissonNormalized.home * poissonWeight,
    providerNormalized.draw * providerWeight + poissonNormalized.draw * poissonWeight,
    providerNormalized.away * providerWeight + poissonNormalized.away * poissonWeight
  );

  let predictedResult: "Home Win" | "Draw" | "Away Win" = "Draw";
  if (mixed.home > mixed.draw && mixed.home > mixed.away) predictedResult = "Home Win";
  else if (mixed.away > mixed.draw && mixed.away > mixed.home) predictedResult = "Away Win";

  return {
    homeWinProb: Math.round(mixed.home),
    drawProb: Math.round(mixed.draw),
    awayWinProb: Math.round(mixed.away),
    predictedResult,
  };
}

function getConfidenceBand(score: number) {
  if (score >= 85) return "elite";
  if (score >= 75) return "high";
  if (score >= 60) return "medium";
  if (score >= 45) return "low";
  return "very_risky";
}

function calculateConfidence(
  homeWin: number,
  draw: number,
  awayWin: number,
  providerConfidence: number,
  homeLambda: number,
  awayLambda: number
) {
  const probs = [homeWin, draw, awayWin].sort((a, b) => b - a);
  const gap = probs[0] - probs[1];
  const totalGoals = homeLambda + awayLambda;
  const xgGap = Math.abs(homeLambda - awayLambda);

  let score = 28;
  score += gap * 1.28;
  score += clamp(providerConfidence - 50, 0, 35) * 0.35;
  score += clamp(xgGap * 18, 0, 14);

  if (totalGoals >= 1.9 && totalGoals <= 3.4) score += 5;
  if (probs[0] >= 54) score += 6;
  if (draw >= 34 && gap < 7) score -= 8;

  score = Math.round(clamp(score, 18, 96));

  return {
    confidence: score,
    confidenceLevel: getConfidenceBand(score),
  };
}

function impliedProbabilityFromOdds(odds?: number | null): number | null {
  if (!odds || odds <= 1) return null;
  return round1((1 / odds) * 100);
}

function detectValue(
  predictedResult: "Home Win" | "Draw" | "Away Win",
  homeWinProb: number,
  drawProb: number,
  awayWinProb: number,
  oddsHome?: number | null,
  oddsDraw?: number | null,
  oddsAway?: number | null
) {
  const modelProb =
    predictedResult === "Home Win"
      ? homeWinProb
      : predictedResult === "Away Win"
      ? awayWinProb
      : drawProb;

  const impliedProb =
    predictedResult === "Home Win"
      ? impliedProbabilityFromOdds(oddsHome)
      : predictedResult === "Away Win"
      ? impliedProbabilityFromOdds(oddsAway)
      : impliedProbabilityFromOdds(oddsDraw);

  if (!impliedProb) {
    return { isValue: false, edge: 0 };
  }

  const edge = round1(modelProb - impliedProb);
  const isValue = edge >= 4.5;

  return { isValue, edge };
}

function calculateUpset(
  predictedResult: "Home Win" | "Draw" | "Away Win",
  homeWinProb: number,
  awayWinProb: number,
  confidence: number,
  oddsHome?: number | null,
  oddsAway?: number | null
) {
  const marketHome = impliedProbabilityFromOdds(oddsHome);
  const marketAway = impliedProbabilityFromOdds(oddsAway);

  const marketFavourite =
    marketHome != null && marketAway != null
      ? marketHome >= marketAway
        ? "Home Win"
        : "Away Win"
      : homeWinProb >= awayWinProb
      ? "Home Win"
      : "Away Win";

  if (predictedResult === "Draw") {
    const drawShock = Math.round(
      clamp((100 - Math.max(homeWinProb, awayWinProb)) * 0.85, 0, 100)
    );
    return {
      isUpset: drawShock >= 34,
      upsetScore: drawShock,
    };
  }

  if (predictedResult === marketFavourite) {
    return {
      isUpset: false,
      upsetScore: 0,
    };
  }

  const underdogProb = predictedResult === "Home Win" ? homeWinProb : awayWinProb;
  const volatility = 100 - confidence;

  const upsetScore = Math.round(
    clamp(underdogProb * 0.9 + volatility * 0.45, 0, 100)
  );

  return {
    isUpset: upsetScore >= 35,
    upsetScore,
  };
}

function calculatePickScore(
  confidence: number,
  homeWinProb: number,
  drawProb: number,
  awayWinProb: number,
  homeLambda: number,
  awayLambda: number
) {
  const probs = [homeWinProb, drawProb, awayWinProb].sort((a, b) => b - a);
  const gap = probs[0] - probs[1];
  const totalGoals = homeLambda + awayLambda;
  const xgGap = Math.abs(homeLambda - awayLambda);

  let score = 0;
  score += confidence * 0.56;
  score += clamp(gap, 0, 30) * 0.9;
  score += clamp(xgGap * 10, 0, 12);

  if (totalGoals >= 1.8 && totalGoals <= 3.6) score += 8;
  if (drawProb >= 34 && gap < 7) score -= 10;

  return Math.round(clamp(score / 1.1, 0, 100));
}

function buildReasoning(params: {
  predictedResult: "Home Win" | "Draw" | "Away Win";
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  confidence: number;
  over25Prob: number;
  bttsProb: number;
  isValue: boolean;
  valueEdge: number;
  isUpset: boolean;
  upsetScore: number;
  homeLambda: number;
  awayLambda: number;
}) {
  const bullets: string[] = [];
  const {
    predictedResult,
    homeWinProb,
    drawProb,
    awayWinProb,
    confidence,
    over25Prob,
    bttsProb,
    isValue,
    valueEdge,
    isUpset,
    upsetScore,
    homeLambda,
    awayLambda,
  } = params;

  if (predictedResult === "Home Win" && homeWinProb >= awayWinProb + 8) {
    bullets.push("Model gives the home side a clear edge");
  } else if (predictedResult === "Away Win" && awayWinProb >= homeWinProb + 8) {
    bullets.push("Model gives the away side a clear edge");
  } else if (predictedResult === "Draw") {
    bullets.push("Three-way probabilities are tight, keeping the draw live");
  } else {
    bullets.push("This projects as a competitive matchup with only a modest edge");
  }

  if (Math.abs(homeLambda - awayLambda) <= 0.22) {
    bullets.push("Expected goals are very close between the teams");
  } else if (homeLambda > awayLambda + 0.35) {
    bullets.push("Expected goals lean towards the home attack");
  } else if (awayLambda > homeLambda + 0.35) {
    bullets.push("Expected goals lean towards the away attack");
  }

  if (over25Prob >= 62) bullets.push("Goal profile supports over 2.5");
  else if (over25Prob <= 42) bullets.push("Goal profile leans under 2.5");

  if (bttsProb >= 58) bullets.push("Both teams project to contribute goals");
  else if (bttsProb <= 42) bullets.push("BTTS looks less likely than usual");

  if (isValue) bullets.push(`Value angle detected with a ${valueEdge}% edge`);
  if (isUpset) bullets.push(`Upset potential rates at ${upsetScore}%`);

  if (confidence >= 82) bullets.push("Confidence is reinforced by a strong separation in the probabilities");
  else if (confidence <= 44) bullets.push("Confidence is limited because the edge is not especially strong");

  return bullets.slice(0, 4).join(". ") + ".";
}

async function fetchAllPredictions(apiKey: string) {
  const apiHeaders = { Authorization: `Token ${apiKey}` };
  let allResults: any[] = [];
  let url: string | null = `${BASE}/predictions/`;

  while (url && allResults.length < 150) {
    const res = await fetch(url, { headers: apiHeaders });
    if (!res.ok) throw new Error(`BSD API error: ${res.status}`);
    const data = await res.json();
    allResults = allResults.concat(data.results || []);
    url = data.next;
  }

  return allResults;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let forceRefresh = false;
  try {
    const body = await req.json().catch(() => ({}));
    forceRefresh = body?.force === true || body?.time != null;
  } catch {
    // ignore
  }

  try {
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from("cached_predictions")
        .select("predictions_data, fetched_at")
        .order("fetched_at", { ascending: false })
        .limit(1)
        .single();

      if (
        cached &&
        Date.now() - new Date(cached.fetched_at).getTime() < CACHE_MAX_AGE_MS
      ) {
        const predictions = (cached.predictions_data as any[]) || [];
        return new Response(
          JSON.stringify({
            predictions,
            count: predictions.length,
            cached: true,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const apiKey = Deno.env.get("BSD_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "BSD_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allResults = await fetchAllPredictions(apiKey);

    const filtered = allResults.filter((pred: any) => {
      const leagueName = (pred.event?.league?.name || "").toLowerCase();
      return TARGET_LEAGUES.has(leagueName);
    });

    const predictions = filtered
      .map((pred: any) => mapEnhancedPrediction(pred, apiKey))
      .sort((a, b) => {
        if (b.pickScore !== a.pickScore) return b.pickScore - a.pickScore;
        return b.confidence - a.confidence;
      });

    await supabase
      .from("cached_predictions")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    await supabase.from("cached_predictions").insert({
      predictions_data: predictions,
      fetched_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        predictions,
        count: predictions.length,
        cached: false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function mapEnhancedPrediction(pred: any, apiKey: string) {
  const event = pred.event || {};
  const league = event.league || {};
  const homeTeamObj = event.home_team_obj;
  const awayTeamObj = event.away_team_obj;
  const IMG_BASE = "https://sports.bzzoiro.com/img";

  const homeLogo = homeTeamObj?.api_id
    ? `${IMG_BASE}/team/${homeTeamObj.api_id}/?token=${apiKey}`
    : undefined;
  const awayLogo = awayTeamObj?.api_id
    ? `${IMG_BASE}/team/${awayTeamObj.api_id}/?token=${apiKey}`
    : undefined;
  const leagueLogo = league.api_id
    ? `${IMG_BASE}/league/${league.api_id}/?token=${apiKey}`
    : undefined;

  const rawHomeWin = Number(pred.prob_home_win ?? 33);
  const rawDraw = Number(pred.prob_draw ?? 34);
  const rawAwayWin = Number(pred.prob_away_win ?? 33);

  const rawProviderConfidence = pred.confidence ?? 0.5;
  const providerConfidence =
    rawProviderConfidence <= 1
      ? Math.round(rawProviderConfidence * 100)
      : Math.round(rawProviderConfidence);

  let homeLambda = Number(
    pred.expected_home_goals ??
      pred.home_xg ??
      (rawHomeWin / 100) * 2.1 + 0.35
  );

  let awayLambda = Number(
    pred.expected_away_goals ??
      pred.away_xg ??
      (rawAwayWin / 100) * 2.1 + 0.3
  );

  homeLambda = clamp(homeLambda, 0.2, 3.8);
  awayLambda = clamp(awayLambda, 0.2, 3.6);

  const result = buildProbabilities(
    rawHomeWin,
    rawDraw,
    rawAwayWin,
    homeLambda,
    awayLambda,
    providerConfidence
  );

  const goalMarkets = buildGoalMarkets(homeLambda, awayLambda);
  const topScores = buildCorrectScores(homeLambda, awayLambda, 5);
  const predictedScore = topScores[0]?.score || pred.most_likely_score || "1-1";

  const confidenceResult = calculateConfidence(
    result.homeWinProb,
    result.drawProb,
    result.awayWinProb,
    providerConfidence,
    homeLambda,
    awayLambda
  );

  const valueResult = detectValue(
    result.predictedResult,
    result.homeWinProb,
    result.drawProb,
    result.awayWinProb,
    pred.odds_home,
    pred.odds_draw,
    pred.odds_away
  );

  const upsetResult = calculateUpset(
    result.predictedResult,
    result.homeWinProb,
    result.awayWinProb,
    confidenceResult.confidence,
    pred.odds_home,
    pred.odds_away
  );

  const pickScore = calculatePickScore(
    confidenceResult.confidence,
    result.homeWinProb,
    result.drawProb,
    result.awayWinProb,
    homeLambda,
    awayLambda
  );

  const reasoning = buildReasoning({
    predictedResult: result.predictedResult,
    homeWinProb: result.homeWinProb,
    drawProb: result.drawProb,
    awayWinProb: result.awayWinProb,
    confidence: confidenceResult.confidence,
    over25Prob: goalMarkets.over25Prob,
    bttsProb: goalMarkets.bttsProb,
    isValue: valueResult.isValue,
    valueEdge: valueResult.edge,
    isUpset: upsetResult.isUpset,
    upsetScore: upsetResult.upsetScore,
    homeLambda,
    awayLambda,
  });

  const statusMap: Record<string, string> = {
    notstarted: "scheduled",
    inprogress: "live",
    "1st_half": "live",
    "2nd_half": "live",
    halftime: "halftime",
    finished: "finished",
  };

  const status = statusMap[event.status || "notstarted"] || "scheduled";

  return {
    id: String(event.id || pred.id),
    fixtureId: event.api_id || event.id,
    league: league.name || "Unknown",
    leagueCountry: league.country || "",
    leagueLogo,
    homeTeam: event.home_team || "Home",
    awayTeam: event.away_team || "Away",
    homeLogo,
    awayLogo,
    matchDate: event.event_date,
    homeScore: event.home_score ?? 0,
    awayScore: event.away_score ?? 0,
    homeWinProb: result.homeWinProb,
    drawProb: result.drawProb,
    awayWinProb: result.awayWinProb,
    predictedResult: result.predictedResult,
    predictedScore,
    confidence: confidenceResult.confidence,
    confidenceLevel: confidenceResult.confidenceLevel,
    over25Prob: goalMarkets.over25Prob,
    over35Prob: goalMarkets.over35Prob,
    bttsProb: goalMarkets.bttsProb,
    bttsResult: goalMarkets.bttsProb >= 50 ? "Yes" : "No",
    isUpset: upsetResult.isUpset,
    upsetScore: upsetResult.upsetScore,
    upsetConfidence: upsetResult.isUpset ? upsetResult.upsetScore : undefined,
    riskLevel: upsetResult.isUpset
      ? upsetResult.upsetScore > 60
        ? "High"
        : upsetResult.upsetScore > 42
        ? "Medium"
        : "Low"
      : undefined,
    isValue: valueResult.isValue,
    valueEdge: valueResult.isValue ? valueResult.edge : undefined,
    topScores,
    pickScore,
    reasoning,
    homeTeamScore: round1(result.homeWinProb * 0.65 + homeLambda * 8),
    awayTeamScore: round1(result.awayWinProb * 0.65 + awayLambda * 8),
    minute: event.current_minute || 0,
    status,
  };
}
