

# GoalPulse AI — Design & Feature Audit

After reviewing every component across the landing page, auth pages, onboarding, dashboard, and supporting services, here are my recommendations organized by category.

---

## 1. Landing Page Improvements

### Layout & Visual Polish
- **Hero CTA buttons**: "Start Free" and "View Demo" should link to `/signup` and `/dashboard` respectively — currently they are dead buttons with no navigation
- **Dashboard Preview**: Add a subtle animated "scanning" line or pulsing rows to make the static preview feel alive
- **Section spacing**: Add a subtle gradient divider or animated line between sections instead of relying purely on padding for separation
- **Navbar**: Add a scroll-based background opacity change (transparent at top, solid on scroll) for a more premium feel
- **Leagues section**: The league chips are plain text — add country flag emojis or small icons to make them more visually engaging
- **Testimonials**: Add star ratings and vary card heights/styles slightly to break visual monotony. Consider a horizontal auto-scrolling carousel on mobile
- **CTA Section**: The bottom CTA should also include a "View Demo" secondary button, not just "Start Free Now"
- **Footer**: Add social media icons (Twitter/X, Discord, Telegram) — expected for a SaaS product
- **Mobile**: The DashboardPreview table is not readable on small screens — hide it on mobile or replace with a simplified mobile mockup

### Content
- **Social proof numbers**: The hero stats bar (73%, 2.4k, 180+) should animate/count up when they enter the viewport
- **Annual pricing toggle**: Add a monthly/annual toggle to the pricing section with a discount badge for annual

---

## 2. Dashboard Improvements

### Layout
- **Sidebar on mobile**: Currently the fixed sidebar has no mobile handling — add a hamburger menu / sheet overlay for mobile screens
- **Top bar**: The "18 matches live" count is hardcoded — connect it to actual demo data count
- **Missing sections**: The dashboard spec calls for "Watchlist matches" and "Strategy status" widgets — these are missing from the current layout
- **Match table column headers**: "SOT" and "DA" are unclear abbreviations — add tooltips on hover explaining "Shots on Target" and "Dangerous Attacks"

### Visual Design
- **Probability score in table**: Add a mini progress bar alongside the percentage number (like the DashboardPreview has) for better visual scanning
- **Stat widgets**: Add micro sparkline charts inside each stat card showing a 7-day trend
- **Hot matches panel**: Add a subtle pulsing border animation on the card when a match is "Very High" confidence
- **Row click**: Match rows should be clickable and navigate to a match detail page (currently no match detail route exists)

### Data & Interactivity
- **No filters**: The dashboard has no filtering UI — add a filter bar with dropdowns for league, minute range, scoreline, and confidence level
- **Refresh indicator**: Add a "Last updated X seconds ago" timestamp with a circular progress indicator showing the 4-second refresh cycle
- **Sound toggle**: Add an optional alert sound toggle for when new HOT matches appear

---

## 3. Authentication & Onboarding

### Auth Pages
- **Password visibility toggle**: Add show/hide password button on login and signup forms
- **OAuth**: Add Google sign-in button for faster onboarding (common SaaS pattern)
- **Loading state**: The auth pages have no skeleton/loading animation when navigating — add page transition animations

### Onboarding
- **Skip option**: Allow users to skip onboarding and go straight to dashboard — some users want to explore first
- **League search**: With 16 leagues listed, add a search/filter input at the top of the league selection step
- **Visual feedback**: Show a count badge "X selected" on the league selection step
- **Auto-detect timezone**: Use `Intl.DateTimeFormat().resolvedOptions().timeZone` to auto-select the user's timezone instead of defaulting to UTC

---

## 4. Color & Theme Refinements

- **Green glow overuse**: The `glow-green` effect is used on buttons, cards, badges, and the dashboard preview — reduce it to only hero CTA and the most critical elements to preserve impact
- **Add amber/orange for "WATCH" status**: Currently WATCH uses cyan which is also the accent color — use a distinct amber/orange to better differentiate from HOT (green) status
- **Muted foreground contrast**: At `220 10% 50%`, the muted text may be too low contrast on some screens — bump to `220 10% 55%` for accessibility
- **Card hover states**: Cards currently change border color on hover but lack any depth change — add a subtle `translate-y` or shadow lift

---

## 5. Missing Features to Build Next

### High Priority (Phase 4)
- **Match Detail Page** (`/match/:id`): Scoreboard, stat bars, momentum chart (Recharts area chart), goal probability timeline, prediction explanation, event feed
- **Full Live Matches Page**: Currently a placeholder — build the full sortable/filterable table
- **Full Alerts Page**: Currently a placeholder — build the alert history with result tracking

### Medium Priority (Phase 5)
- **Strategy Builder**: Currently a placeholder — build the rule configuration form
- **Analytics Page**: Currently a placeholder — build charts with Recharts (alerts/day line chart, hit rate donut, league breakdown bar chart)

### Nice to Have
- **Dark/light theme toggle**: Some users prefer light mode — the infrastructure (`next-themes` is installed) supports it
- **Keyboard shortcuts**: `Ctrl+K` command palette for power users to quickly navigate between pages
- **Export data**: CSV export button for the alerts table and match history
- **Real-time notification bell**: A bell icon in the top bar with a dropdown showing the latest alerts with unread count badge

---

## 6. Performance & Code Quality

- **Demo data regeneration**: `getDemoMatches()` uses a module-level `tick` variable — this means navigating away and back resets state inconsistently. Consider moving tick into a React ref or context
- **Animation performance**: Multiple `framer-motion` `whileInView` animations on the landing page can cause jank on lower-end devices — add `will-change: transform` and consider `lazy` loading below-fold sections
- **Table virtualization**: If the live matches table grows, consider `react-window` or `tanstack-virtual` for smooth scrolling with large datasets

---

## Summary of Recommended Next Steps

1. **Quick wins**: Fix dead CTA links, add mobile sidebar, add password toggle, auto-detect timezone, connect live match count to real data
2. **Visual polish**: Add count-up animations, progress bars in table, filter bar, section dividers, reduce glow overuse
3. **Phase 4 build**: Match Detail page, full Live Matches page, full Alerts page
4. **Phase 5 build**: Strategy Builder, Analytics charts

