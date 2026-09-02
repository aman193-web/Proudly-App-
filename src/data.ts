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
  | "Sports"
  | "Music"
  | "Dance & Theater"
  | "Academics"
  | "Arts"
  | "STEM"
  | "Outdoors"
  | "Other";

export const CATEGORIES: Category[] = [
  "Sports",
  "Music",
  "Dance & Theater",
  "Academics",
  "Arts",
  "STEM",
  "Outdoors",
  "Other",
];

// Quiet category tint used only for the small identifier dot — bars stay calm.
export const CATEGORY_COLOR: Record<Category, string> = {
  Sports: "#3d7fb0",
  Music: "#217c72",
  "Dance & Theater": "#a85ca0",
  Academics: "#c08a2e",
  Arts: "#c96b52",
  STEM: "#5a6bb5",
  Outdoors: "#5b924f",
  Other: "#7a857f",
};

/* ---------- Activity level ----------
   Four rungs a child can sit on within an activity. PROUDLY suggests one; the
   parent may override it. The suggestion is kept either way, so an override
   never destroys what PROUDLY worked out. */
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
  /** What PROUDLY works out from the record. Never overwritten by the parent. */
  suggestedLevel: ActivityLevel;
  /** What the app shows and uses. Equals suggestedLevel until a parent changes it. */
  currentLevel: ActivityLevel;
  levelSource: LevelSource;
  memories: string[];
  history: { date: YM; label: string }[];
};

export const ACTIVITIES: Activity[] = [
  {
    id: "piano",
    childId: "reet",
    name: "Piano",
    category: "Music",
    start: { y: 2019, m: 9 },
    end: "present",
    note: "Practices most mornings before school. Loves ragtime lately.",
    sessionsPerWeek: 2,
    suggestedLevel: "Champion",
    currentLevel: "Champion",
    levelSource: "proudly",
    memories: [
      "https://images.unsplash.com/photo-1577877777751-3f1ec20a0715?w=400&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1590581296894-3c897baa0e54?w=400&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1590581296900-2e7f7e86a1cd?w=400&h=400&fit=crop&auto=format",
    ],
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
    category: "Sports",
    start: { y: 2021, m: 3 },
    end: { y: 2024, m: 6 },
    sessionsPerWeek: 2,
    suggestedLevel: "Intermediate",
    currentLevel: "Intermediate",
    levelSource: "proudly",
    memories: [
      "https://images.unsplash.com/photo-1622659097509-4d56de14539e?w=400&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1622659097972-68f1d8c1829f?w=400&h=400&fit=crop&auto=format",
    ],
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
    category: "Sports",
    start: { y: 2020, m: 1 },
    end: { y: 2022, m: 7 },
    approxStart: true,
    sessionsPerWeek: 1,
    suggestedLevel: "Intermediate",
    currentLevel: "Intermediate",
    levelSource: "proudly",
    memories: [
      "https://images.unsplash.com/photo-1651614158095-b98b6c1da74b?w=400&h=400&fit=crop&auto=format",
    ],
    history: [
      { date: { y: 2020, m: 1 }, label: "Learn-to-swim programme" },
      { date: { y: 2021, m: 8 }, label: "Regional meet — 2nd place, 50m free" },
    ],
  },
  {
    id: "choir",
    childId: "reet",
    name: "Choir",
    category: "Music",
    start: { y: 2022, m: 9 },
    end: "present",
    sessionsPerWeek: 1,
    suggestedLevel: "Intermediate",
    currentLevel: "Intermediate",
    levelSource: "proudly",
    memories: [
      "https://images.unsplash.com/photo-1632433796103-83acf2ae78b6?w=400&h=400&fit=crop&auto=format",
    ],
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
    memories: [
      "https://images.unsplash.com/photo-1681312206210-5f52c564d30d?w=400&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1558905566-ddbeb2fc2c2f?w=400&h=400&fit=crop&auto=format",
    ],
    history: [
      { date: { y: 2023, m: 1 }, label: "Started ballet" },
      { date: { y: 2025, m: 6 }, label: "Summer showcase" },
    ],
  },
  {
    id: "art",
    childId: "reet",
    name: "Art Club",
    category: "Arts",
    start: { y: 2021, m: 9 },
    end: { y: 2023, m: 6 },
    sessionsPerWeek: 1,
    suggestedLevel: "Beginner",
    currentLevel: "Beginner",
    levelSource: "proudly",
    memories: [
      "https://images.unsplash.com/photo-1512253080918-79cf0c2e0650?w=400&h=400&fit=crop&auto=format",
    ],
    history: [{ date: { y: 2021, m: 9 }, label: "Joined after-school art club" }],
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
    memories: [
      "https://images.unsplash.com/photo-1714646793130-0dc0c5a04f64?w=400&h=400&fit=crop&auto=format",
    ],
    history: [
      { date: { y: 2023, m: 9 }, label: "Joined chess club" },
      { date: { y: 2025, m: 2 }, label: "Club champion" },
    ],
  },
  {
    id: "robotics",
    childId: "reet",
    name: "Robotics",
    category: "STEM",
    start: { y: 2024, m: 9 },
    end: "present",
    sessionsPerWeek: 2,
    suggestedLevel: "Intermediate",
    currentLevel: "Intermediate",
    levelSource: "proudly",
    memories: [
      "https://images.unsplash.com/photo-1742047654060-fcd0b0d06b7a?w=400&h=400&fit=crop&auto=format",
    ],
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
    category: "Music",
    start: { y: 2022, m: 9 },
    end: "present",
    sessionsPerWeek: 1,
    suggestedLevel: "Intermediate",
    currentLevel: "Intermediate",
    levelSource: "proudly",
    memories: [
      "https://images.unsplash.com/photo-1636464808108-644053e72420?w=400&h=400&fit=crop&auto=format",
    ],
    history: [{ date: { y: 2022, m: 9 }, label: "Started lessons" }],
  },
  {
    id: "a-gym",
    childId: "aanya",
    name: "Gymnastics",
    category: "Sports",
    start: { y: 2023, m: 3 },
    end: "present",
    sessionsPerWeek: 2,
    suggestedLevel: "Intermediate",
    currentLevel: "Intermediate",
    levelSource: "proudly",
    memories: [
      "https://images.unsplash.com/photo-1655842556539-db2d2099ded1?w=400&h=400&fit=crop&auto=format",
    ],
    history: [{ date: { y: 2023, m: 3 }, label: "Started gymnastics" }],
  },
  {
    id: "a-paint",
    childId: "aanya",
    name: "Painting",
    category: "Arts",
    start: { y: 2021, m: 6 },
    end: "present",
    approxStart: true,
    sessionsPerWeek: 1,
    suggestedLevel: "Intermediate",
    currentLevel: "Learning",
    levelSource: "parent",
    memories: [
      "https://images.unsplash.com/photo-1536221993589-9edbbca2c7fc?w=400&h=400&fit=crop&auto=format",
    ],
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
  image?: string;
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
    image:
      "https://images.unsplash.com/photo-1619159846911-3687cc9e9820?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: "ach-piano-recital",
    childId: "reet",
    activityId: "piano",
    title: "Spring Piano Recital",
    date: { y: 2022, m: 5 },
    description: "First solo performance in front of an audience at the community hall.",
    image:
      "https://images.unsplash.com/photo-1744829779302-40d24fdf83cc?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: "ach-soccer-regional",
    childId: "reet",
    activityId: "soccer",
    title: "Regional Tournament — Runner Up",
    date: { y: 2023, m: 3 },
    description: "Team reached the regional final and finished second overall.",
    image:
      "https://images.unsplash.com/photo-1637635753233-b45f6539136d?w=800&h=600&fit=crop&auto=format",
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
    image:
      "https://images.unsplash.com/photo-1742767069929-0c663150b164?w=800&h=600&fit=crop&auto=format",
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
  email: "parent@gmail.com",
  photo:
    "https://images.unsplash.com/photo-1573497019707-1c04de26e58c?w=200&h=200&fit=crop&auto=format",
};

/* ---------- Connected sources ---------- */
export const SOURCES = {
  calendar: {
    account: "parent@gmail.com",
    lastSync: "Today, 9:42 AM",
  },
  photos: {
    account: "parent@gmail.com",
    lastSync: "Today, 9:42 AM",
  },
};

/* ---------- Notifications ---------- */
export type NotifKind = "activities" | "achievement" | "photos" | "reconnect" | "sync";

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
    id: "n-photos",
    kind: "photos",
    title: "4 photos need a quick check",
    body: "We matched them to activities but weren't fully sure.",
    time: "5h ago",
    read: false,
    childId: "reet",
  },
  {
    id: "n-achievement",
    kind: "achievement",
    title: "We may have found a new achievement",
    body: "A trophy photo from March looks like a soccer milestone.",
    time: "Yesterday",
    read: false,
    childId: "reet",
  },
  {
    id: "n-reconnect",
    kind: "reconnect",
    title: "Reconnect Google Photos",
    body: "Permission expired. Reconnect to keep memories in sync.",
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

/* ---------- Photo import candidates ---------- */
// The post-connection flow: PROUDLY proposes a child + activity + date for each photo.
export type PhotoCandidate = {
  id: string;
  url: string;
  childId: string;
  activityId: string;
  date: YM;
  confident: boolean; // false → needs your review
  achievement?: string; // possible achievement title
};

export const PHOTO_CANDIDATES: PhotoCandidate[] = [
  {
    id: "p1",
    url: "https://images.unsplash.com/photo-1629977007371-0ba395424741?w=600&h=600&fit=crop&auto=format",
    childId: "reet",
    activityId: "soccer",
    date: { y: 2023, m: 3 },
    confident: true,
    achievement: "Regional Tournament — Runner Up",
  },
  {
    id: "p2",
    url: "https://images.unsplash.com/photo-1680024436315-fb06267264b2?w=600&h=600&fit=crop&auto=format",
    childId: "reet",
    activityId: "soccer",
    date: { y: 2023, m: 3 },
    confident: true,
  },
  {
    id: "p3",
    url: "https://images.unsplash.com/photo-1475275166152-f1e8005f9854?w=600&h=600&fit=crop&auto=format",
    childId: "reet",
    activityId: "piano",
    date: { y: 2024, m: 5 },
    confident: false,
  },
  {
    id: "p4",
    url: "https://images.unsplash.com/photo-1685339009948-d807094b1457?w=600&h=600&fit=crop&auto=format",
    childId: "reet",
    activityId: "ballet",
    date: { y: 2025, m: 6 },
    confident: false,
  },
];

/* ---------- Memory helpers ---------- */
// A flattened memory tied back to its activity + child, for the memories views.
export type Memory = {
  url: string;
  activityId: string;
  activityName: string;
  childId: string;
  category: Category;
  date: YM;
};

export function memoriesFor(childId: string | "all"): Memory[] {
  const out: Memory[] = [];
  for (const a of activitiesFor(childId)) {
    a.memories.forEach((url, i) => {
      // Spread memory dates across the activity's span for a believable chronology.
      const endY = a.end === "present" ? TODAY.y : a.end.y;
      const y = Math.min(a.start.y + i, endY);
      out.push({
        url,
        activityId: a.id,
        activityName: a.name,
        childId: a.childId,
        category: a.category,
        date: { y, m: a.start.m },
      });
    });
  }
  return out.sort((p, q) => dec(q.date) - dec(p.date));
}

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
