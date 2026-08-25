# PROUDLY — Mobile App Implementation Plan

## Context

Build a full interactive mobile app prototype for PROUDLY — a parent-focused app for tracking children's extracurricular activities, achievements, and milestones. The app runs in a web browser rendered inside a phone-frame shell (390×844 mobile viewport simulation). The brief specifies 5 primary screens, teal-green palette, interactive Gantt chart for Activities, multi-child support, and smooth animations throughout.

---

## Aesthetic Decisions

- **Stance:** Minimalist premium (think Notion + Linear + a family-focused polish)
- **Fonts:** `Bricolage Grotesque` (headings/display, 500–700) + `Inter` (body/UI labels, 400–500) — via Google Fonts CSS2 `@import` in `src/index.css`
- **Palette:** Exactly as specified in brief — teal `#217C72`, background `#F7F8F6`, surface `#FFFFFF`, gold accent `#C9973E` for achievements
- **Motion:** CSS transitions (200–300ms ease-out) on screen switches; Gantt bar entrance via `@keyframes` width grow; achievement card scale on tap; connection status pulse animation
- **No dark mode** (brief implies light, calm, trustworthy)

---

## File Structure

```
src/
  index.css               — Google Fonts @import, Tailwind, CSS tokens, keyframes
  main.tsx                — unchanged
  App.tsx                 — phone shell + router state (activeScreen + activeChild)
  data/
    mockData.ts           — realistic mock for 2 children (Reet, Aanya)
  components/
    BottomNav.tsx         — 5-tab native-style bottom navigation
    ChildSelector.tsx     — horizontal pill switcher (Reet / Aanya / All Kids)
    screens/
      HomeScreen.tsx      — dashboard: greeting, stats, recent activity cards
      ActivitiesScreen.tsx — full interactive Gantt chart (horizontally scrollable)
      AchievementsScreen.tsx — filterable achievement grid with gold accents
      PortfolioScreen.tsx — timeline portfolio view with memory photos
      ProfileScreen.tsx   — settings + Connect Sources (Google Cal + Photos)
```

---

## Screen-by-Screen Plan

### App.tsx
- Renders a centered phone frame (390×844, rounded-[40px], shadow)
- `useState`: `activeScreen` (home|activities|achievements|portfolio|profile), `activeChild` (reet|aanya|all)
- Passes `activeChild` + `setActiveChild` to all screens + ChildSelector
- Screen transitions: CSS `opacity` + subtle `translateY` transition on mount

### src/index.css
- Add Google Fonts `@import` for Bricolage Grotesque + Inter (FIRST lines)
- Add `@import 'tailwindcss';`
- Add CSS custom properties: `--teal`, `--teal-dark`, `--mint`, `--gold`, `--bg`, `--surface`, `--text-primary`, `--text-secondary`, `--border`
- Add `@keyframes slideUp`, `@keyframes barGrow`, `@keyframes fadeIn`, `@keyframes pulse`
- Hide scrollbar utility

### data/mockData.ts
Realistic mock data:
- **Children:** Reet (age 10) and Aanya (age 7)
- **Activities per child:** 4–5 activities with start/end dates spanning 2021–2025 (Soccer, Piano, Swimming, Art, Tennis)
- **Achievements:** 8–10 entries (Tournament win, Recital, Medal, etc.) linked to activities
- **Portfolio entries:** 3–4 memories with photo URLs from Unsplash

### BottomNav.tsx
- Fixed at bottom of phone frame
- 5 tabs: Home (house), Activities (bar-chart/gantt), Achievements (trophy), Portfolio (book), Profile (user)
- Active tab gets `#217C72` teal fill; inactive gets `#66716E`
- 44px touch targets, clean SVG icons (no emoji)
- Subtle border-top `#DCE3E0`

### ChildSelector.tsx
- Horizontal row of 3 pills: Reet | Aanya | All Kids
- Active pill: `#217C72` bg, white text; inactive: white bg, `#66716E` text, border
- Avatar initials circle on each pill
- 200ms transition on active state

### HomeScreen.tsx
- Status bar (time + icons)
- Header: "Good morning, Sarah" + notification bell
- ChildSelector embedded
- Summary stats row: X activities, X achievements, X years tracked — animated count-up on mount
- "Active Now" section: 2–3 ongoing activity cards with teal left-border indicator
- "Recent Achievements" horizontal scroll strip (gold badge + activity name)
- "This Week" section showing upcoming/recent events

### ActivitiesScreen.tsx (most complex)
- Header + ChildSelector
- Year range tabs (2022 | 2023 | 2024 | 2025) 
- Full Gantt chart:
  - Left column: activity name labels (fixed)
  - Right: horizontally scrollable grid with month columns
  - Each activity = one row, colored bar spanning its date range
  - Bar color: teal for ongoing, `#66716E` for completed
  - Achievement milestone markers: small gold diamond `◆` plotted along bar at milestone date
  - Bars animate in with `barGrow` keyframe (width 0 → full) staggered per row
  - Tap bar → activity detail bottom sheet (name, duration, achievements count)
  - "Ongoing" badge on active activities

### AchievementsScreen.tsx
- Header + ChildSelector
- Filter row: All | Competitions | Awards | Performances | Milestones
- Achievement cards in a 2-col grid:
  - Gold trophy/medal icon (SVG)
  - Achievement name + date
  - Linked activity pill (teal)
  - Subtle warm-gold left accent
- "Add Achievement" FAB button (teal, bottom-right)
- Cards animate in staggered on mount

### PortfolioScreen.tsx
- Header + ChildSelector  
- "Brag Sheet" CTA banner at top (teal, share icon)
- Timeline grouped by year:
  - Year label as section header
  - Activity entries with duration badge
  - Achievements count per activity
  - Memory photo thumbnails (Unsplash, fit=crop)
- Clean vertical timeline line (teal, 2px)

### ProfileScreen.tsx
- Parent avatar + name
- "Connected Sources" section (prominent, top priority):
  - Google Calendar row: status badge (Connected/Not connected) + connect/disconnect button
  - Google Photos row: same pattern
  - Status states implemented: Not connected (gray) → Connecting (spinning, teal) → Connected (green checkmark) → Reconnect (orange)
  - Demo: clicking "Connect" runs 2s animation then shows Connected state
- "Children" section: list of Reet + Aanya with edit icons
- "Notifications" toggle row
- "About / Sign out" at bottom

---

## Motion Plan

| Interaction | Animation |
|---|---|
| Screen switch | opacity 0→1 + translateY(8px→0), 250ms ease-out |
| Child switch | pill bg transition 200ms |
| Gantt bars | width 0→auto, staggered 60ms per row, 400ms ease-out |
| Achievement cards | fadeIn + translateY staggered on screen enter |
| Connect button | spinner 1s linear loop while connecting |
| Stats count | count-up from 0 using useEffect on mount |
| Bottom nav active | icon scale 1→1.1 + color transition 150ms |

---

## Critical Implementation Notes

1. `@import` for Google Fonts must be the VERY FIRST lines of `src/index.css` before `@import 'tailwindcss'`
2. Phone frame: `width: 390px; height: 844px` centered in browser, `overflow: hidden`, inner content scrolls
3. Gantt scroll area: use `overflow-x: auto` with hidden scrollbar; left activity labels column is `position: sticky; left: 0`
4. No `* { margin: 0 }` reset — use Tailwind's built-in reset only
5. All string literals with apostrophes must use double quotes in JSX
6. No inline styles except for dynamic values (bar widths, positions computed from dates)

---

## Mock Data Specifics (Reet)
- Soccer: Sep 2021 – ongoing → teal bar
- Piano: Jan 2022 – Jun 2024 → gray bar
- Swimming: Jun 2022 – ongoing → teal bar
- Art Club: Sep 2023 – Jun 2024 → gray bar
- Tennis: Mar 2024 – ongoing → teal bar

## Mock Data Specifics (Aanya)
- Ballet: Sep 2022 – ongoing → teal bar
- Gymnastics: Jan 2023 – Dec 2023 → gray bar
- Choir: Sep 2023 – ongoing → teal bar
- Soccer: Apr 2024 – ongoing → teal bar

---

## Verification

1. Open preview URL in browser — phone frame should appear centered
2. Click all 5 bottom nav tabs — each screen loads with animation
3. Switch child selector — Gantt and lists update to show filtered data
4. Activities screen: scroll Gantt horizontally, verify sticky labels, tap a bar to see detail sheet
5. Achievements screen: tap filter pills to see filtered cards
6. Profile screen: click "Connect" on Google Calendar → spinner → connected state
7. Check no build errors (Vite hot reload should be clean throughout)
