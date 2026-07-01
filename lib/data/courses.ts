import type { MentoredCourse, FreeCourse } from "@/lib/types";

export const mentoredCourses: MentoredCourse[] = [
  {
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
    index: "02",
    category: "Language",
    title: "Classical Arabic",
    description:
      "Nahw & Sarf from the ground up — read the sources in their own language.",
    meta: ["24 weeks", "Foundations", "Small groups"],
    accent: "primary-2",
  },
  {
    index: "03",
    category: "Memorisation",
    title: "Hifz Program",
    description:
      "Memorise the Qur'an at a sustainable pace with revision and accountability.",
    meta: ["Ongoing", "All ages", "Daily slots"],
    accent: "navy",
  },
  {
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
    glyph: "ت",
    title: "Tafsīr Essentials",
    description:
      "Understand the Book you recite — themes and meanings of selected surahs.",
    duration: "12 lessons · ~3 hrs",
    accent: "primary",
  },
  {
    glyph: "ح",
    title: "Intro to Hadīth",
    description:
      "How the Sunnah reached us — narrators, chains, and authentication, simply explained.",
    duration: "8 lessons · ~2 hrs",
    accent: "green",
  },
  {
    glyph: "س",
    title: "The Seerah",
    description: "The life of the Prophet ﷺ as a living guide for our own times.",
    duration: "10 lessons · ~3 hrs",
    accent: "gold",
  },
  {
    glyph: "ذ",
    title: "Daily Adhkār",
    description:
      "Morning and evening remembrances, with meaning and pronunciation.",
    duration: "6 lessons · ~1 hr",
    accent: "navy",
  },
  {
    glyph: "ص",
    title: "Fiqh of Salah",
    description: "Pray with confidence — the prayer step by step, with the evidences.",
    duration: "9 lessons · ~2 hrs",
    accent: "primary-2",
  },
  {
    glyph: "أ",
    title: "Arabic Alphabet",
    description: "Read the script from zero — letters, joins, and short vowels.",
    duration: "7 lessons · ~2 hrs",
    accent: "green",
  },
];
