export type Child = {
  id: string;
  name: string;
  grade: string;
  /** ISO date, YYYY-MM-DD. Age is always derived from this, never entered. */
  dob: string;
  photo: string;
  color: string;
};

export const CHILDREN: Child[] = [
  {
    id: "reet",
    name: "Reet",
    grade: "Grade 6",
    dob: "2014-09-12",
    photo:
      "https://images.unsplash.com/photo-1762444760659-54caed7cbb1a?w=200&h=200&fit=crop&auto=format",
    color: "#217c72",
  },
  {
    id: "aanya",
    name: "Aanya",
    grade: "Grade 3",
    dob: "2017-11-03",
    photo:
      "https://images.unsplash.com/photo-1698768645748-c62b3e5202ca?w=200&h=200&fit=crop&auto=format",
    color: "#b8893b",
  },
];

/* ---------- Time helpers ---------- */
// A year-month point. m is 1-12.
export type YM = { y: number; m: number };

// Decimal year for positioning on the timeline.
export const dec = (d: YM) => d.y + (d.m - 1) / 12;

export const TODAY: YM = { y: 2026, m: 8 };

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const fmtMonth = (d: YM) => `${MONTHS[d.m - 1]} ${d.y}`;

/** Whole years old on the given date. Returns null for a missing/unparseable DOB. */
export function ageFromDob(dob: string | undefined, at: YM = TODAY): number | null {
  if (!dob) return null;
  const [y, m, d] = dob.split("-").map(Number);
  if (!y || !m || !d) return null;
  let age = at.y - y;
  // Birthday has not landed yet this year.
  if (at.m < m) age -= 1;
  return age < 0 ? null : age;
}

export function durationText(start: YM, end: YM | "present"): string {
  const e = end === "present" ? TODAY : end;
  let months = (e.y - start.y) * 12 + (e.m - start.m);
  if (months < 0) months = 0;
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} yr${y > 1 ? "s" : ""}`);
  if (m) parts.push(`${m} mo`);
  return parts.join(" ") || "New";
}

/* ---------- Categories ---------- */
export type Category =
  | "Sports & Athletics"
  | "Music & Performance"
  | "Dance & Theater"
  | "Academics"
  | "Arts & Crafts"
  | "STEM & Robotics"
  | "Outdoors"
  | "Volunteering"
  | "Other";

export const CATEGORIES: Category[] = [
  "Sports & Athletics",
  "Music & Performance",
  "Dance & Theater",
  "Academics",
  "Arts & Crafts",
  "STEM & Robotics",
  "Outdoors",
  "Volunteering",
  "Other",
];

/* Short form for places a full category name would not fit — row pills, tight
   trailing labels. The full name is used wherever there is room. */
export const CATEGORY_SHORT: Record<Category, string> = {
  "Sports & Athletics": "Sports",
  "Music & Performance": "Music",
  "Dance & Theater": "Dance",
  Academics: "Academics",
  "Arts & Crafts": "Arts",
  "STEM & Robotics": "STEM",
  Outdoors: "Outdoors",
  Volunteering: "Volunteer",
  Other: "Other",
};

// Quiet category tint used only for the small identifier dot — bars stay calm.
export const CATEGORY_COLOR: Record<Category, string> = {
  "Sports & Athletics": "#3d7fb0",
  "Music & Performance": "#217c72",
  "Dance & Theater": "#a85ca0",
  Academics: "#c08a2e",
  "Arts & Crafts": "#c96b52",
  "STEM & Robotics": "#5a6bb5",
  Outdoors: "#5b924f",
  Volunteering: "#b5532f",
  Other: "#7a857f",
};

/* ---------- Activity level ----------
   Four rungs a child can sit on within an activity. BragOn suggests one; the
   parent may override it. The suggestion is kept either way, so an override
   never destroys what BragOn worked out. */
export type ActivityLevel = "Learning" | "Beginner" | "Intermediate" | "Champion";

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  "Learning",
  "Beginner",
  "Intermediate",
  "Champion",
];

/** Rank of a level, for comparisons and thresholds. */
export const LEVEL_RANK: Record<ActivityLevel, number> = {
  Learning: 0,
  Beginner: 1,
  Intermediate: 2,
  Champion: 3,
};

/** Who decided the current level. */
export type LevelSource = "proudly" | "parent";

/* ---------- Activities ---------- */
export type Activity = {
  id: string;
  childId: string;
  name: string;
  category: Category;
  start: YM;
  end: YM | "present";
  approxStart?: boolean;
  approxEnd?: boolean;
  note?: string;
  /** Typical sessions per week, where known. Feeds the level suggestion. */
  sessionsPerWeek?: number;
  /** Hours logged to date. Volunteering is measured in hours, not sessions. */
  hours?: number;
  /** What BragOn works out from the record. Never overwritten by the parent. */
  suggestedLevel: ActivityLevel;
  /** What the app shows and uses. Equals suggestedLevel until a parent changes it. */
  currentLevel: ActivityLevel;
  levelSource: LevelSource;
  history: { date: YM; label: string }[];
};

export const ACTIVITIES: Activity[] = [
  {
    id: "piano",
    childId: "reet",
    name: "Piano",
    category: "Music & Performance",
    start: { y: 2019, m: 9 },
    end: "present",
    note: "Practices most mornings before school. Loves ragtime lately.",
    sessionsPerWeek: 2,
    suggestedLevel: "Champion",
    currentLevel: "Champion",
    levelSource: "proudly",
    history: [
      { date: { y: 2019, m: 9 }, label: "Started weekly lessons" },
      { date: { y: 2022, m: 5 }, label: "First spring recital" },
      { date: { y: 2024, m: 5 }, label: "Grade 3 examination — Distinction" },
      { date: { y: 2026, m: 5 }, label: "Annual recital solo" },
    ],
  },
  {
    id: "soccer",
    childId: "reet",
    name: "Soccer",
    category: "Sports & Athletics",
    start: { y: 2021, m: 3 },
    end: { y: 2024, m: 6 },
    sessionsPerWeek: 2,
    suggestedLevel: "Intermediate",
    currentLevel: "Intermediate",
    levelSource: "proudly",
    history: [
      { date: { y: 2021, m: 3 }, label: "Joined the junior league" },
      { date: { y: 2023, m: 3 }, label: "Regional tournament — Runner up" },
      { date: { y: 2024, m: 6 }, label: "Final season with the club" },
    ],
  },
  {
    id: "swimming",
    childId: "reet",
    name: "Swimming",
    category: "Sports & Athletics",
    start: { y: 2020, m: 1 },
    end: { y: 2022, m: 7 },
    approxStart: true,
    sessionsPerWeek: 1,
    suggestedLevel: "Intermediate",
    currentLevel: "Intermediate",
    levelSource: "proudly",
    history: [
      { date: { y: 2020, m: 1 }, label: "Learn-to-swim programme" },
      { date: { y: 2021, m: 8 }, label: "Regional meet — 2nd place, 50m free" },
    ],
  },
  {
    id: "choir",
    childId: "reet",
    name: "Choir",
    category: "Music & Performance",
    start: { y: 2022, m: 9 },
    end: "present",
    sessionsPerWeek: 1,
    suggestedLevel: "Intermediate",
    currentLevel: "Intermediate",
    levelSource: "proudly",
    history: [{ date: { y: 2022, m: 9 }, label: "Joined the school choir" }],
  },
  {
    id: "ballet",
    childId: "reet",
    name: "Dance",
    category: "Dance & Theater",
    start: { y: 2023, m: 1 },
    end: "present",
    sessionsPerWeek: 2,
    suggestedLevel: "Intermediate",
    currentLevel: "Intermediate",
    levelSource: "proudly",
    history: [
      { date: { y: 2023, m: 1 }, label: "Started ballet" },
      { date: { y: 2025, m: 6 }, label: "Summer showcase" },
    ],
  },
  {
    id: "art",
    childId: "reet",
    name: "Art Club",
    category: "Arts & Crafts",
    start: { y: 2021, m: 9 },
    end: { y: 2023, m: 6 },
    sessionsPerWeek: 1,
    suggestedLevel: "Beginner",
    currentLevel: "Beginner",
    levelSource: "proudly",
    history: [{ date: { y: 2021, m: 9 }, label: "Joined after-school art club" }],
  },
  {
    id: "petshop",
    childId: "reet",
    name: "Pet shop volunteer",
    category: "Volunteering",
    start: { y: 2025, m: 2 },
    end: "present",
    sessionsPerWeek: 1,
    hours: 24,
    suggestedLevel: "Intermediate",
    currentLevel: "Intermediate",
    levelSource: "proudly",
    history: [
      { date: { y: 2025, m: 2 }, label: "Started weekend shifts at the local pet shop" },
    ],
  },
  {
    id: "chess",
    childId: "reet",
    name: "Chess",
    category: "Academics",
    start: { y: 2023, m: 9 },
    end: "present",
    sessionsPerWeek: 1,
    suggestedLevel: "Intermediate",
    currentLevel: "Beginner",
    levelSource: "parent",
    history: [
      { date: { y: 2023, m: 9 }, label: "Joined chess club" },
      { date: { y: 2025, m: 2 }, label: "Club champion" },
    ],
  },
  {
    id: "robotics",
    childId: "reet",
    name: "Robotics",
    category: "STEM & Robotics",
    start: { y: 2024, m: 9 },
    end: "present",
    sessionsPerWeek: 2,
    suggestedLevel: "Intermediate",
    currentLevel: "Intermediate",
    levelSource: "proudly",
    history: [
      { date: { y: 2024, m: 9 }, label: "Joined the robotics team" },
      { date: { y: 2025, m: 11 }, label: "State finals — Design award" },
    ],
  },
  /* ---------- Aanya ---------- */
  {
    id: "a-piano",
    childId: "aanya",
    name: "Piano",
    category: "Music & Performance",
    start: { y: 2022, m: 9 },
    end: "present",
    sessionsPerWeek: 1,
    suggestedLevel: "Intermediate",
    currentLevel: "Intermediate",
    levelSource: "proudly",
    history: [{ date: { y: 2022, m: 9 }, label: "Started lessons" }],
  },
  {
    id: "a-gym",
    childId: "aanya",
    name: "Gymnastics",
    category: "Sports & Athletics",
    start: { y: 2023, m: 3 },
    end: "present",
    sessionsPerWeek: 2,
    suggestedLevel: "Intermediate",
    currentLevel: "Intermediate",
    levelSource: "proudly",
    history: [{ date: { y: 2023, m: 3 }, label: "Started gymnastics" }],
  },
  {
    id: "a-paint",
    childId: "aanya",
    name: "Painting",
    category: "Arts & Crafts",
    start: { y: 2021, m: 6 },
    end: "present",
    approxStart: true,
    sessionsPerWeek: 1,
    suggestedLevel: "Intermediate",
    currentLevel: "Learning",
    levelSource: "parent",
    history: [{ date: { y: 2021, m: 6 }, label: "First painting classes" }],
  },
];

/* ---------- Achievements ---------- */
export type Achievement = {
  id: string;
  childId: string;
  activityId: string;
  title: string;
  date: YM;
  description?: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach-piano-grade3",
    childId: "reet",
    activityId: "piano",
    title: "Grade 3 Piano — Distinction",
    date: { y: 2024, m: 5 },
    description:
      "Passed the Royal Conservatory Grade 3 examination with distinction, scoring 92 out of 100.",
  },
  {
    id: "ach-piano-recital",
    childId: "reet",
    activityId: "piano",
    title: "Spring Piano Recital",
    date: { y: 2022, m: 5 },
    description: "First solo performance in front of an audience at the community hall.",
  },
  {
    id: "ach-soccer-regional",
    childId: "reet",
    activityId: "soccer",
    title: "Regional Tournament — Runner Up",
    date: { y: 2023, m: 3 },
    description: "Team reached the regional final and finished second overall.",
  },
  {
    id: "ach-swim-meet",
    childId: "reet",
    activityId: "swimming",
    title: "Regional Swim Meet — 2nd Place",
    date: { y: 2021, m: 8 },
    description: "Second place in the 50m freestyle at the regional meet.",
  },
  {
    id: "ach-chess-champ",
    childId: "reet",
    activityId: "chess",
    title: "Chess Club Champion",
    date: { y: 2025, m: 2 },
    description: "Won the school chess club winter championship.",
  },
  {
    id: "ach-robotics-state",
    childId: "reet",
    activityId: "robotics",
    title: "State Finals — Design Award",
    date: { y: 2025, m: 11 },
    description: "Recognised for the best engineering design at the state robotics finals.",
  },
  {
    id: "ach-a-gym",
    childId: "aanya",
    activityId: "a-gym",
    title: "Beam — Level 2 Badge",
    date: { y: 2024, m: 11 },
    description: "Earned the level 2 badge for balance beam.",
  },
];

/* ---------- Parent / account ---------- */
export const PARENT = {
  name: "Sarah",
  email: "sarah.mitchell@gmail.com",
  photo:
    "https://images.unsplash.com/photo-1573497019707-1c04de26e58c?w=200&h=200&fit=crop&auto=format",
};

/* ---------- Connected sources ----------
   Calendar only. Photos were cut from the Oct-1 redesign ("Photos removed
   for the test run"), so there is nothing else to connect. */
export const SOURCES = {
  calendar: {
    account: PARENT.email,
    lastSync: "Today, 9:42 AM",
  },
};

/* ---------- Notifications ---------- */
export type NotifKind = "activities" | "achievement" | "reconnect" | "sync";

export type Notification = {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
  childId?: string;
};

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n-activities",
    kind: "activities",
    title: "3 new activities found for Reet",
    body: "Detected from Google Calendar. Review to add them to the timeline.",
    time: "2h ago",
    read: false,
    childId: "reet",
  },
  {
    id: "n-achievement",
    kind: "achievement",
    title: "We may have found a new achievement",
    body: "A March calendar event looks like a soccer milestone.",
    time: "Yesterday",
    read: false,
    childId: "reet",
  },
  {
    id: "n-reconnect",
    kind: "reconnect",
    title: "Reconnect Google Photos",
    body: "Permission expired. Reconnect to keep the calendar in sync.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "n-sync",
    kind: "sync",
    title: "Calendar sync complete",
    body: "Everything is up to date as of this morning.",
    time: "2 days ago",
    read: true,
  },
];



/* ---------- Lookups ---------- */
export const activitiesFor = (childId: string | "all") =>
  childId === "all" ? ACTIVITIES : ACTIVITIES.filter((a) => a.childId === childId);

export const achievementsFor = (childId: string | "all") =>
  childId === "all" ? ACHIEVEMENTS : ACHIEVEMENTS.filter((a) => a.childId === childId);

export const achievementsForActivity = (activityId: string) =>
  ACHIEVEMENTS.filter((a) => a.activityId === activityId);

export const activityById = (id: string) => ACTIVITIES.find((a) => a.id === id);
export const achievementById = (id: string) => ACHIEVEMENTS.find((a) => a.id === id);
export const childById = (id: string) => CHILDREN.find((c) => c.id === id);
