// FootyForecast — Demo Prediction Data
import { MatchPrediction, GoalsMarketPrediction, getConfidenceLevel, calculateConfidence } from './footballPredictionEngine';

const DEMO_PREDICTIONS: MatchPrediction[] = [
  {
    id: 'fp1', league: 'Premier League', leagueCountry: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    homeTeam: 'Arsenal', awayTeam: 'Brighton', matchDate: new Date().toISOString(),
    homeScore: 0, awayScore: 0,
    homeWinProb: 72, drawProb: 16, awayWinProb: 12,
    predictedResult: 'Home Win', predictedScore: '2-0', confidence: 82,
    confidenceLevel: 'high', over25Prob: 58, over35Prob: 28, bttsProb: 45,
    bttsResult: 'No', isUpset: false, reasoning: 'Arsenal dominant at home with strong xG and defensive record.',
    homeTeamScore: 0.78, awayTeamScore: 0.45, status: 'scheduled',
  },
  {
    id: 'fp2', league: 'Premier League', leagueCountry: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    homeTeam: 'Liverpool', awayTeam: 'Man City', matchDate: new Date().toISOString(),
    homeScore: 0, awayScore: 0,
    homeWinProb: 42, drawProb: 28, awayWinProb: 30,
    predictedResult: 'Home Win', predictedScore: '2-1', confidence: 54,
    confidenceLevel: 'low', over25Prob: 72, over35Prob: 42, bttsProb: 75,
    bttsResult: 'Yes', isUpset: false, reasoning: 'Tight contest expected. Liverpool edge at Anfield with high xG on both sides.',
    homeTeamScore: 0.82, awayTeamScore: 0.79, status: 'scheduled',
  },
  {
    id: 'fp3', league: 'La Liga', leagueCountry: '🇪🇸',
    homeTeam: 'Barcelona', awayTeam: 'Valencia', matchDate: new Date().toISOString(),
    homeScore: 0, awayScore: 0,
    homeWinProb: 77, drawProb: 14, awayWinProb: 9,
    predictedResult: 'Home Win', predictedScore: '3-1', confidence: 85,
    confidenceLevel: 'high', over25Prob: 78, over35Prob: 48, bttsProb: 62,
    bttsResult: 'Yes', isUpset: false, reasoning: 'Barcelona outstanding offensive form. High-scoring game expected.',
    homeTeamScore: 0.88, awayTeamScore: 0.38, status: 'scheduled',
  },
  {
    id: 'fp4', league: 'Serie A', leagueCountry: '🇮🇹',
    homeTeam: 'Roma', awayTeam: 'Atalanta', matchDate: new Date().toISOString(),
    homeScore: 0, awayScore: 0,
    homeWinProb: 28, drawProb: 33, awayWinProb: 39,
    predictedResult: 'Draw', predictedScore: '1-1', confidence: 61,
    confidenceLevel: 'medium', over25Prob: 52, over35Prob: 22, bttsProb: 58,
    bttsResult: 'Yes', isUpset: false, reasoning: 'Evenly matched sides. Atalanta slight edge but Roma strong at home.',
    homeTeamScore: 0.55, awayTeamScore: 0.62, status: 'scheduled',
  },
  {
    id: 'fp5', league: 'Champions League', leagueCountry: '🏆',
    homeTeam: 'Real Madrid', awayTeam: 'PSG', matchDate: new Date().toISOString(),
    homeScore: 0, awayScore: 0,
    homeWinProb: 48, drawProb: 26, awayWinProb: 26,
    predictedResult: 'Home Win', predictedScore: '2-1', confidence: 58,
    confidenceLevel: 'low', over25Prob: 68, over35Prob: 35, bttsProb: 70,
    bttsResult: 'Yes', isUpset: false, reasoning: 'Elite clash. Madrid home advantage and Champions League pedigree tips the balance.',
    homeTeamScore: 0.85, awayTeamScore: 0.80, status: 'scheduled',
  },
  {
    id: 'fp6', league: 'Bundesliga', leagueCountry: '🇩🇪',
    homeTeam: 'Bayern Munich', awayTeam: 'RB Leipzig', matchDate: new Date().toISOString(),
    homeScore: 0, awayScore: 0,
    homeWinProb: 65, drawProb: 20, awayWinProb: 15,
    predictedResult: 'Home Win', predictedScore: '3-1', confidence: 74,
    confidenceLevel: 'medium', over25Prob: 82, over35Prob: 55, bttsProb: 72,
    bttsResult: 'Yes', isUpset: false, reasoning: 'Bayern dominant at Allianz Arena. High-scoring Bundesliga fixture expected.',
    homeTeamScore: 0.85, awayTeamScore: 0.58, status: 'scheduled',
  },
  {
    id: 'fp7', league: 'Premier League', leagueCountry: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    homeTeam: 'Nottm Forest', awayTeam: 'Chelsea', matchDate: new Date().toISOString(),
    homeScore: 0, awayScore: 0,
    homeWinProb: 38, drawProb: 28, awayWinProb: 34,
    predictedResult: 'Home Win', predictedScore: '2-1', confidence: 48,
    confidenceLevel: 'low', over25Prob: 55, over35Prob: 25, bttsProb: 60,
    bttsResult: 'Yes', isUpset: true, upsetConfidence: 65, riskLevel: 'Medium',
    reasoning: 'Forest strong at City Ground. Chelsea inconsistent away. Potential upset.',
    homeTeamScore: 0.58, awayTeamScore: 0.55, status: 'scheduled',
  },
  {
    id: 'fp8', league: 'La Liga', leagueCountry: '🇪🇸',
    homeTeam: 'Athletic Bilbao', awayTeam: 'Atletico Madrid', matchDate: new Date().toISOString(),
    homeScore: 0, awayScore: 0,
    homeWinProb: 35, drawProb: 32, awayWinProb: 33,
    predictedResult: 'Draw', predictedScore: '1-1', confidence: 55,
    confidenceLevel: 'low', over25Prob: 38, over35Prob: 12, bttsProb: 48,
    bttsResult: 'No', isUpset: false, reasoning: 'Two defensive sides. Low-scoring draw most likely outcome.',
    homeTeamScore: 0.52, awayTeamScore: 0.55, status: 'scheduled',
  },
  {
    id: 'fp9', league: 'Serie A', leagueCountry: '🇮🇹',
    homeTeam: 'Inter Milan', awayTeam: 'Juventus', matchDate: new Date().toISOString(),
    homeScore: 0, awayScore: 0,
    homeWinProb: 52, drawProb: 25, awayWinProb: 23,
    predictedResult: 'Home Win', predictedScore: '2-1', confidence: 62,
    confidenceLevel: 'medium', over25Prob: 62, over35Prob: 28, bttsProb: 65,
    bttsResult: 'Yes', isUpset: false, reasoning: 'Derby d\'Italia. Inter form and home advantage give them edge.',
    homeTeamScore: 0.75, awayTeamScore: 0.65, status: 'scheduled',
  },
  {
    id: 'fp10', league: 'Champions League', leagueCountry: '🏆',
    homeTeam: 'Man United', awayTeam: 'Benfica', matchDate: new Date().toISOString(),
    homeScore: 0, awayScore: 0,
    homeWinProb: 55, drawProb: 24, awayWinProb: 21,
    predictedResult: 'Home Win', predictedScore: '2-0', confidence: 66,
    confidenceLevel: 'medium', over25Prob: 52, over35Prob: 22, bttsProb: 48,
    bttsResult: 'No', isUpset: false, reasoning: 'United strong at Old Trafford in European competition.',
    homeTeamScore: 0.70, awayTeamScore: 0.52, status: 'scheduled',
  },
  {
    id: 'fp11', league: 'Bundesliga', leagueCountry: '🇩🇪',
    homeTeam: 'Freiburg', awayTeam: 'Borussia Dortmund', matchDate: new Date().toISOString(),
    homeScore: 0, awayScore: 0,
    homeWinProb: 30, drawProb: 25, awayWinProb: 45,
    predictedResult: 'Away Win', predictedScore: '1-2', confidence: 58,
    confidenceLevel: 'low', over25Prob: 65, over35Prob: 30, bttsProb: 68,
    bttsResult: 'Yes', isUpset: false, reasoning: 'Dortmund attacking quality should overcome Freiburg. Both to score likely.',
    homeTeamScore: 0.48, awayTeamScore: 0.68, status: 'scheduled',
  },
  {
    id: 'fp12', league: 'Premier League', leagueCountry: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    homeTeam: 'Wolves', awayTeam: 'Tottenham', matchDate: new Date().toISOString(),
    homeScore: 0, awayScore: 0,
    homeWinProb: 32, drawProb: 22, awayWinProb: 46,
    predictedResult: 'Away Win', predictedScore: '1-3', confidence: 60,
    confidenceLevel: 'medium', over25Prob: 72, over35Prob: 40, bttsProb: 65,
    bttsResult: 'Yes', isUpset: false, reasoning: 'Spurs attack potent. Wolves defensive issues make goals likely.',
    homeTeamScore: 0.42, awayTeamScore: 0.72, status: 'scheduled',
  },
];

export function getDemoPredictions(): MatchPrediction[] {
  return DEMO_PREDICTIONS;
}

export function getDemoUpsets(): MatchPrediction[] {
  return DEMO_PREDICTIONS.filter(p => p.isUpset || (p.confidence < 55 && p.homeWinProb < 40 && p.awayWinProb > 35));
}

export function getDemoDailyPicks(): {
  resultPicks: MatchPrediction[];
  goalsPicks: MatchPrediction[];
  bttsPicks: MatchPrediction[];
  valuePicks: MatchPrediction[];
} {
  const sorted = [...DEMO_PREDICTIONS].sort((a, b) => b.confidence - a.confidence);
  return {
    resultPicks: sorted.filter(p => p.confidence >= 65).slice(0, 4),
    goalsPicks: sorted.filter(p => p.over25Prob >= 65).slice(0, 4),
    bttsPicks: sorted.filter(p => p.bttsProb >= 60).slice(0, 4),
    valuePicks: sorted.filter(p => p.isUpset || p.confidence < 55).slice(0, 4),
  };
}

export function getGoalsMarketData(): GoalsMarketPrediction[] {
  return DEMO_PREDICTIONS.map(p => ({
    matchId: p.id,
    league: p.league,
    homeTeam: p.homeTeam,
    awayTeam: p.awayTeam,
    over25Prob: p.over25Prob,
    over35Prob: p.over35Prob,
    bttsProb: p.bttsProb,
    totalGoalsExpected: (p.over25Prob / 30) + (p.over35Prob / 40),
    category: p.over25Prob >= 70 ? 'high_scoring' : p.over25Prob <= 45 ? 'low_scoring' : 'balanced',
  }));
}

export function getDemoStats() {
  return {
    matchesPredicted: 1247,
    leaguesCovered: 12,
    predictionAccuracy: 68,
    dailyPicks: 24,
  };
}
