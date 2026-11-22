// Presentation-only extras for the v2 home page. The courses/faculty themselves still come from
// lib/data/courses.ts and lib/data/faculty.ts, so there is one source of truth.

export const methodSteps = [
  {
    term: "MATN",
    arabic: "متن",
    title: "Start from the sources, then the texts.",
    body: "The Qur'an and the Sunnah first — then the classical books scholars have built on them for centuries. You read them line by line, with a teacher. Not summaries of summaries.",
  },
  {
    term: "SANAD",
    arabic: "سند",
    title: "Know who you are taking your deen from.",
    body: "Your teachers studied under teachers, and you can ask where a thing comes from. Ibn Sīrīn said it plainly: this knowledge is religion — so look to whom you take your religion from.",
  },
  {
    term: "MANHAJ",
    arabic: "منهج",
    title: "As the Sahabah understood it.",
    body: "Sound creed and sound method, free of distortion: the Book and the Sunnah upon the understanding of the first generation — so you are not left to your own opinions, or to whoever is loudest online.",
  },
  {
    term: "TARTĪB",
    arabic: "ترتيب",
    title: "An order to learn in. A way to know you're learning.",
    body: "Levels that build on each other, regular review, tasks and reminders in your student portal. You always know where you stand, what comes next, and why.",
  },
] as const;

export const tensionText =
  "You've watched the clips. Saved the reels. Bookmarked a playlist you'll get to someday. You know a lot of fragments — and can't say where any of it comes from, or whether it's sound. But deen was never meant to be pieced together from scraps. It was taught: text by text, teacher to student, upon the Qur'an and the Sunnah as the Sahabah understood them.";

export interface Persona {
  id: string;
  label: string;
  /** the visitor's own voice */
  quote: string;
  /** our answer, as the panel headline */
  answer: string;
  points: string[];
  start: { kind: string; title: string; meta: string };
  cta: { label: string; href: string };
  alt: { label: string; href: string };
}

// Course slugs/meta mirror lib/data/courses.ts — keep them in step if a course changes.
export const personas: Persona[] = [
  {
    id: "clips",
    label: "The clip collector",
    quote: "I've watched hundreds of clips, but I can't tell what's sound.",
    answer: "Swap the scroll for one text, taught in order.",
    points: [
      "One classical text at a time — not a feed of fragments",
      "A teacher you can ask, who knows where each point comes from",
      "Upon the Qur'an and the Sunnah, as the Sahabah understood them",
    ],
    start: { kind: "FREE · LIVE WEEKLY", title: "Tafsīr of the Qur'an", meta: "Mondays · after Isha" },
    cta: { label: "Start the free course", href: "/courses/quran-tafsir" },
    alt: { label: "See the weekly path", href: "#schedule" },
  },
  {
    id: "professional",
    label: "The busy professional",
    quote: "I work all day. I need a path that fits my evenings.",
    answer: "A few fixed evenings a week — then it runs itself.",
    points: [
      "Live classes after working hours, same time every week",
      "Tasks and reminders in your student portal keep you steady",
      "Times convert to your own time zone",
    ],
    start: { kind: "FREE · LIVE WEEKLY", title: "Arabic Language", meta: "Tuesdays · after Isha" },
    cta: { label: "See the weekly path", href: "#schedule" },
    alt: { label: "Or book a free demo", href: "/book-a-demo" },
  },
  {
    id: "beginner",
    label: "The true beginner",
    quote: "I never properly learned. I don't know where to begin.",
    answer: "Begin at the very first letter — with a teacher beside you.",
    points: [
      "Live one-to-one, at your pace — no one ahead of you",
      "A free demo first, so you meet your teacher before anything else",
      "Tuition is arranged directly with the teacher, never on the platform",
    ],
    start: { kind: "MENTORED · LIVE 1:1", title: "Noorani Qaida", meta: "2–4 months · Complete beginner" },
    cta: { label: "Book a free demo class", href: "/book-a-demo" },
    alt: { label: "Read about the course", href: "/courses/noorani-qaida" },
  },
  {
    id: "parent",
    label: "The parent",
    quote: "I want my children to grow up on a sound foundation.",
    answer: "A structured path for your children — not random videos.",
    points: [
      "Aqeedah, worship, akhlāq, Tafsīr and Ḥadīth in order",
      "1:1 or small group, with a teacher who knows your child",
      "Builds a confident Muslim identity, at home in their deen",
    ],
    start: { kind: "MENTORED · ALL AGES", title: "Islamic Studies", meta: "One year · 1:1 or group" },
    cta: { label: "Book a free demo class", href: "/book-a-demo" },
    alt: { label: "Read about the course", href: "/courses/islamic-studies" },
  },
];

export const notForYou = [
  "You're looking for a quick clip or a ready-made ruling to scroll past.",
  "You want a certificate without the reading.",
  "You'd rather collect more content than finish one text.",
];

export interface ProgrammeStyle {
  bg: string;
  fg: string;
  meta: string;
  ar: string;
  pat: string;
  shape: { size: string; right: string; bottom: string; radius: string; bg: string; border: string; rest: string; hover: string };
}

/** The four card treatments from the design, cycled across the mentored programmes. */
export const programmeStyles: ProgrammeStyle[] = [
  {
    bg: "#1182A3", fg: "#FFFFFF", meta: "#D7ECF3", ar: "#FFFFFF", pat: "rgba(255,255,255,.09)",
    shape: { size: "62%", right: "-14%", bottom: "-30%", radius: "50%", bg: "#C9A24A", border: "none", rest: "none", hover: "translate(-8%,-8%) scale(1.08)" },
  },
  {
    bg: "#0E2A47", fg: "#FFFFFF", meta: "#B9C4CF", ar: "#C9A24A", pat: "rgba(255,255,255,.07)",
    shape: { size: "54%", right: "-8%", bottom: "-34%", radius: "18px", bg: "#1182A3", border: "none", rest: "rotate(45deg)", hover: "rotate(90deg) translate(-6%,-6%)" },
  },
  {
    bg: "#E8EEF3", fg: "#0E2A47", meta: "#3A4A5C", ar: "#1182A3", pat: "rgba(14,42,71,.08)",
    shape: { size: "46%", right: "-6%", bottom: "-12%", radius: "50% 50% 0 0", bg: "#0E2A47", border: "none", rest: "none", hover: "translateY(-10%)" },
  },
  {
    bg: "#C9A24A", fg: "#0E2A47", meta: "#0E2A47", ar: "#0E2A47", pat: "rgba(14,42,71,.09)",
    shape: { size: "58%", right: "-16%", bottom: "-30%", radius: "50%", bg: "transparent", border: "34px solid #0E2A47", rest: "none", hover: "scale(1.12) translate(-6%,-6%)" },
  },
];

export const programmeArabic: Record<string, string> = {
  "noorani-qaida": "القاعدة النورانية",
  "islamic-studies": "الدراسات الإسلامية",
  "quran-recitation": "التلاوة",
  "tafseer-of-the-quran": "التفسير",
  "spoken-arabic": "العربية",
  "quranic-arabic": "لغة القرآن",
  "arabic-for-kids": "العربية للأطفال",
  "hifz-program": "الحفظ",
};
