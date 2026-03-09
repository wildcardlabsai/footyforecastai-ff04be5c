
# GoalPulse AI — Implementation Plan

## Phase 1: Foundation & Landing Page

### Design System
- Dark theme with black/charcoal backgrounds, electric green (#00FF87) highlights, cyan (#00D4FF) accents
- Bloomberg terminal / trading dashboard aesthetic with glowing badges, data-dense layouts, smooth hover states

### Landing Page
- **Hero**: "Spot Goal Pressure Before The Net Bulges" with CTA buttons (Start Free / View Demo) and a dashboard preview mockup
- **Sections**: How It Works, Real-Time Scanning, Prediction Engine, Alerts, Leagues, Pricing (Free/Pro/Elite tiers), Testimonials, FAQ, Footer
- Fully responsive, polished SaaS marketing copy

---

## Phase 2: Authentication & Onboarding (Supabase)

### Database Setup
- `profiles` table linked to `auth.users`
- `user_roles` table (admin/user) with security definer function
- RLS policies on all tables

### Auth Pages
- Signup, Login, Forgot Password, Reset Password, Email verification

### Onboarding Flow
- Multi-step form: preferred leagues → alert channels (Telegram/Email/Both) → alert style (Conservative/Balanced/Aggressive) → timezone → watchlist leagues
- Stored in `user_preferences` table

---

## Phase 3: Dashboard & Demo Mode

### Prediction Engine (Client-side module)
- Rule-based scoring system with all 12 factors (minute, shots, SOT, dangerous attacks, corners, possession trend, game state, red card, momentum, xG, odds, pre-match)
- Penalties (slowdown, stale data), final score formula: `clamp(round(raw_score * 0.78), 0, 100)`
- Active signals detection (SOT spike, dangerous attacks spike, momentum increase, etc.)
- Alert trigger rules (minute 25-88, score ≥62, signals ≥2, cooldown check)

### Demo Mode
- Simulated live matches with realistic data that updates periodically
- Prediction engine runs on simulated data so dashboard feels alive

### Main Dashboard
- Widgets: Live matches monitored, Hot matches, Alerts sent today, Prediction accuracy
- Live match table, Hot matches panel, Latest alerts feed, Watchlist, Strategy status
- Filters: league, minute, scoreline, confidence level

---

## Phase 4: Match Pages & Alerts

### Live Matches Page
- Full table with all columns (league, teams, score, minute, shots, SOT, corners, dangerous attacks, cards, probability score, confidence badge, alert status)
- Sorting (probability, minute, league) and filters (2nd half, tied games, high confidence)

### Match Detail Page
- Scoreboard, stat timeline, momentum chart (Recharts), goal probability history chart
- Prediction explanation panel ("Why this match is hot")
- Event timeline, recent alerts

### Alerts Page
- All triggered alerts with match, time, probability, confidence, channel, result (goal/no goal/pending)
- Filters by date, league, strategy

---

## Phase 5: Strategy Builder & Analytics

### Strategy Builder
- Custom alert rules: min/max minute, min SOT, min dangerous attacks, min corners, probability threshold, red card filter, trailing filter, 2nd half only, league filters, cooldown
- Save, activate, duplicate strategies

### Performance Analytics
- Charts: alerts/day, hit rate, hit rate by league, hit rate by confidence, alerts by strategy, best signals

---

## Phase 6: Settings & Admin

### Settings
- Profile, notifications, timezone, Telegram connection UI, email preferences, subscription plan, test notification buttons

### Admin Panel (role-gated)
- View users, subscriptions, alerts, match signals
- Prediction engine monitor with raw scores and factor breakdowns
- Tuning panel: factor weights, alert thresholds, cooldown, confidence bands

---

## Phase 7: Integrations (later)

### Telegram Bot Integration
- Connection flow with token, bot linking, chat ID storage
- Alert message formatting via Edge Function

### Email Alerts (Resend)
- Formatted email alerts via Edge Function

---

## Database Tables
`profiles`, `user_preferences`, `user_roles`, `leagues`, `teams`, `matches`, `live_match_stats`, `prediction_runs`, `strategies`, `alerts`, `alert_deliveries`, `telegram_connections`, `subscriptions`, `watchlists`, `admin_logs`

All tables with RLS policies. Roles managed via separate `user_roles` table with security definer function.
