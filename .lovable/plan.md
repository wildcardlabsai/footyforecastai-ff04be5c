

## Plan: Add Club Badges to All Prediction Views

### API Keys Status
Both `API_FOOTBALL_KEY` and `THE_ODDS_API_KEY` are already securely stored. No action needed.

### Club Badges
The edge function `fetch-predictions` already returns `homeLogo` and `awayLogo` URLs from API-Football, and the `MatchPrediction` type already includes these fields. They're just not rendered in the UI components.

### Changes Required

**1. Predictions page** (`src/pages/Predictions.tsx`)
- Add team logo `<img>` tags next to home/away team names in the table rows

**2. Trending Predictions** (`src/components/landing/TrendingPredictions.tsx`)
- Add team logos next to the "Home vs Away" text in prediction cards

**3. Confidence Heatmap** (`src/components/landing/ConfidenceHeatmap.tsx`)
- Add team logos next to match names in the heatmap table

**4. Daily Picks** (`src/pages/DailyPicks.tsx`)
- Add team logos in the PickCard component

**5. Upset Watch** (`src/pages/UpsetWatch.tsx`)
- Add team logos in upset match rows

**6. Goals Market** (`src/pages/GoalsMarket.tsx`)
- Add team logos in goal market cards

Each logo will be a small `<img>` (16-20px) with the team crest URL from API-Football, with a fallback for missing images. The layout pattern will be consistent: `[logo] Team Name` inline.

