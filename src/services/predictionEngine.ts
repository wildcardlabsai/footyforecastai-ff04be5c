// FootyForecast — Enhanced Pre-Match Prediction Engine

export interface TeamData {
  name: string;
  xG: number;
  xGA: number;
  shotsOnTarget: number;
  recentForm: number; // 0-100
  homeAdvantage: number; // 0-100
  headToHead: number; // -100 to 100, positive = favours this team
  possessionEfficiency: number; // 0-100
  conversionRate: number; // 0-100
  defensiveErrors: number; // 0-100, higher = worse
}

export interface CorrectScorePrediction {
  score: string;
  probability: number;
}

export interface MatchPrediction {
  id: string;
  league: string;
  leagueCountry?: string;
  leagueLogo?: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  matchDate: string;
  homeScore: number;
  awayScore: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  predictedResult: 'Home Win' | 'Draw' | 'Away Win';
  predictedScore: string;
  confidence: number;
  confidenceLevel: 'elite' | 'high' | 'medium' | 'low' | 'very_risky';
  over25Prob: number;
  over35Prob: number;
  bttsProb: number;
  bttsResult: 'Yes' | 'No';
  isUpset: boolean;
  upsetScore?: number;
  upsetConfidence?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
  isValue?: boolean;
  valueEdge?: number;
  topScores?: CorrectScorePrediction[];
  pickScore?: number;
  reasoning: string;
  homeTeamScore: number;
  awayTeamScore: number;
  minute?: number;
  status?: 'live' | 'scheduled' | 'finished' | 'halftime';
  isLive?: boolean;
}

export interface GoalsMarketPrediction {
  matchId: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  over25Prob: number;
  over35Prob: number;
  bttsProb: number;
  totalGoalsExpected: number;
  category: 'high_scoring' | 'low_scoring' | 'balanced';
}

export interface PredictMatchResult {
  homeWin: number;
  draw: number;
  awayWin: number;
  over25: number;
  over35: number;
  btts: number;
  predictedScore: string;
  totalExpectedGoals: number;
  confidence: number;
  confidenceLevel: 'elite' | 'high' | 'medium' | 'low' | 'very_risky';
  topScores: CorrectScorePrediction[];
  predictedResult: 'Home Win' | 'Draw' | 'Away Win';
  isUpset: boolean;
  upsetScore?: number;
  valueEdge?: number;
  isValue?: boolean;
  reasoning: string[];
  homeLambda: number;
  awayLambda: number;
  pickScore: number;
}

// -----------------------------
// Helpers
// -----------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function poissonPmf(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

function normalizeProbs(home: number, draw: number, away: number) {
  const total = home + draw + away;
  if (total <= 0) {
    return { home: 33.3, draw: 33.4, away: 33.3 };
  }

  const normalized = {
    home: (home / total) * 100,
    draw: (draw / total) * 100,
    away: (away / total) * 100,
  };

  const rounded = {
    home: round1(normalized.home),
    draw: round1(normalized.draw),
    away: round1(normalized.away),
  };

  const fix = round1(100 - (rounded.home + rounded.draw + rounded.away));
  rounded.draw = round1(rounded.draw + fix);

  return rounded;
}

function topCorrectScores(homeLambda: number, awayLambda: number, count = 5): CorrectScorePrediction[] {
  const scores: CorrectScorePrediction[] = [];

  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      const probability = poissonPmf(homeLambda, h) * poissonPmf(awayLambda, a) * 100;
      scores.push({
        score: `${h}-${a}`,
        probability: round1(probability),
      });
    }
  }

  return scores.sort((a, b) => b.probability - a.probability).slice(0, count);
}

function getDrawAdjustment(homeLambda: number, awayLambda: number): number {
  const gap = Math.abs(homeLambda - awayLambda);
  const total = homeLambda + awayLambda;

  let boost = 1;

  if (gap < 0.25) boost += 0.16;
  else if (gap < 0.45) boost += 0.1;

  if (total >= 1.9 && total <= 2.8) boost += 0.08;

  return boost;
}

function getConfidenceLabel(level: number): 'elite' | 'high' | 'medium' | 'low' | 'very_risky' {
  if (level >= 85) return 'elite';
  if (level >= 75) return 'high';
  if (level >= 60) return 'medium';
  if (level >= 45) return 'low';
  return 'very_risky';
}

// -----------------------------
// Public helpers
// -----------------------------

export function getConfidenceLabelText(level: string): string {
  switch (level) {
    case 'elite':
      return 'Elite';
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    case 'very_risky':
      return 'Very Risky';
    default:
      return level;
  }
}

export function getConfidenceLevel(confidence: number): 'elite' | 'high' | 'medium' | 'low' | 'very_risky' {
  return getConfidenceLabel(confidence);
}

export function calculateConfidence(homeWin: number, draw: number, awayWin: number): number {
  const probs = [homeWin, draw, awayWin].sort((a, b) => b - a);
  const gap = probs[0] - probs[1];
  const dominanceBonus = probs[0] >= 55 ? 8 : probs[0] >= 48 ? 4 : 0;
  const score = 35 + gap * 1.35 + dominanceBonus;
  return Math.round(clamp(score, 28, 96));
}

// -----------------------------
// Core model
// -----------------------------

function buildAttackRating(team: TeamData): number {
  const xgComponent = clamp(team.xG / 1.35, 0.45, 1.9);
  const sotComponent = clamp(team.shotsOnTarget / 4.5, 0.55, 1.6);
  const conversionComponent = clamp(team.conversionRate / 12, 0.65, 1.45);
  const possessionComponent = clamp(team.possessionEfficiency / 55, 0.75, 1.25);
  const formComponent = clamp(team.recentForm / 60, 0.65, 1.35);

  return (
    xgComponent * 0.42 +
    sotComponent * 0.2 +
    conversionComponent * 0.16 +
    possessionComponent * 0.1 +
    formComponent * 0.12
  );
}

function buildDefensiveWeakness(team: TeamData): number {
  const xgaComponent = clamp(team.xGA / 1.25, 0.45, 1.9);
  const errorsComponent = clamp(team.defensiveErrors / 10, 0.6, 1.8);
  const inverseFormComponent = clamp((100 - team.recentForm) / 55, 0.55, 1.4);

  return (
    xgaComponent * 0.6 +
    errorsComponent * 0.25 +
    inverseFormComponent * 0.15
  );
}

function buildExpectedGoals(home: TeamData, away: TeamData) {
  const homeAttack = buildAttackRating(home);
  const awayAttack = buildAttackRating(away);

  const homeDefWeakness = buildDefensiveWeakness(home);
  const awayDefWeakness = buildDefensiveWeakness(away);

  const homeAdvantageBoost = clamp(home.homeAdvantage / 100, 0, 0.3);
  const headToHeadBoostHome = clamp(home.headToHead / 250, -0.15, 0.15);
  const headToHeadBoostAway = clamp(away.headToHead / 250, -0.15, 0.15);

  let homeLambda =
    1.08 * homeAttack * awayDefWeakness +
    homeAdvantageBoost +
    headToHeadBoostHome;

  let awayLambda =
    0.96 * awayAttack * homeDefWeakness +
    headToHeadBoostAway;

  homeLambda = clamp(homeLambda, 0.2, 3.4);
  awayLambda = clamp(awayLambda, 0.2, 3.2);

  return { homeLambda, awayLambda };
}

function calculateGoalMarkets(homeLambda: number, awayLambda: number) {
  let over25 = 0;
  let over35 = 0;
  let btts = 0;

  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      const p = poissonPmf(homeLambda, h) * poissonPmf(awayLambda, a);

      if (h + a >= 3) over25 += p;
      if (h + a >= 4) over35 += p;
      if (h > 0 && a > 0) btts += p;
    }
  }

  return {
    over25: round1(over25 * 100),
    over35: round1(over35 * 100),
    btts: round1(btts * 100),
  };
}

function calculateMatchResult(homeLambda: number, awayLambda: number) {
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      const p = poissonPmf(homeLambda, h) * poissonPmf(awayLambda, a);

      if (h > a) homeWin += p;
      else if (h === a) draw += p;
      else awayWin += p;
    }
  }

  draw *= getDrawAdjustment(homeLambda, awayLambda);

  const normalized = normalizeProbs(homeWin, draw, awayWin);

  let predictedResult: 'Home Win' | 'Draw' | 'Away Win' = 'Draw';
  if (normalized.home > normalized.draw && normalized.home > normalized.away) {
    predictedResult = 'Home Win';
  } else if (normalized.away > normalized.draw && normalized.away > normalized.home) {
    predictedResult = 'Away Win';
  }

  return {
    homeWin: normalized.home,
    draw: normalized.draw,
    awayWin: normalized.away,
    predictedResult,
  };
}

function calculateUpset(
  predictedResult: 'Home Win' | 'Draw' | 'Away Win',
  homeWin: number,
  awayWin: number,
  confidence: number
) {
  const favourite = homeWin >= awayWin ? 'Home Win' : 'Away Win';
  const underdogProb = favourite === 'Home Win' ? awayWin : homeWin;

  if (predictedResult === 'Draw') {
    const drawShock = clamp((100 - Math.max(homeWin, awayWin)) * 0.8, 0, 100);
    return {
      isUpset: drawShock >= 32,
      upsetScore: Math.round(drawShock),
    };
  }

  if (predictedResult === favourite) {
    return {
      isUpset: false,
      upsetScore: 0,
    };
  }

  const volatility = 100 - confidence;
  const upsetScore = Math.round(
    clamp(underdogProb * 1.1 + volatility * 0.45, 0, 100)
  );

  return {
    isUpset: upsetScore >= 35,
    upsetScore,
  };
}

function calculateValueEdge(
  predictedResult: 'Home Win' | 'Draw' | 'Away Win',
  homeWin: number,
  draw: number,
  awayWin: number
) {
  const marketBaseline = 33.3;

  const modelProb =
    predictedResult === 'Home Win'
      ? homeWin
      : predictedResult === 'Away Win'
      ? awayWin
      : draw;

  const edge = round1(modelProb - marketBaseline);

  return {
    isValue: edge >= 7,
    valueEdge: edge,
  };
}

function buildReasoning(
  home: TeamData,
  away: TeamData,
  result: 'Home Win' | 'Draw' | 'Away Win',
  homeLambda: number,
  awayLambda: number,
  over25: number,
  btts: number
): string[] {
  const reasons: string[] = [];

  if (home.xG > away.xG + 0.35) reasons.push(`${home.name} carry the stronger attacking xG profile`);
  if (away.xG > home.xG + 0.35) reasons.push(`${away.name} carry the stronger attacking xG profile`);

  if (home.recentForm > away.recentForm + 10) reasons.push(`${home.name} have the stronger recent form`);
  if (away.recentForm > home.recentForm + 10) reasons.push(`${away.name} have the stronger recent form`);

  if (home.homeAdvantage >= 60) reasons.push(`${home.name} get a meaningful home edge`);

  if (away.defensiveErrors >= 18) reasons.push(`${away.name} look vulnerable defensively`);
  if (home.defensiveErrors >= 18) reasons.push(`${home.name} look vulnerable defensively`);

  if (over25 >= 62) reasons.push(`The goal model leans towards over 2.5 goals`);
  if (btts >= 58) reasons.push(`Both teams project to create enough for BTTS`);
  if (Math.abs(homeLambda - awayLambda) <= 0.22) reasons.push(`Expected goals are close, which keeps the draw live`);

  if (reasons.length === 0) {
    reasons.push(`The model sees a balanced matchup with only a small edge`);
  }

  if (result === 'Home Win' && !reasons.some(r => r.includes(home.name))) {
    reasons.unshift(`${home.name} rate slightly better in the core model`);
  }

  if (result === 'Away Win' && !reasons.some(r => r.includes(away.name))) {
    reasons.unshift(`${away.name} rate slightly better in the core model`);
  }

  if (result === 'Draw' && !reasons.some(r => r.includes('draw'))) {
    reasons.unshift(`The matchup is tight across attack, defence and recent form`);
  }

  return reasons.slice(0, 4);
}

function calculatePickScore(
  confidence: number,
  bestProb: number,
  secondProb: number,
  totalGoalsExpected: number
): number {
  const separation = bestProb - secondProb;
  const clarity = clamp(separation / 20, 0, 1);
  const confidenceFactor = confidence / 100;
  const goalsStability = totalGoalsExpected >= 1.8 && totalGoalsExpected <= 3.6 ? 1 : 0.75;

  return Math.round(
    clamp(
      (confidenceFactor * 0.55 + clarity * 0.3 + goalsStability * 0.15) * 100,
      0,
      100
    )
  );
}

// -----------------------------
// Main export
// -----------------------------

export function predictMatch(home: TeamData, away: TeamData): PredictMatchResult {
  const { homeLambda, awayLambda } = buildExpectedGoals(home, away);
  const totalExpectedGoals = round1(homeLambda + awayLambda);

  const result = calculateMatchResult(homeLambda, awayLambda);
  const goals = calculateGoalMarkets(homeLambda, awayLambda);
  const topScores = topCorrectScores(homeLambda, awayLambda, 5);

  const confidence = calculateConfidence(result.homeWin, result.draw, result.awayWin);
  const confidenceLevel = getConfidenceLabel(confidence);

  const upset = calculateUpset(result.predictedResult, result.homeWin, result.awayWin, confidence);
  const value = calculateValueEdge(result.predictedResult, result.homeWin, result.draw, result.awayWin);

  const reasoning = buildReasoning(
    home,
    away,
    result.predictedResult,
    homeLambda,
    awayLambda,
    goals.over25,
    goals.btts
  );

  const probs = [result.homeWin, result.draw, result.awayWin].sort((a, b) => b - a);
  const pickScore = calculatePickScore(confidence, probs[0], probs[1], totalExpectedGoals);

  return {
    homeWin: result.homeWin,
    draw: result.draw,
    awayWin: result.awayWin,
    over25: goals.over25,
    over35: goals.over35,
    btts: goals.btts,
    predictedScore: topScores[0]?.score ?? '1-1',
    totalExpectedGoals,
    confidence,
    confidenceLevel,
    topScores,
    predictedResult: result.predictedResult,
    isUpset: upset.isUpset,
    upsetScore: upset.upsetScore,
    valueEdge: value.valueEdge,
    isValue: value.isValue,
    reasoning,
    homeLambda: round1(homeLambda),
    awayLambda: round1(awayLambda),
    pickScore,
  };
}
