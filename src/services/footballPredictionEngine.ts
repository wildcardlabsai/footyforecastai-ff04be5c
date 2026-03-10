// FootyForecast — Weighted Statistical Prediction Engine

export interface TeamData {
  name: string;
  xG: number;
  xGA: number;
  shotsOnTarget: number;
  recentForm: number; // 0-1 scale (wins/draws in last 5)
  homeAdvantage: number; // 0-1 scale
  headToHead: number; // 0-1 scale
  possessionEfficiency: number; // 0-1 scale
  conversionRate: number; // 0-1 scale
  defensiveErrors: number; // 0-1 scale (inverted, lower = better)
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
  confidenceLevel: 'high' | 'medium' | 'low';
  over25Prob: number;
  over35Prob: number;
  bttsProb: number;
  bttsResult: 'Yes' | 'No';
  isUpset: boolean;
  upsetConfidence?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
  reasoning: string;
  homeTeamScore: number;
  awayTeamScore: number;
  // Live match fields
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

// Calculate team strength score using weighted model
function calculateTeamScore(team: TeamData): number {
  return (
    0.30 * team.xG +
    0.20 * (1 - team.xGA) + // inverse xGA
    0.15 * team.shotsOnTarget +
    0.10 * team.recentForm +
    0.10 * team.homeAdvantage +
    0.05 * team.headToHead +
    0.05 * team.possessionEfficiency +
    0.05 * team.conversionRate
  );
}

// Logistic function for probability conversion
function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// Calculate match probabilities
export function predictMatch(home: TeamData, away: TeamData): {
  homeWin: number;
  draw: number;
  awayWin: number;
  over25: number;
  over35: number;
  btts: number;
  predictedScore: string;
  totalExpectedGoals: number;
} {
  const homeStrength = calculateTeamScore(home);
  const awayStrength = calculateTeamScore(away);
  
  const diff = (homeStrength - awayStrength) * 4;
  const homeWinRaw = logistic(diff + 0.3); // home bias
  const awayWinRaw = logistic(-diff - 0.3);
  
  // Normalize probabilities
  const drawBase = Math.max(0.15, 0.35 - Math.abs(diff) * 0.15);
  const total = homeWinRaw + awayWinRaw + drawBase;
  
  const homeWin = Math.round((homeWinRaw / total) * 100);
  const awayWin = Math.round((awayWinRaw / total) * 100);
  const draw = 100 - homeWin - awayWin;
  
  // Goals calculations
  const attackCombined = (home.xG + away.xG) / 2;
  const defenseCombined = (home.xGA + away.xGA) / 2;
  const totalExpectedGoals = (attackCombined * 2.8 + defenseCombined * 1.2 + home.shotsOnTarget * 0.3 + away.shotsOnTarget * 0.3);
  
  const over25 = Math.round(Math.min(95, Math.max(10, logistic((totalExpectedGoals - 2.3) * 2) * 100)));
  const over35 = Math.round(Math.min(85, Math.max(5, logistic((totalExpectedGoals - 3.2) * 2) * 100)));
  
  // BTTS
  const homeScoreProb = home.xG * 0.7 + home.conversionRate * 0.3;
  const awayScoreProb = away.xG * 0.7 + away.conversionRate * 0.3;
  const btts = Math.round(Math.min(90, Math.max(15, (homeScoreProb * awayScoreProb) * 250)));
  
  // Predicted score
  const homeGoals = Math.round(home.xG * 1.3 + home.conversionRate * 0.5);
  const awayGoals = Math.round(away.xG * 1.1 + away.conversionRate * 0.4);
  
  return {
    homeWin, draw, awayWin,
    over25, over35, btts,
    predictedScore: `${homeGoals}-${awayGoals}`,
    totalExpectedGoals,
  };
}

// Get confidence level from score
export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 80) return 'high';
  if (confidence >= 60) return 'medium';
  return 'low';
}

// Calculate confidence from probability gap
export function calculateConfidence(homeWin: number, draw: number, awayWin: number): number {
  const probs = [homeWin, draw, awayWin].sort((a, b) => b - a);
  const gap = probs[0] - probs[1];
  const modelAgreement = probs[0] > 50 ? 1.2 : 0.9;
  return Math.round(Math.min(100, Math.max(30, gap * 1.8 * modelAgreement + 35)));
}
