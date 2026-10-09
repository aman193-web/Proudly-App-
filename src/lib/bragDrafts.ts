import {
  type Achievement,
  type Activity,
  type Category,
  TODAY,
  type YM,
  fmtMonth,
} from "../data";

/* Application-copy drafts
   -----------------------
   The brag sheet's descriptions are first drafts the parent edits, so they are
   generated here from the record rather than written by hand or fetched. Every
   generator takes a `variant` and returns a different phrasing for each value:
   "Rewrite" on the sheet just increments it, which is why each one offers
   exactly three readings of the same facts and never invents any.

   The limits (150 / 250 / 350) are the real Common App and UC field caps, and
   `fit` trims on a word boundary rather than letting a draft overrun them. */

const lc = (s: string) => (s ? s[0].toLowerCase() + s.slice(1) : s);

const fit = (s: string, n: number) => {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
};

const SEASONS = ["winter", "winter", "spring", "spring", "spring", "summer",
  "summer", "summer", "fall", "fall", "fall", "winter"];
const season = (d: YM) => SEASONS[d.m - 1];

export const monthsRun = (a: Activity) => {
  const e = a.end === "present" ? TODAY : a.end;
  return Math.max(1, (e.y - a.start.y) * 12 + (e.m - a.start.m) + 1);
};

/** The Common App's own activity-type vocabulary. */
export const CAPP_CATEGORY: Record<Category, string> = {
  "Sports & Athletics": "ATHLETICS — CLUB",
  "Music & Performance": "MUSIC",
  "Dance & Theater": "THEATER / DRAMA",
  Academics: "ACADEMIC",
  "Arts & Crafts": "ART",
  "STEM & Robotics": "SCIENCE / MATH",
  Outdoors: "OUTDOOR / RECREATION",
  Volunteering: "COMMUNITY SERVICE",
  Other: "OTHER CLUB / ACTIVITY",
};

/** Typical hours per session, used to turn a weekly cadence into a workload. */
const HOURS_PER_SESSION: Record<Category, number> = {
  "Sports & Athletics": 1.5,
  "Music & Performance": 1,
  "Dance & Theater": 1.5,
  Academics: 1.5,
  "Arts & Crafts": 1.5,
  "STEM & Robotics": 2,
  Outdoors: 2,
  Volunteering: 2,
  Other: 1,
};

/** How an admissions reader would name the thing, where the plain name is thin. */
const PHRASE: [RegExp, string][] = [
  [/piano|keyboard/i, "Private piano study with weekly lessons"],
  [/choir|chorus/i, "Singing in the school choir"],
  [/violin|guitar|cello|band/i, "Instrumental study with weekly lessons"],
  [/dance|ballet/i, "Dance training at a local studio"],
  [/theater|theatre|drama/i, "Theater rehearsal and performance"],
  [/soccer|football/i, "Club soccer"],
  [/swim/i, "Competitive swim team"],
  [/basketball|tennis|track|cricket/i, "Club athletics training and competition"],
  [/robot/i, "Robotics club build team"],
  [/chess/i, "Competitive chess"],
  [/debate|speech/i, "Competitive speech and debate"],
  [/art|paint|draw/i, "Studio art classes"],
  [/scout|hik|camp/i, "Outdoor skills and expeditions"],
];

const phraseFor = (a: Activity) =>
  PHRASE.find(([re]) => re.test(a.name))?.[1] ?? a.name;

/** Sessions per week → hours per week and weeks per year, both rounded. */
export function workload(a: Activity) {
  const perSession = HOURS_PER_SESSION[a.category];
  const perWeek = a.sessionsPerWeek ?? 1;
  return {
    hoursPerWeek: Math.max(1, Math.round(perSession * perWeek)),
    weeksPerYear: perWeek >= 3 ? 40 : perWeek === 2 ? 36 : 30,
    totalHours: Math.round(perSession * perWeek * 4.33 * monthsRun(a)),
  };
}

/* ---------- Common App: the 150-character activity description ---------- */
export function cappDescribe(a: Activity, wins: Achievement[], variant: number) {
  const ph = phraseFor(a);
  const months = monthsRun(a);
  const yrs = Math.floor(months / 12);
  const span = yrs >= 1 ? `${yrs}+ year${yrs > 1 ? "s" : ""}` : `${months} months`;
  const { hoursPerWeek } = workload(a);
  const w = wins[0];
  const w2 = wins[1];

  const tail = w
    ? [
        `${w.title} (${fmtMonth(w.date)}).`,
        `Highlight: ${lc(w.title)}, ${fmtMonth(w.date)}.`,
        `Recognized with ${lc(w.title)} in ${fmtMonth(w.date)}${
          w2 ? `; also ${lc(w2.title)}` : ""
        }.`,
      ]
    : [
        "Attend every session and keep raising my level.",
        "Practice between sessions and keep showing up each season.",
        "Committed to steady weekly progress.",
      ];

  return fit(
    [
      `${ph} since ${season(a.start)} ${a.start.y} — about ${hoursPerWeek} hr a week. ${tail[0]}`,
      `${span} of ${lc(ph)}, roughly ${hoursPerWeek} hr weekly. ${tail[1]}`,
      `Committed to ${lc(a.name)} since ${a.start.y}. ${tail[2]}`,
    ][variant % 3],
    150,
  );
}

/* ---------- UC application fields ---------- */
const UC_ROLE: [RegExp, string[]][] = [
  [/piano|violin|guitar|cello|band|keyboard/i, [
    "Practice daily between weekly lessons, prepare for graded exams and perform at studio recitals.",
    "Work through exam repertoire with my teacher and play at recitals each year.",
    "Keep a daily practice routine and set goals with my teacher each term.",
  ]],
  [/choir|chorus|voice|sing/i, [
    "Train technique and repertoire weekly and perform with the ensemble at concerts.",
    "Learn new songs each term, work on breath and range, and perform at concerts.",
    "Rehearse weekly and prepare pieces for auditions and performances.",
  ]],
  [/dance|ballet/i, [
    "Rehearse choreography every week and perform in the studio's year-end recital.",
    "Learn new routines each term, help newer dancers with combinations and perform at recitals.",
    "Train technique weekly and prepare solo and group pieces for performances.",
  ]],
  [/art|paint|draw/i, [
    "Build a portfolio across drawing and painting and enter work in school and district shows.",
    "Work on a new piece each term, take critique from my teacher and exhibit finished work.",
    "Practice drawing fundamentals weekly and develop longer independent projects.",
  ]],
  [/soccer|football|basketball|tennis|track|cricket|swim/i, [
    "Train with the team each week and play league and tournament matches.",
    "Work on skills at practice and compete in weekend league games and tournaments.",
    "Practice with the team, keep fit between sessions and compete each season.",
  ]],
  [/chess|debate|speech|quiz/i, [
    "Study openings and tactics each week and compete at local and regional tournaments.",
    "Prepare with my coach every week and play rated games each season.",
    "Practise regularly and enter tournaments throughout the year.",
  ]],
  [/robot|science|math|code/i, [
    "Design and build with the team each week and compete at regional events.",
    "Take a build role on the team, test between meetings and compete each season.",
    "Meet weekly to design, build and iterate, then compete at tournaments.",
  ]],
];

const roleFor = (a: Activity, variant: number) =>
  (UC_ROLE.find(([re]) => re.test(a.name))?.[1] ?? [
    "Take part every week and keep building my skills.",
    "Attend every session and practise in between.",
    "Show up each week and set new goals each term.",
  ])[variant % 3];

export function ucDescribe(a: Activity, wins: Achievement[], variant: number) {
  const ph = phraseFor(a);
  const months = monthsRun(a);
  const yrs = Math.floor(months / 12);
  const { hoursPerWeek } = workload(a);
  const role = roleFor(a, variant);
  const w = wins[0];
  const win = w
    ? [
        `Highlight: ${lc(w.title)} (${fmtMonth(w.date)}).`,
        `Recognized with ${lc(w.title)} in ${fmtMonth(w.date)}.`,
        `${w.title}, ${fmtMonth(w.date)}.`,
      ][variant % 3]
    : "";

  return fit(
    [
      `${ph} since ${season(a.start)} ${a.start.y} — about ${hoursPerWeek} hr a week. ${role} ${win}`,
      `${yrs >= 1 ? `${yrs}+ years` : `${months} months`} of ${lc(ph)}. ${role} ${win}`,
      `${role} I have kept this up since ${a.start.y}, about ${hoursPerWeek} hr every week. ${win}`,
    ][variant % 3],
    350,
  );
}

/** The level a UC award entry is claimed at, inferred from its title. */
export const awardLevel = (title: string) =>
  /international/i.test(title)
    ? "International"
    : /national/i.test(title)
      ? "National"
      : /state/i.test(title)
        ? "State"
        : /regional/i.test(title)
          ? "Regional"
          : /district|county|city|tournament|exam|grade \d/i.test(title)
            ? "City / Community"
            : "School";

export function ucEligibility(w: Achievement, a: Activity | undefined, variant: number) {
  const lvl = awardLevel(w.title);
  const who =
    lvl === "School"
      ? "students at my school or studio"
      : lvl === "State"
        ? "competitors from across the state"
        : lvl === "City / Community"
          ? "students in my district and community"
          : `competitors at the ${lvl.toLowerCase()} level`;
  return fit(
    [
      `Open to ${who}${a ? ` in ${lc(a.name)}` : ""}; selected by judges or instructors based on performance.`,
      `Awarded to ${who} who stand out in ${a ? lc(a.name) : "this area"}, chosen by a panel of judges.`,
      `${w.title}: recognizes ${who} for achievement${a ? ` in ${lc(a.name)}` : ""}.`,
    ][variant % 3],
    250,
  );
}

export function ucEarned(w: Achievement, a: Activity | undefined, variant: number) {
  const since = a ? a.start.y : "";
  return fit(
    [
      `Prepared through ${a ? `years of ${lc(a.name)} since ${since}` : "steady practice"}, then ${lc(w.title)} in ${fmtMonth(w.date)}.`,
      `Worked toward this for months with my ${a && /music|choir|piano|voice/i.test(a.name) ? "teacher" : "coach"}; earned it in ${fmtMonth(w.date)}.`,
      `Kept practising every week${a ? ` since ${since}` : ""} and put in extra time before the event in ${fmtMonth(w.date)}.`,
    ][variant % 3],
    250,
  );
}

/* ---------- Counselor questionnaire ---------- */
export const COUNSELOR_QUESTIONS: [string, string][] = [
  ["What are you proudest of, and why?", "A moment, a person, a change — told the way they would tell it."],
  ["What do you hope the letter mentions?", "The thing a recommender should not miss."],
  ["Three words you'd use to describe yourself", "Word · Word · Word"],
];

const TRAITS: Record<Category, string[]> = {
  "Music & Performance": ["Disciplined", "Patient", "Focused"],
  "Dance & Theater": ["Expressive", "Brave", "Poised"],
  "Arts & Crafts": ["Creative", "Observant", "Imaginative"],
  "Sports & Athletics": ["Competitive", "Team-minded", "Resilient"],
  Academics: ["Curious", "Articulate", "Sharp"],
  "STEM & Robotics": ["Inventive", "Methodical", "Curious"],
  Outdoors: ["Adventurous", "Self-reliant", "Steady"],
  Volunteering: ["Caring", "Dependable", "Kind"],
  Other: ["Steady", "Committed", "Loyal"],
};

export function counselorDraft(
  index: number,
  acts: Activity[],
  wins: Achievement[],
  variant: number,
) {
  if (!acts.length) return "";
  const byDepth = [...acts].sort((p, q) => monthsRun(q) - monthsRun(p));
  const top = byDepth[0];
  const yrs = Math.floor(monthsRun(top) / 12);
  const span = yrs >= 1 ? `${yrs} year${yrs > 1 ? "s" : ""}` : `${monthsRun(top)} months`;
  const others = byDepth.slice(1, 3).map((a) => lc(a.name));
  const ws = [...wins].sort(
    (p, q) => q.date.y * 12 + q.date.m - (p.date.y * 12 + p.date.m),
  );

  if (index === 0) {
    if (!ws.length) {
      return [
        `Sticking with ${lc(top.name)} for ${span}. Nobody made me keep going — I just kept showing up, and now it's part of who I am.`,
        `How far I've come in ${lc(top.name)} since ${top.start.y}. I can see the difference from where I started, and I earned every bit of it.`,
      ][variant % 2];
    }
    const w = ws[variant % ws.length];
    const a = acts.find((x) => x.id === w.activityId);
    return [
      `${w.title} in ${fmtMonth(w.date)}. I'd been doing ${a ? lc(a.name) : "it"} since ${a ? a.start.y : "years before"}, and it was the first time all that practice turned into something other people could see.`,
      `${w.title}. It wasn't luck — it came after ${a ? `${Math.max(1, Math.floor(monthsRun(a) / 12))}+ years of ${lc(a.name)}` : "a lot of work"}, and it taught me that small, steady effort adds up.`,
      `Getting ${lc(w.title)} (${fmtMonth(w.date)}). I almost didn't enter, and doing it anyway is the part I'm proudest of.`,
    ][Math.floor(variant / Math.max(1, ws.length)) % 3];
  }

  if (index === 1) {
    return [
      `That I've stayed with ${lc(top.name)} for ${span}${others.length ? ` while also making room for ${others.join(" and ")}` : ""}. I'm not always the best in the room, but I'm the one who keeps coming back.`,
      `How many different things I've committed to — ${[lc(top.name), ...others].join(", ")} — and that I've kept each one going instead of quitting when it got hard.`,
      `That ${wins.length ? `${wins.length} of my wins came` : "my progress came"} from showing up every week, not from talent alone. ${top.name} for ${span} is the proof.`,
    ][variant % 3];
  }

  const cats: Category[] = [];
  byDepth.forEach((a) => {
    if (!cats.includes(a.category)) cats.push(a.category);
  });
  const words: string[] = [];
  for (let k = 0; words.length < 3 && k < 9; k++) {
    const list = TRAITS[cats[k % cats.length]];
    const wd = list[(Math.floor(k / cats.length) + variant) % list.length];
    if (!words.includes(wd)) words.push(wd);
  }
  while (words.length < 3) words.push(["Steady", "Committed", "Curious"][words.length]);
  return words.join(" · ");
}

/* ---------- Grade chips ---------- */
/** "Grade 6" / "6th" / "K" → 6, or null when it cannot be read as a number. */
export const gradeNumber = (grade: string | undefined) => {
  const n = parseInt((grade ?? "").replace(/\D+/g, " ").trim(), 10);
  return Number.isNaN(n) ? null : n;
};

/** School-year index, so a year that starts in September counts as one year. */
const schoolYear = (d: YM) => Math.floor((d.y * 12 + d.m - 8) / 12);

/**
 * The four-grade strip beside each entry, with the grades the activity ran in
 * marked. Mirrors the application forms, which ask which grades you took part.
 */
export function gradeStrip(currentGrade: number | null, from: YM, to?: YM) {
  const high = currentGrade != null && currentGrade >= 9 ? 12 : (currentGrade ?? 12);
  const out: { g: number; on: boolean; future: boolean }[] = [];
  const startG =
    currentGrade != null
      ? currentGrade - (schoolYear(TODAY) - schoolYear(from))
      : null;
  const endG =
    currentGrade != null && to
      ? currentGrade - (schoolYear(TODAY) - schoolYear(to))
      : currentGrade;
  for (let g = high - 3; g <= high; g++) {
    out.push({
      g,
      on: startG != null && g >= startG && endG != null && g <= endG,
      future: currentGrade != null && g > currentGrade,
    });
  }
  return out;
}
