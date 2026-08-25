# PROUDLY — Prompt 3

Continue directly from the approved PROUDLY Prompt 1 and Prompt 2 designs.

Do not redesign:

* visual system
* bottom navigation
* child selector
* buttons
* typography
* spacing
* Gantt behavior
* source-connection components
* activity components
* achievement components

Everything created now must feel like part of the same application.

The **Gantt remains the core product experience**.

Features created in this prompt should enrich, support, or export the information already represented in the child's activity journey.

This phase covers:

**Photos & Memories → Portfolio → Brag Sheet → Notifications → Connected Sources → Child Management → Profile & Settings → Global States → Final App Consistency Audit**

---

# 1. PHOTOS & MEMORIES — PRODUCT ROLE

Google Photos should help bring the activity journey to life.

Do NOT design PROUDLY as a general photo-storage or gallery application.

The primary relationship is:

**Child → Activity → Date/Moment → Photo**

Examples:

Reet
→ Soccer
→ Regional Tournament
→ Photos

Reet
→ Piano
→ Spring Recital
→ Photos

Photos should reinforce the Gantt/activity history.

---

# 2. Google Photos Post-Connection Flow

Google Photos was already connected from the combined Connect Sources screen created in Prompt 1.

Do NOT create another separate Google Photos onboarding flow.

Create the post-connection experience:

**Select Photos**
→ **Processing**
→ **Match Child**
→ **Match Activity**
→ **Review uncertainty**
→ **Add to activity history**

---

# 3. Photo Processing

PROUDLY may determine:

* child
* photo date
* likely activity
* possible achievement

Do not expose technical AI/model language.

Use simple human-readable states.

Examples:

**Processing photos**

**Matched to Reet**

**Possible Soccer moment**

**Needs your review**

---

# 4. Photo Review

Create a quick review flow.

Allow correction of:

* Child
* Activity
* Date
* Achievement status
* Memory note

Avoid a large form for every photo.

If several images need review, support an efficient batch workflow.

Possible interaction:

Photo
→ confirm child/activity
→ next

Also consider multi-select for assigning several photos to the same activity.

---

# 5. Memories Within Activity Detail

Activity Detail created in Prompt 2 should contain a **Photos & Memories** section.

Example:

### Piano memories

Photo grid / chronological moments

May 2024
Spring recital

Dec 2025
Holiday performance

The relationship to activity history should remain obvious.

---

# 6. Photos Connected to Gantt Milestones

Where appropriate, achievement or major-moment markers in the Gantt may indicate that photos are available.

Example:

Tap milestone
→ Achievement preview
→ View memories

Do not overcrowd the Gantt with photo thumbnails.

The Gantt must remain visually clean.

Photos are supporting information.

---

# 7. Child Memories View

Create a consolidated memories view for one child only if it adds clear value.

Organize by:

* activity
* year
* meaningful moments

Avoid becoming a generic camera roll.

If a standalone Memories tab would complicate navigation, keep Memories accessible through Activities and child context instead.

Do not add a sixth bottom navigation item.

---

# 8. PORTFOLIO — PURPOSE

Create a polished **Portfolio** experience.

The Portfolio should automatically summarize the child's long-term activity record.

It should not require parents to manually recreate information already stored in PROUDLY.

Portfolio should derive from:

* Activities
* Gantt history
* Achievements
* dates
* selected memories

---

# 9. Portfolio Header

Example:

### Reet's Portfolio

**2018 – Present**

Summary:

* 8 activities
* 12 achievements
* 7 years tracked

Provide child switching using the same established pattern.

---

# 10. Activity Journey Summary

Because the Gantt is PROUDLY's core representation, include a polished condensed **Activity Journey** section within Portfolio.

This may be a read-only simplified Gantt snapshot.

Example:

Piano
2019 ━━━━━━━━━ Present

Soccer
2021 ━━━━━ 2024

Dance
2023 ━━━━━ Present

Do NOT duplicate the full interactive Activities screen.

Action:

**View full Gantt**

---

# 11. Portfolio Activities

Organize activities by category where appropriate.

Examples:

### Music

Piano
2019 – Present

Choir
2022 – 2025

### Sports

Soccer
2021 – 2024

Swimming
2022 – Present

Keep this structured and printable.

---

# 12. Portfolio Achievements

Create a curated achievement summary.

Examples:

### 2026

Piano Recital
Regional Soccer Championship

### 2025

Robotics Competition Finalist

Do not make every minor event appear equally important.

---

# 13. Selected Memories

Optionally include a small number of meaningful photos.

Use them sparingly.

Portfolio should remain structured, not turn into a scrapbook.

---

# 14. BRAG SHEET

Create the Brag Sheet as a concise exportable summary.

Purpose:

* school use
* applications
* sharing with family
* personal record

Possible content:

### Child

Name
Current grade

### Activities

Activity
Category
Start
End / Present

### Achievements

Achievement
Activity
Date

### Generated date

---

# 15. Brag Sheet Flow

Create:

**Portfolio**

→ **Preview Brag Sheet**

→ **Export PDF**

Optional:

**Share**

Do not build social-network functionality.

---

# 16. Brag Sheet Mobile Preview

The preview should feel like a document preview inside the mobile application.

Provide:

* Back
* Export
* Share where approved

Keep export controls clearly separate from document content.

---

# 17. NOTIFICATIONS

Create a restrained Notification Center.

PROUDLY should notify only when something deserves attention.

Potential notifications:

### New activities found

**3 new activities found for Reet**

### Possible achievement

**We may have found a new achievement**

### Photos need review

**4 photos need a quick check**

### Connection issue

**Reconnect Google Calendar**

### Sync failure

**Calendar couldn't sync**

---

# 18. Notification Deep Links

Every actionable notification should take the parent directly to the relevant task.

Examples:

New activity
→ Discovery Review

Possible achievement
→ Achievement Review

Photos
→ Photo Review

Reconnect Calendar
→ Connected Sources

Do not create dead-end informational notifications.

---

# 19. Notification States

Support:

* unread
* read
* actionable
* resolved

Avoid excessive badges.

---

# 20. PROFILE / SETTINGS

Create a clean Settings hierarchy.

Do not create one very long page containing every possible setting.

Organize into logical groups.

---

# 21. Parent Account

Include:

* Parent profile
* Email/account
* Sign out

Keep routine account controls straightforward.

---

# 22. Children

Create a Child Management area.

Support:

* View children
* Add child
* Edit child
* Update profile/reference photo
* Delete child

Example:

### Reet

Grade 8

### Aanya

Grade 5

**+ Add child**

---

# 23. Consistent Multi-Child UX

Audit the entire app.

The same child-selection pattern must work consistently across:

* Home
* Activities
* Gantt
* Achievements
* Memories
* Portfolio

Do not invent unique selectors for different sections.

---

# 24. CONNECTED SOURCES

Create one Connected Sources screen.

Google Calendar and Google Photos MUST remain together.

Never separate them into two different Settings areas.

---

# 25. Google Calendar Connection

Show:

### Google Calendar

**Connected**

Account:
[parent@gmail.com](mailto:parent@gmail.com)

Last synced:
Today, 9:42 AM

Actions:

* Sync now
* Reconnect
* Disconnect

Use the same connection-state component originally created during onboarding.

---

# 26. Google Photos Connection

Show:

### Google Photos

**Connected**

Account:
[parent@gmail.com](mailto:parent@gmail.com)

Actions:

* Select more photos
* Reconnect
* Disconnect

Maintain consistency with Calendar.

---

# 27. Source Connection Error

Design:

### Google Calendar needs attention

**Reconnect**

### Google Photos permission expired

**Reconnect**

Do not use alarming error visuals for routine permission issues.

---

# 28. Sync Settings

If appropriate, provide basic controls around:

* manual sync
* background sync status
* last successful sync

Do not expose technical API configuration.

---

# 29. Notification Preferences

Allow simple control over useful notification groups.

Examples:

* New activities
* Possible achievements
* Photos requiring review
* Connection issues

Avoid overly granular settings.

---

# 30. Data & Privacy

Create appropriate structural space for:

* Manage data
* Remove imported item
* Delete child
* Delete account

Do not invent unsupported privacy/security claims.

---

# 31. GLOBAL EMPTY STATES

Create consistent empty states for:

### No activities

### No achievements

### No memories

### No portfolio data

### No notifications

Keep them functional.

Each empty state should contain one clear next step.

---

# 32. GLOBAL LOADING STATES

Create reusable loading states for:

* Initial app loading
* Calendar sync
* Photo processing
* Gantt loading
* Portfolio generation

Avoid generic full-screen spinners when content skeletons or inline progress would be more appropriate.

---

# 33. GANTT LOADING STATE

Because the Gantt is critical, give it a deliberate loading treatment.

Maintain visible structure:

* activity label area
* time axis skeleton
* activity-row skeletons

Do not show a blank white page with a spinner.

---

# 34. GANTT ERROR STATE

If activity history cannot load:

Keep the Activities screen structure visible.

Example:

### We couldn't load Reet's activity history

**Try again**

Secondary:

**Check connected sources**

Do not navigate the user away from the Activities section.

---

# 35. GANTT NO-RESULT FILTER STATE

Example:

### No Music activities in this period

Actions:

**Clear filters**

Do not treat this as "no data exists."

Clearly distinguish:

* no activity history
* no results from current filters

---

# 36. Success Feedback

Create reusable subtle success feedback for:

* Activity updated
* Achievement added
* Photo assigned
* Sync complete
* Portfolio exported

Avoid large success modal screens for routine actions.

---

# 37. APP-WIDE CONSISTENCY AUDIT

After completing Prompt 3, review all designs created from Prompts 1–3.

Check:

* navigation consistency
* child-selector consistency
* typography
* spacing
* CTA hierarchy
* input components
* bottom sheets
* filters
* icons
* radius
* card usage
* color usage
* states
* modal behavior
* back-navigation
* Gantt behavior

---

# 38. REMOVE GENERIC AI-DESIGN PATTERNS

Specifically inspect and remove:

* unnecessary cards
* excessive rounded rectangles
* giant empty spaces
* random colored containers
* random gradients
* excessive pills
* inconsistent icon styles
* repetitive statistic cards
* oversized CTAs
* decorative widgets with no function
* inconsistent spacing
* screens that feel unrelated to each other

---

# 39. GANTT REMAINS THE VISUAL CENTER OF PROUDLY

During the final audit, ensure that other features do not dilute the main product idea.

The hierarchy should remain:

### Core

**Activity journey / Gantt**

### Important supporting feature

**Achievements**

### Enrichment

**Photos & Memories**

### Output

**Portfolio / Brag Sheet**

### Utility

**Notifications / Settings**

This product hierarchy should be clear throughout the application.

---

# 40. FINAL NAVIGATION

Maintain:

* Home
* Activities
* Achievements
* Portfolio
* Profile

Do not add:

* Photos tab
* Discover tab
* Recommendations tab
* Marketplace tab
* Gmail tab

Keep the architecture disciplined.

---

# VISUAL SYSTEM

Continue using:

Primary teal-green: `#217C72`

Dark teal: `#175F58`

Soft mint: `#DCEFEB`

Background: `#F7F8F6`

Surface: `#FFFFFF`

Primary text: `#172321`

Secondary text: `#66716E`

Border: `#DCE3E0`

Achievement accent:

restrained warm gold.

Maintain a modern, clean, premium-but-approachable consumer mobile design.

---

# EXPLICITLY EXCLUDED

Do NOT add:

* Gmail
* Teacher recommendations
* Coach recommendations
* Classes
* Camps
* Growth recommendations
* Discover
* Resources
* Instructor marketplace

Do not create placeholders for these features.

---

# Final Deliverable

Complete the remaining connected prototype:

**Photos Processing**
**→ Photo Review**
**→ Activity Memories**
**→ Portfolio**
**→ Activity Journey Summary**
**→ Brag Sheet Preview**
**→ Export Flow**
**→ Notifications**
**→ Child Management**
**→ Connected Sources**
**→ Profile & Settings**

Then perform a final consistency audit across **all Prompt 1, Prompt 2 and Prompt 3 screens**.

The complete PROUDLY prototype should feel like one intentionally designed mobile application built around one core idea:

> **A child's entire extracurricular journey, clearly understood through a beautiful interactive Gantt chart.**
