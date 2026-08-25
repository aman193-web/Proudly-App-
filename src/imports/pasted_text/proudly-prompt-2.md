# PROUDLY — Prompt 2

Continue directly from the approved PROUDLY Prompt 1 design.

Do not redesign the established visual system, navigation, spacing, typography, color palette, controls, or component patterns.

The screens created now must clearly feel like part of the same professionally designed mobile application.

This phase covers:

**Home → Activities → Full-Fledged Gantt Chart → Activity Detail → Add/Edit Activity → Achievements → Achievement Detail → Add Achievement**

---

# MOST IMPORTANT PRODUCT REQUIREMENT

The **Activity Gantt Chart is the core experience and primary highlight of PROUDLY.**

Give substantially more design attention to the Gantt than to any other screen in this prompt.

PROUDLY should not feel like:

* a generic family dashboard
* a calendar app
* a photo organizer
* a simple activity list
* an achievement tracker

The defining experience is:

> **A parent can visually understand years of their child's extracurricular journey in one interactive Gantt chart.**

The chart must immediately communicate:

* what activities the child participated in
* when each activity started
* how long it lasted
* whether it is still ongoing
* which activities overlapped
* when important achievements happened
* how the child's extracurricular journey evolved over several years

Do NOT simplify the Gantt into a normal timeline, feed, cards, or list.

---

# 1. Home Screen

Create the first returning-user Home experience.

Home should be useful and polished, but it should **lead users into Activities rather than attempting to reproduce the full Gantt chart.**

## Header

Include:

* appropriate greeting or welcome
* current child context
* child avatar
* notification access

Example:

**Good morning, Sarah**

Tracking **Reet**

---

# 2. Child Selector

Use the same child-selection pattern consistently throughout PROUDLY.

Support:

* Reet
* Aanya
* All Kids where appropriate

The selector should be quick to access but should not dominate the interface.

Do not create a different child selector for every section.

---

# 3. Home Summary

Show a restrained high-level overview.

Possible information:

**8 Activities**

**12 Achievements**

**4 Years Tracked**

Avoid placing every number inside a separate large card.

Use a clean compact summary treatment.

---

# 4. New Discoveries

If PROUDLY has found new information through Calendar or Photos, surface it near the top.

Example:

### 4 new moments found

3 activities
1 possible achievement

Action:

**Review**

Keep this concise.

The parent should feel that PROUDLY is doing the work automatically.

---

# 5. Activity Journey Preview

Home should contain a visually meaningful preview of the child's activity journey.

This should reference the Gantt concept without becoming the full chart.

Possible preview:

Piano
2019 ━━━━━━━━━ Present

Soccer
2021 ━━━━━ 2024

Dance
2023 ━━━━━ Present

Primary action:

**View full activity journey**

This should lead directly to the Activities/Gantt screen.

---

# 6. Recent Achievements

Show a small number of recent achievements.

Examples:

**Piano Recital**
May 2026

**Regional Soccer Tournament**
March 2026

Action:

**View all achievements**

Do not make Home excessively card-heavy.

---

# 7. Bottom Navigation

Continue using:

* Home
* Activities
* Achievements
* Portfolio
* Profile

Activities should feel particularly important because it contains the core Gantt experience.

Maintain the same navigation pattern established in Prompt 1.

---

# 8. ACTIVITIES — PRIMARY GANTT SCREEN

This is the most important screen in PROUDLY.

Design it with exceptional care.

The Gantt should occupy the majority of the usable screen.

Do not surround it with excessive dashboard widgets.

The screen should prioritize:

**Context → Filters → Time controls → Gantt**

---

# 9. Gantt Header

Create a compact header such as:

### Reet's Activities

Supporting information could show:

**8 activities · 4 years**

Provide access to:

* child switching
* filtering
* date range

Do not clutter the header with many buttons.

---

# 10. Gantt Filtering

Support:

### Child

* Reet
* Aanya
* All Kids where appropriate

### Category

Examples:

* All
* Sports
* Music
* Dance & Theater
* Academics
* Arts
* STEM
* Outdoors
* Other

Do not permanently display 8–10 filter pills across the mobile screen.

Use an elegant mobile filtering pattern such as:

**Filter button → bottom sheet**

The active filter can be shown compactly above the chart.

---

# 11. Gantt Time Range

Parents may have many years of data.

Provide an intuitive date-range control.

Potential ranges:

* 1 Year
* 3 Years
* 5 Years
* All Time

Also consider:

**Jump to Today**

Do not make the controls look like desktop chart software.

Keep them compact and touch-friendly.

---

# 12. FULL-FLEDGED MOBILE GANTT CHART

Create a genuine interactive Gantt chart.

Each activity occupies one horizontal row.

Example:

| Activity | Timeline                   |
| -------- | -------------------------- |
| Piano    | 2019 ━━━━━━━━━━━━━ Present |
| Soccer   | 2021 ━━━━━━━ 2024          |
| Ballet   | 2020 ━━━ 2022              |
| Robotics | 2024 ━━━━━ Present         |
| Swimming | 2022 ━━━━━ 2025            |

But do not literally design this as a table.

Design it as a modern native-mobile Gantt experience.

---

# 13. Gantt Activity Labels

Activity names should remain understandable while the user moves through time.

Consider a **sticky/frozen activity-name column** on the left.

Example:

Piano
Soccer
Dance
Robotics
Swimming

The timeline portion should scroll horizontally while the activity names remain visible.

The sticky label area must remain narrow enough that sufficient space remains for the timeline.

---

# 14. Gantt Time Axis

Create a clearly readable horizontal date scale.

Depending on zoom/range, show:

* Years
* Months where appropriate

Example:

2022 | 2023 | 2024 | 2025 | 2026

The time axis should remain visible while the parent vertically scrolls activities.

Consider a sticky time header.

---

# 15. Gantt Bars

Each activity should have a horizontal duration bar.

Communicate:

### Ongoing activity

Use PROUDLY teal-green.

Suggested:

`#217C72`

The bar continues toward the present date.

### Completed activity

Use a quieter neutral/grey treatment.

### Approximate date

If start/end information is uncertain, use a subtle visual treatment that indicates approximation without making the chart confusing.

Do not create a different bright color for every activity.

The chart should remain calm and readable.

---

# 16. Start and End Dates

Parents should be able to understand the actual duration.

Support:

* known start
* known end
* ongoing
* approximate start
* approximate end

Do not require every date label to be permanently displayed if that makes the chart crowded.

Consider revealing precise dates after tapping the activity bar.

---

# 17. Achievement Milestones ON THE GANTT

This is extremely important.

Achievements should appear **directly on the relevant activity bar at the correct point in time.**

Example:

Piano

2019 ━━━━━ 🏆 ━━━━━ 🏆 ━━━━━ Present

Soccer

2021 ━━━━━━━ 🏆 ━━━ 2024

Use a restrained warm-gold achievement marker.

Do not rely on emoji trophy icons as the production visual.

Use a polished icon/marker from a consistent icon system.

The milestone must be visually distinct from the activity bar.

---

# 18. Tapping an Achievement Marker

When the parent taps an achievement marker:

Show a lightweight preview.

Example:

### Spring Piano Recital

May 14, 2024

Piano

**View achievement**

This could use a compact bottom sheet.

Do not immediately navigate away from the Gantt unless the parent chooses to view more.

---

# 19. Tapping an Activity Bar

When the parent taps an activity:

Show a concise activity preview.

Example:

### Piano

Sep 2019 – Present

6 years 8 months

4 achievements

22 memories

Actions:

**View activity**

**Edit**

A bottom sheet may work well for this preview.

The parent should be able to inspect activities without losing their place in the Gantt.

---

# 20. Gantt Navigation & Gestures

Design mobile interactions for:

### Horizontal swipe

Move backward/forward through years.

### Vertical scroll

Browse activities.

### Tap

Open activity or milestone preview.

### Zoom/range

Allow the user to change between time ranges rather than relying only on difficult pinch gestures.

If pinch-to-zoom is used, it should be optional rather than the only way to change scale.

---

# 21. Current Date Indicator

Show a subtle vertical indicator for:

**Today**

This helps the parent immediately understand which activities are ongoing.

Do not make it visually overpowering.

---

# 22. Long Histories

The Gantt must still work when a child has:

* 15+ activities
* 8–12 years of history
* several overlapping activities
* many achievements

Do not design only for the perfect 5-row sample.

The mobile structure must remain scalable.

---

# 23. Empty Gantt State

Create a thoughtful empty state.

Example:

### Reet's activity journey starts here

Connect Calendar, add an activity, or sync your sources to start building the timeline.

Actions:

**Sync sources**

**Add activity**

Do not use a large decorative illustration as the entire empty state.

---

# 24. Gantt Filtered State

Show how the Gantt looks when filtered.

Example:

**Music**

Piano
Choir
Guitar

The same chart structure should remain intact.

Do not transform filtered results into cards or lists.

---

# 25. Full-Screen Gantt Mode

Because the Gantt is the core feature, consider an optional:

**Expand chart**

interaction.

This opens a distraction-free Gantt view with:

* maximum horizontal chart space
* activity names
* date scale
* filters/range access
* achievements
* close/back action

This should still be portrait-friendly.

If a landscape orientation provides meaningful additional value, you may show a secondary landscape concept, but the app must remain completely usable in portrait mode.

Do not make landscape mandatory.

---

# 26. Activity Detail Screen

Create a full Activity Detail screen.

Example:

# Piano

**Sep 2019 – Present**

**Ongoing**

Summary information:

* duration
* category
* achievements
* related memories/photos

---

# 27. Activity History

Within Activity Detail, show a chronological history of meaningful moments.

Examples:

Sep 2019
Started Piano

May 2021
First recital

Jun 2023
Grade examination

May 2025
Annual recital

Avoid repeating every routine Calendar event.

Show meaningful history.

---

# 28. Activity Achievements

Show achievements related to that activity.

Each should be tappable.

Allow:

**+ Add achievement**

---

# 29. Activity Photos & Memories

Show photos/memories related to the activity.

Do not turn the screen into a generic photo gallery.

The images should reinforce the activity history.

---

# 30. Parent Notes

Allow optional memories/notes.

Keep notes secondary to the actual activity history.

---

# 31. Edit Activity

Create a clean editing experience.

Fields may include:

* Child
* Activity name
* Category
* Start date
* End date
* Ongoing
* Notes

Support:

* correction of imported information
* deleting an incorrect activity
* merging duplicate activity where necessary

Use progressive disclosure for uncommon actions.

Do not create one giant settings form.

---

# 32. ACHIEVEMENTS MAIN SCREEN

Achievements should have a dedicated experience.

Create a polished accomplishment history.

Include:

* child selector
* filters
* chronological achievements

Possible filtering:

* All
* Activity
* Category
* Year

Avoid excessive filter pills.

---

# 33. Achievement Presentation

Each achievement should clearly communicate:

### Achievement name

### Related activity

### Date

### Optional image/certificate

Example:

**Regional Soccer Championship**

Soccer

June 12, 2025

The visual treatment should feel celebratory but restrained.

Do not gamify the interface excessively.

---

# 34. Add Achievement

Create a quick mobile flow.

Fields:

* Child
* Achievement title
* Related activity
* Date
* Optional description
* Optional photo/certificate

Only require genuinely necessary information.

Primary action:

**Add achievement**

---

# 35. Achievement Detail

Create a detail screen containing:

* achievement title
* child
* date
* related activity
* description
* photo/certificate
* connection to the activity timeline

Action:

**View on activity timeline**

This should return the user to the relevant activity/time position in the Gantt where practical.

That connection between Achievement and Gantt is important.

---

# 36. Calendar / Photo Discovery Review

When PROUDLY discovers new information, allow lightweight review.

Examples:

### New activity found

Soccer
Sep 2025

### Possible achievement

Regional Tournament
Mar 2026

### Possible duplicate

Piano already exists

Actions should be quick.

Do not turn this into manual data entry.

---

# 37. Shared Components

Extend the existing Prompt 1 component system.

Add reusable components for:

* Gantt chart container
* Sticky activity label
* Time-axis header
* Activity bar
* Ongoing activity bar
* Completed activity bar
* Achievement milestone
* Today indicator
* Gantt filter sheet
* Time-range selector
* Activity preview bottom sheet
* Achievement preview bottom sheet
* Achievement row
* Activity summary
* Child selector
* Empty state

Use consistent spacing, typography, radius and interaction states.

---

# VISUAL DIRECTION

Maintain the established PROUDLY visual system.

### Brand

Primary teal-green: `#217C72`

Dark teal: `#175F58`

Soft mint: `#DCEFEB`

Background: `#F7F8F6`

Surface: `#FFFFFF`

Primary text: `#172321`

Secondary text: `#66716E`

Border: `#DCE3E0`

Achievement accent:

Use a restrained warm gold.

---

# GANTT VISUAL PRINCIPLES

The Gantt should feel:

* sophisticated
* understandable
* calm
* data-rich without feeling technical
* smooth
* touch-friendly
* premium
* distinctive to PROUDLY

Avoid making it look like:

* Microsoft Project
* enterprise project-management software
* spreadsheet
* desktop scheduling software
* calendar grid
* generic chart library

This is a **consumer family product**, not business project-management software.

The Gantt should make a child's journey feel meaningful.

---

# CRITICAL QUALITY TEST

When viewing the Activities screen for the first time, a parent should understand within approximately 5 seconds:

1. What activities their child has done
2. Which activities are still ongoing
3. How long each activity lasted
4. Which activities overlapped
5. Where major achievements occurred

If the chart does not communicate these five things clearly, redesign it.

---

# Final Deliverable

Create the complete connected prototype for:

**Home**
**→ Full Activities Gantt**
**→ Gantt filtering/range interactions**
**→ Activity Preview**
**→ Activity Detail**
**→ Edit Activity**
**→ Achievement Marker Preview**
**→ Achievements**
**→ Achievement Detail**
**→ Add Achievement**

Spend the most design effort on the **full mobile Gantt chart and its interactions**.

It is PROUDLY's core product experience and should feel distinctive, memorable, and exceptionally easy to use.
