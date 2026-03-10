

## Plan: Reduce League Coverage to 5 Leagues + Implement Caching

### Trade-off to Consider
- **PL + La Liga + 3 European comps** means on weekdays without European fixtures, you may only see 0-2 matches
- Keeping **Bundesliga, Serie A, or Ligue 1** adds content on those quieter days at minimal extra API cost (~2-5 more prediction calls per refresh)

### Recommendation
Keep **7 leagues** instead of 5: PL, La Liga, Bundesliga, Serie A, UCL, UEL, UECL. Drop Championship, League One, League Two, Ligue 1. This gives daily content while still cutting API calls by ~40%.

### Changes (once you confirm which leagues)

**1. `src/services/leagues.ts`** — Remove dropped leagues from the array

**2. `supabase/functions/fetch-predictions/index.ts`** — Update `LEAGUE_IDS` set to match

**3. `src/pages/Onboarding.tsx`** — Update the league selection list

**4. `src/components/landing/LeaguesSection.tsx`** — Update marquee to reflect actual coverage

**5. Implement server-side caching** (as previously planned)
- Create `cached_predictions` table
- Update edge function to check cache before calling API
- Set up 3x daily cron refresh
- Increase frontend `staleTime` to 15 minutes

