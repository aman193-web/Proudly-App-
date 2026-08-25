# PROUDLY — Prompt 1

Using the approved PROUDLY product understanding, create the first complete mobile UX flow.

Design for a modern iPhone-sized mobile canvas while ensuring the structure can also adapt to Android.

Do not design desktop versions.

This phase covers:

**Welcome → Sign In / Account → Parent Setup → Child Setup → Connect Sources → Initial Discovery → First Aha Moment**

Do not design the full Home dashboard, Gantt screen, Achievements area, Portfolio, or Settings yet.

---

# 1. Welcome Screen

Create a  premium first-launch experience.

Purpose:

Immediately explain what PROUDLY does without turning the screen into a marketing landing page.

Content hierarchy:

### PROUDLY logo / wordmark

### Primary value proposition

Something concise around:

**Your child's activities and achievements, organized automatically.**

### Short supporting statement

Explain that PROUDLY helps turn Calendar and Photos into a long-term record of activities and milestones.

### Primary CTA

**Get started**

### Secondary action

**Already have an account? Sign in**

Keep the screen visually calm.

Do not place several feature cards on the welcome screen.

---

# 2. Sign In Screen

Create a polished, compact authentication screen.

Include:

* Back navigation
* Screen title
* Email
* Password
* Sign in CTA
* Forgot password
* Create account option
* Continue with Google where appropriate

The form should sit naturally within the screen.

Do not place a giant CTA bar permanently fixed at the very bottom with excessive unused space above it.

The screen should have balanced vertical rhythm.

Use mobile keyboard-safe spacing.

---

# 3. Create Account

Keep account creation simple.

Potential fields:

* Parent name
* Email
* Password

Do not collect child information on the same screen.

Primary action:

**Create account**

Secondary:

**Already have an account? Sign in**

Use the same field components and spacing established on Sign In.

---

# 4. Parent Setup

If parent name was not already captured, collect only what is genuinely necessary.

Keep this lightweight.

Avoid long onboarding forms.

Use one primary task per screen.

---

# 5. Add First Child

Create the first-child setup screen.

Include:

* Child's first name
* Grade
* Child profile/reference photo

For the photo area:

* show a clear upload/add-photo interaction
* explain briefly that the photo helps PROUDLY recognize the child in Google Photos
* do not overwhelm the user with technical face-recognition terminology

Allow:

**Continue**

Multiple children are supported, but do not require the parent to add every child during onboarding.

Optionally provide:

**Add another child later**

---

# 6. Connect Sources

Create ONE combined **Connect Sources** screen.

This is a critical product requirement.

Show:

## Google Calendar

Purpose:
Find extracurricular activity events and milestones.

Possible status:
**Not connected**

Action:
**Connect**

---

## Google Photos

Purpose:
Find relevant photos and connect memories to activities.

Possible status:
**Not connected**

Action:
**Connect**

---

The parent may connect:

* Calendar only
* Photos only
* both

Connected state should be immediately recognizable.

Use the PROUDLY teal-green selectively for successful connection states.

Do not create separate Google Calendar and Google Photos onboarding screens.

Primary action after at least one source is connected:

**Continue**

Include only a short privacy/permission explanation.

Avoid technical OAuth language.

---

# 7. Source Connection States

Create component states for:

* Not connected
* Connecting
* Connected
* Permission denied
* Reconnect required

These should be reusable later in Settings → Connected Sources.

Do not create a different visual pattern later.

---

# 8. Initial Discovery / Processing

After source connection, show PROUDLY building the child's initial activity history.

This should feel purposeful and reassuring.

Potential messaging:

**Building Reet's activity history**

Show progress through understandable tasks such as:

* Checking Calendar
* Reviewing Photos
* Organizing activities
* Identifying possible achievements

Do not show technical logs.

Do not show AI/model terminology.

The user should understand what is happening without understanding how it is implemented.

---

# 9. Uncertain Information Review

If PROUDLY finds something uncertain, create a lightweight review experience.

Examples:

**Is this Soccer?**

**Is this Reet?**

**This may be an achievement**

Allow fast confirmation/correction.

The product philosophy should be:

**PROUDLY handles obvious information; the parent corrects exceptions.**

Do not require users to manually approve every single Calendar event.

---

# 10. First Aha Moment

Create an onboarding-completion screen where the parent sees meaningful results for the first time.

Example hierarchy:

### Reet's activity history is ready

### Summary

* 8 activities found
* 5 achievements found
* 4 years organized

### Activity Journey Preview

Show a small preview suggesting the future Gantt structure.

For example:

Piano
2019 ━━━━━━━ Present

Soccer
2021 ━━━━━ 2024

Dance
2023 ━━━ Present

This is only a preview.

Do not attempt to place the full interactive Gantt chart here.

### Achievement preview

Show 1–2 recent milestones.

### Primary CTA

**Explore Reet's activities**

This should be the onboarding "aha moment."

The parent should instantly understand:

**PROUDLY has transformed scattered Calendar and Photos information into an organized long-term record of my child.**

---

# 11. Bottom Navigation

After onboarding is complete, establish a mobile-native bottom navigation with:

* Home
* Activities
* Achievements
* Portfolio
* Profile

Use consistent icons.

Do not use text-only desktop navigation across the top.

The navigation should remain simple and familiar.

---

# 12. Shared Component System

Create reusable components during this phase for:

* App header
* Back button
* Primary CTA
* Secondary CTA
* Text input
* Password input
* Source connection row/card
* Child profile/photo control
* Progress indicator
* Status message
* Success state
* Error state
* Bottom navigation
* Child avatar
* Small stat item

Reuse them across screens rather than designing every screen independently.

---

# Visual Direction

Maintain:

* modern
* clean
* premium but approachable
* calm
* professional
* parent-focused
* native-mobile feel

Use:

* Primary teal-green: `#217C72`
* Dark teal: `#175F58`
* Soft mint: `#DCEFEB`
* Background: `#F7F8F6`
* Surface: `#FFFFFF`
* Primary text: `#172321`
* Secondary text: `#66716E`
* Border: `#DCE3E0`

Use teal selectively.

Keep most surfaces white or neutral.

Achievements may use a restrained warm-gold accent.

---

# Avoid

Do not produce:

* generic AI-generated forms
* excessive unused vertical space
* giant bottom CTA bars
* random pill components
* excessive cards
* excessive rounded corners
* glassmorphism
* gradients everywhere
* heavy shadows
* web layouts
* desktop navigation
* oversized form controls
* childish illustrations
* emoji-based UI
* inconsistent icons
* different visual systems between screens

The screens should feel like they were designed together by one experienced mobile product-design team.

---

# Final Deliverable for This Prompt

Create the complete connected prototype flow for:

**Welcome**
**→ Sign In / Create Account**
**→ Parent Setup**
**→ Add Child**
**→ Connect Google Calendar + Google Photos**
**→ Initial Processing**
**→ Uncertainty Review**
**→ First Activity History / Aha Moment**

Ensure every screen is clickable in prototype mode and that the transitions are logical and easy to follow.
