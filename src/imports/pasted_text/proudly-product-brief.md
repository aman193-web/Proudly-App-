# PROUDLY — Product Understanding for Figma Make

Design a modern, polished **mobile application** called **PROUDLY**.

PROUDLY helps parents automatically organize and track their children's extracurricular activities, achievements, milestones, photos, and long-term activity history.

The app should eventually help a parent answer questions such as:

* When did my child start soccer?
* How long did they play piano?
* What activities are still ongoing?
* What competitions, performances, awards, recitals, certifications, or milestones have they achieved?
* What photos and memories are connected to each activity?
* What does their complete extracurricular journey look like over several years?

The end result is a structured child profile containing:

**Activities → Duration → Milestones → Achievements → Memories → Portfolio**

The main user is a **parent tracking one or more children**.

---

# Core Product Areas

The complete PROUDLY application will eventually contain:

* Sign in / account
* Parent onboarding
* Child profiles
* Multiple children
* Google Calendar integration
* Google Photos integration
* Activity discovery
* Full-fledged interactive Gantt chart
* Activity details
* Achievements
* Photos and memories
* Portfolio
* Brag Sheet
* Notifications
* Connected Sources
* Profile / Settings

---

# Critical Product Requirements

## Google Calendar + Google Photos

Google Calendar and Google Photos must be connected from the **same Connect Sources screen**.

Do not create two unrelated source-connection workflows.

The user may connect:

* Google Calendar only
* Google Photos only
* both sources

The UI should clearly show:

* Not connected
* Connecting
* Connected
* Reconnect required
* Permission error

---

## Activities

Activities are one of the most important areas of PROUDLY.

The Activities experience must use a **full-fledged interactive Gantt chart**.

Do not replace it with:

* a normal timeline
* simple list
* activity feed
* card-only layout

The Gantt will eventually visualize:

* one row per activity
* start date
* end date
* ongoing status
* completed status
* duration
* achievement milestones plotted along activity bars
* overlapping activities
* multiple years

The Gantt itself will be designed in a later phase, but the current navigation and UX architecture should leave proper room for it.

---

# Achievements

Achievements are a primary product feature.

Examples:

* Recital
* Tournament
* Competition
* Award
* Medal
* Graduation
* Certification
* Performance
* Championship
* Major milestone

Parents should eventually be able to manually add and edit achievements.

Achievements should also relate back to a specific activity where applicable.

---

# Multiple Children

PROUDLY must support multiple children.

The child-switching pattern should remain consistent throughout the app.

Examples:

* Reet
* Aanya
* All Kids where appropriate

Do not design the application as if it permanently supports only one child.

---

# Product Scope Exclusions

Do NOT include:

* Gmail integration
* Teacher recommendations
* Coach recommendations
* Classes recommendations
* Camp recommendations
* Growth recommendations
* Discover section
* Resources marketplace
* Instructor marketplace

Do not create placeholder tabs or navigation for these features.

---

# Mobile Platform

This is a real mobile application for:

* iOS
* Android

The implementation direction is:

* React Native
* Expo
* TypeScript
* Expo Router

Therefore all UX patterns should be practical for a native mobile application.

Avoid desktop/web interaction patterns.

---

# Design Quality Direction

PROUDLY should look like it was designed by a skilled product-design team, not generated screen-by-screen by AI.

The product should feel:

* modern
* clean
* calm
* polished
* premium but approachable
* trustworthy
* parent-focused
* highly usable
* spacious but not empty
* visually consistent

Do not make it childish just because the app is about children.

The parent is the primary user.

Think of a sophisticated modern consumer productivity/family application.

---

# Visual Style

Use a restrained teal-green direction inspired by the existing PROUDLY material.

Suggested palette:

* Primary teal-green: `#217C72`
* Dark teal: `#175F58`
* Soft mint: `#DCEFEB`
* Main background: `#F7F8F6`
* Surface: `#FFFFFF`
* Primary text: `#172321`
* Secondary text: `#66716E`
* Border/divider: `#DCE3E0`

Achievements may use a restrained warm-gold accent.

Use teal selectively for:

* primary CTA
* active navigation
* selected states
* connection success
* important interactive elements
* eventually ongoing Gantt activities

Do not make every surface teal.

---

# UI Principles

Use:

* clear content hierarchy
* consistent spacing system
* restrained corner radii
* familiar mobile controls
* strong primary/secondary CTA hierarchy
* accessible touch targets
* clear labels
* native-feeling bottom navigation
* reusable components
* consistent field patterns
* consistent child selector
* consistent sheets/modals

Avoid:

* excessive cards
* random floating cards
* giant empty spaces
* excessive gradients
* glassmorphism
* heavy shadows
* oversized buttons
* giant rounded containers
* too many pills
* emojis as primary UI icons
* random illustration styles
* web-style navigation
* desktop headers
* tiny controls
* inconsistent spacing
* overly playful or childish visual language

The goal is **quiet confidence and usability**.

---

# Navigation Direction

Plan around five primary areas:

* Home
* Activities
* Achievements
* Portfolio
* Profile / Settings

Use a mobile-native bottom navigation pattern.

Do not place desktop-style top navigation across the screen.

---

# Important Instruction

Do not attempt to design the entire application in one screen.

Build the system progressively and keep every new screen consistent with the components, spacing, navigation, and design language established in the earlier screens.
