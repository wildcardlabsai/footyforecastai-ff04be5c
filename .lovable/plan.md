

# Landing Page Redesign — From Template to Custom

## The Problem
The current landing page follows a predictable template pattern: every section uses the same 3-column grid, identical `hover:-translate-y-1` effects, and the same `opacity: 0, y: 20` entrance animation. This screams "AI-generated template."

## Design Strategy
Break visual monotony by giving each section a unique layout, rhythm, and interaction pattern. No two sections should feel structurally identical.

## Section-by-Section Changes

### 1. Hero — Add Floating Signal Badges
- Add 2-3 small floating "live signal" badges around the dashboard preview (e.g. "⚡ Arsenal 82% — Goal likely", "🔥 3 signals active") with subtle float animations at different speeds
- These act as social proof AND visual storytelling — users instantly understand what the product does
- Stagger badge animations so they feel organic, not synchronized

### 2. How It Works — Horizontal Connected Timeline
- Replace the 4-column uniform grid with a horizontal stepped layout connected by animated dashed lines/arrows
- Each step card alternates alignment (left-right zigzag on mobile, horizontal line on desktop)
- Add a subtle animated "pulse" that travels along the connecting line to show data flow
- Number badges get a gradient ring instead of plain text

### 3. Features Section — Bento Grid Layout
- Replace the uniform 3x2 grid with an asymmetric bento grid:
  - 2 large hero cards (span 2 cols) for the top features ("12-Factor Scoring Engine" and "Custom Alert Strategies")
  - 4 smaller cards below in varying sizes
- Large cards get a mini inline illustration or animated stat (e.g. a tiny probability bar animating from 40→82%)
- Small cards stay compact, icon + title + one-liner

### 4. Leagues Section — Scrolling Marquee
- Replace the static flex-wrap grid with a dual-row infinite marquee (opposite directions)
- Rows auto-scroll slowly, pause on hover
- This feels dynamic and implies "always scanning" — reinforces the real-time brand

### 5. Testimonials — Offset Stacked Cards
- Instead of 3 equal columns, use an offset layout: center card elevated, side cards slightly lower and smaller
- The featured/center testimonial gets a subtle gradient border and larger text
- Add a small quote mark SVG as a decorative element instead of relying on the `"` character

### 6. Pricing — Keep Structure, Refine Details
- Pricing grids are expected to be uniform, so keep 3 columns
- BUT: Add a subtle animated gradient border on the "Pro" card instead of just a static border
- Replace the plain "MOST POPULAR" badge with a pill that has a shimmer/sweep animation

### 7. FAQ — Two-Column Split
- Left column: heading + short paragraph "Still have questions? Contact us"
- Right column: the accordion
- This breaks the centered single-column monotony

### 8. CTA Section — Stays Largely the Same
- Already unique with the gradient border box. Minor polish: add a subtle particle/star field behind it

### 9. Animation Variety
- Replace uniform `y: 20` animations with section-appropriate variants:
  - Features bento: scale from 0.95
  - Leagues marquee: no entrance animation (always moving)
  - Testimonials: stagger with slight rotation
  - How it Works: slide from alternating sides

### 10. Global Polish
- Add a `animate-shimmer` keyframe utility for the pricing badge
- Add a `animate-marquee` keyframe for the leagues scroll
- Add `animate-float` with multiple speeds for hero badges

## Files to Create/Edit
- **Edit**: `HeroSection.tsx` — add floating signal badges
- **Edit**: `HowItWorks.tsx` — horizontal connected timeline layout
- **Edit**: `FeaturesSection.tsx` — bento grid with asymmetric sizing
- **Edit**: `LeaguesSection.tsx` — infinite scrolling marquee
- **Edit**: `TestimonialsSection.tsx` — offset stacked layout
- **Edit**: `PricingSection.tsx` — animated gradient border + shimmer badge
- **Edit**: `FAQSection.tsx` — two-column split layout
- **Edit**: `CTASection.tsx` — minor polish
- **Edit**: `src/index.css` — new animation keyframes (marquee, float, shimmer)

No database or backend changes needed.

