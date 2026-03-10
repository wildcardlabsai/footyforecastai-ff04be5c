// GoalPulse AI — Demo Data Simulator
// Generates realistic live match data for demo mode

import { MatchStats } from './predictionEngine';

export interface DemoMatch {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: 'live' | 'finished' | 'halftime' | 'scheduled';
  stats: MatchStats;
}

export interface DemoAlert {
  id: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  minute: number;
  probabilityScore: number;
  confidence: 'low' | 'medium' | 'high' | 'very_high';
  channel: 'telegram' | 'email' | 'both';
  result: 'goal_scored' | 'no_goal' | 'pending';
  reason: string;
  createdAt: Date;
}

const DEMO_MATCHES_BASE = [
  { id: 'dm1', league: 'Premier League', home: 'Arsenal', away: 'Chelsea', baseMinute: 67, hs: 1, as: 1 },
  { id: 'dm2', league: 'La Liga', home: 'Real Madrid', away: 'Atletico Madrid', baseMinute: 74, hs: 2, as: 1 },
  { id: 'dm3', league: 'Bundesliga', home: 'Bayern Munich', away: 'Borussia Dortmund', baseMinute: 55, hs: 0, as: 0 },
  { id: 'dm4', league: 'Serie A', home: 'Inter Milan', away: 'Napoli', baseMinute: 41, hs: 1, as: 0 },
  { id: 'dm5', league: 'Ligue 1', home: 'PSG', away: 'Lyon', baseMinute: 78, hs: 3, as: 1 },
  { id: 'dm6', league: 'Premier League', home: 'Liverpool', away: 'Man City', baseMinute: 62, hs: 2, as: 2 },
  { id: 'dm7', league: 'Champions League', home: 'Barcelona', away: 'Juventus', baseMinute: 38, hs: 0, as: 1 },
  { id: 'dm8', league: 'Eredivisie', home: 'Ajax', away: 'PSV', baseMinute: 71, hs: 1, as: 2 },
  { id: 'dm9', league: 'Premier League', home: 'Tottenham', away: 'Newcastle', baseMinute: 83, hs: 0, as: 0 },
  { id: 'dm10', league: 'La Liga', home: 'Villarreal', away: 'Real Sociedad', baseMinute: 52, hs: 1, as: 1 },
  { id: 'dm11', league: 'Bundesliga', home: 'RB Leipzig', away: 'Bayer Leverkusen', baseMinute: 29, hs: 0, as: 0 },
  { id: 'dm12', league: 'Serie A', home: 'AC Milan', away: 'Roma', baseMinute: 65, hs: 1, as: 0 },
  { id: 'dm13', league: 'Champions League', home: 'Man United', away: 'Benfica', baseMinute: 44, hs: 1, as: 1 },
  { id: 'dm14', league: 'Primeira Liga', home: 'Porto', away: 'Sporting CP', baseMinute: 58, hs: 2, as: 1 },
  { id: 'dm15', league: 'MLS', home: 'LA Galaxy', away: 'Inter Miami', baseMinute: 35, hs: 0, as: 1 },
  { id: 'dm16', league: 'Premier League', home: 'Aston Villa', away: 'West Ham', baseMinute: 76, hs: 1, as: 1 },
  { id: 'dm17', league: 'Turkish Süper Lig', home: 'Galatasaray', away: 'Fenerbahçe', baseMinute: 69, hs: 1, as: 2 },
  { id: 'dm18', league: 'Brasileiro Série A', home: 'Flamengo', away: 'Palmeiras', baseMinute: 81, hs: 2, as: 2 },
];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function generateMatchStats(base: typeof DEMO_MATCHES_BASE[0], tick: number): DemoMatch {
  const minuteOffset = Math.floor(tick / 4); // advance 1 minute every 4 ticks (~every 4 seconds)
  const minute = Math.min(90, base.baseMinute + minuteOffset);
  const isHalftime = minute === 45 && tick % 20 < 10;
  const isFinished = minute >= 90;

  // Generate stats that scale with minute
  const factor = minute / 90;
  const intensity = base.id === 'dm1' || base.id === 'dm6' || base.id === 'dm9' || base.id === 'dm18'
    ? 1.4 : base.id === 'dm2' || base.id === 'dm8' || base.id === 'dm17' ? 1.2 : 1.0;

  const homeShots = Math.round((rand(4, 10) * factor * intensity));
  const awayShots = Math.round((rand(3, 9) * factor * intensity));
  const homeSOT = Math.round(homeShots * randFloat(0.3, 0.6));
  const awaySOT = Math.round(awayShots * randFloat(0.3, 0.55));
  const homeCorners = Math.round(rand(2, 8) * factor);
  const awayCorners = Math.round(rand(1, 7) * factor);
  const homeDA = Math.round(rand(30, 80) * factor * intensity);
  const awayDA = Math.round(rand(25, 70) * factor * intensity);
  const homePoss = rand(42, 62);
  const momentumHome = rand(35, 80);

  // Simulate occasional score changes
  let homeScore = base.hs;
  let awayScore = base.as;
  if (minute > base.baseMinute + 10 && Math.random() > 0.7) {
    if (Math.random() > 0.5) homeScore += 1; else awayScore += 1;
  }

  const stats: MatchStats = {
    matchId: base.id,
    minute,
    homeShots,
    awayShots,
    homeShotsOnTarget: homeSOT,
    awayShotsOnTarget: awaySOT,
    homeCorners,
    awayCorners,
    homeDangerousAttacks: homeDA,
    awayDangerousAttacks: awayDA,
    homePossession: homePoss,
    awayPossession: 100 - homePoss,
    homeRedCards: base.id === 'dm8' && minute > 65 ? 1 : 0,
    awayRedCards: base.id === 'dm9' && minute > 78 ? 1 : 0,
    homeYellowCards: rand(0, 3),
    awayYellowCards: rand(0, 3),
    homeXg: randFloat(0.3, 2.2) * factor * intensity,
    awayXg: randFloat(0.2, 1.8) * factor * intensity,
    momentumHome,
    momentumAway: 100 - momentumHome,
    homeScore,
    awayScore,
    isLive: !isFinished && !isHalftime,
  };

  return {
    id: base.id,
    league: base.league,
    homeTeam: base.home,
    awayTeam: base.away,
    homeScore,
    awayScore,
    minute,
    status: isFinished ? 'finished' : isHalftime ? 'halftime' : 'live',
    stats,
  };
}

let tick = 0;

export function getDemoMatches(): DemoMatch[] {
  tick++;
  return DEMO_MATCHES_BASE.map((base) => generateMatchStats(base, tick));
}

export function getDemoAlerts(): DemoAlert[] {
  return [
    {
      id: 'alert1',
      matchId: 'dm1',
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      league: 'Premier League',
      minute: 72,
      probabilityScore: 82,
      confidence: 'very_high',
      channel: 'both',
      result: 'goal_scored',
      reason: 'Multiple shots on target and rising dangerous attacks suggest strong attacking pressure late in the match.',
      createdAt: new Date(Date.now() - 12 * 60000),
    },
    {
      id: 'alert2',
      matchId: 'dm6',
      homeTeam: 'Liverpool',
      awayTeam: 'Man City',
      league: 'Premier League',
      minute: 65,
      probabilityScore: 74,
      confidence: 'high',
      channel: 'telegram',
      result: 'pending',
      reason: 'Tied game with elevated xG and momentum shift towards Liverpool.',
      createdAt: new Date(Date.now() - 8 * 60000),
    },
    {
      id: 'alert3',
      matchId: 'dm2',
      homeTeam: 'Real Madrid',
      awayTeam: 'Atletico Madrid',
      league: 'La Liga',
      minute: 78,
      probabilityScore: 71,
      confidence: 'high',
      channel: 'email',
      result: 'no_goal',
      reason: 'Strong momentum and dangerous attacks spike from trailing Atletico.',
      createdAt: new Date(Date.now() - 25 * 60000),
    },
    {
      id: 'alert4',
      matchId: 'dm9',
      homeTeam: 'Tottenham',
      awayTeam: 'Newcastle',
      league: 'Premier League',
      minute: 85,
      probabilityScore: 68,
      confidence: 'high',
      channel: 'both',
      result: 'pending',
      reason: 'Late game pressure in a goalless match with red card advantage.',
      createdAt: new Date(Date.now() - 3 * 60000),
    },
    {
      id: 'alert5',
      matchId: 'dm18',
      homeTeam: 'Flamengo',
      awayTeam: 'Palmeiras',
      league: 'Brasileiro Série A',
      minute: 83,
      probabilityScore: 77,
      confidence: 'very_high',
      channel: 'telegram',
      result: 'goal_scored',
      reason: 'High-intensity tied match with shots on target spike and late-game pressure.',
      createdAt: new Date(Date.now() - 5 * 60000),
    },
  ];
}

export function getDemoStats() {
  return {
    liveMatches: 18,
    hotMatches: 5,
    alertsToday: 12,
    predictionAccuracy: 73,
  };
}
