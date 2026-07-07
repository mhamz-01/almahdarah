import type { MentoredCourse, FreeCourse } from "@/lib/types";

export const mentoredCourses: MentoredCourse[] = [
  {
    slug: "tajwid-recitation",
    index: "01",
    category: "Qur'an",
    title: "Tajwīd & Recitation",
    description:
      "Beautify your recitation, letter by letter, with live correction from a certified teacher.",
    meta: ["12 weeks", "All levels", "Live 1:1"],
    accent: "primary",
    popular: true,
  },
  {
    slug: "classical-arabic",
    index: "02",
    category: "Language",
    title: "Classical Arabic",
    description:
      "Nahw & Sarf from the ground up — read the sources in their own language.",
    meta: ["24 weeks", "Foundations"],
    accent: "primary-2",
  },
  {
    slug: "hifz-program",
    index: "03",
    category: "Memorisation",
    title: "Hifz Program",
    description:
      "Memorise the Qur'an at a sustainable pace with revision and accountability.",
    meta: ["Ongoing", "All ages", "Daily slots"],
    accent: "navy",
  },
  {
    slug: "aqidah-foundations",
    index: "04",
    category: "Creed",
    title: "Aqīdah Foundations",
    description:
      "Sound creed taught with clarity — the bedrock beneath everything else.",
    meta: ["10 weeks", "Teens & adults", "Cohorts"],
    accent: "green",
  },
];

export const freeCourses: FreeCourse[] = [
  {
    slug: "tafsir-essentials",
    glyph: "ت",
    title: "Tafsīr Essentials",
    description:
      "Understand the Book you recite — themes and meanings of selected surahs.",
    duration: "12 lessons · ~3 hrs",
    schedule: "Live · Sat & Sun · 7:00 PM PKT",
    accent: "primary",
  },
  {
    slug: "intro-to-hadith",
    glyph: "ح",
    title: "Intro to Hadīth",
    description:
      "How the Sunnah reached us — narrators, chains, and authentication, simply explained.",
    duration: "8 lessons · ~2 hrs",
    schedule: "Live · Mon & Wed · 8:00 PM PKT",
    accent: "green",
  },
  {
    slug: "the-seerah",
    glyph: "س",
    title: "The Seerah",
    description: "The life of the Prophet ﷺ as a living guide for our own times.",
    duration: "10 lessons · ~3 hrs",
    schedule: "Live · Tue & Thu · 7:30 PM PKT",
    accent: "gold",
  },
  {
    slug: "daily-adhkar",
    glyph: "ذ",
    title: "Daily Adhkār",
    description:
      "Morning and evening remembrances, with meaning and pronunciation.",
    duration: "6 lessons · ~1 hr",
    schedule: "Live · Daily · 6:30 AM PKT",
    accent: "navy",
  },
  {
    slug: "fiqh-of-salah",
    glyph: "ص",
    title: "Fiqh of Salah",
    description: "Pray with confidence — the prayer step by step, with the evidences.",
    duration: "9 lessons · ~2 hrs",
    schedule: "Live · Fri · 6:00 PM PKT",
    accent: "primary-2",
  },
  {
    slug: "arabic-alphabet",
    glyph: "أ",
    title: "Arabic Alphabet",
    description: "Read the script from zero — letters, joins, and short vowels.",
    duration: "7 lessons · ~2 hrs",
    schedule: "Live · Mon, Wed & Fri · 5:00 PM PKT",
    accent: "green",
  },
];
