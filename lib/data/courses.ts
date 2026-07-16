import type { MentoredCourse, FreeCourse } from "@/lib/types";

export const mentoredCourses: MentoredCourse[] = [
  {
    slug: "noorani-qaida",
    index: "01",
    category: "Qur'an",
    title: "Noorani Qaida",
    description:
      "Master the foundations of Quranic reading — letter recognition, pronunciation and Makhārij from zero.",
    meta: ["2–4 months", "Complete beginner", "Live 1:1"],
    accent: "primary",
  },
  {
    slug: "islamic-studies",
    index: "02",
    category: "Islamic Studies",
    title: "Islamic Studies",
    description:
      "Building a strong, confident Muslim identity — Aqeedah, worship, Akhlaq, Tafsir and Hadith for homeschoolers and children.",
    meta: ["One year", "All ages", "1:1 or group"],
    accent: "gold",
  },
  {
    slug: "quran-recitation",
    index: "03",
    category: "Qur'an",
    title: "Qur'an Recitation",
    description:
      "Recite the Quran fluently and correctly, building on Noorani Qaida with proper Tajweed application.",
    meta: ["Ongoing", "After Noorani Qaida", "Live 1:1"],
    accent: "primary-2",
  },
  {
    slug: "tafseer-of-the-quran",
    index: "04",
    category: "Tafsīr",
    title: "Tafsīr of the Qur'an",
    description:
      "Understand the meanings, context and lessons of the Quran, Surah by Surah, grounded in the understanding of the Salaf.",
    meta: ["5 modules", "Kids/teens & adult tracks"],
    accent: "navy",
  },
  {
    slug: "spoken-arabic",
    index: "05",
    category: "Language",
    title: "Spoken Arabic",
    description:
      "Speak, understand and connect in Modern Standard Arabic — from your first greeting to confident conversation.",
    meta: ["12 months", "3 levels", "1:1 or group"],
    accent: "primary",
  },
  {
    slug: "quranic-arabic",
    index: "06",
    category: "Language",
    title: "Qur'anic Arabic",
    description:
      "Learn the Nahw and Sarf needed to understand the Quran directly in Arabic, beyond translation.",
    meta: ["9 months", "3 levels"],
    accent: "primary-2",
  },
  {
    slug: "arabic-for-kids",
    index: "07",
    category: "Language",
    title: "Arabic for Kids",
    description:
      "A fun, theme-based course helping kids live and breathe Arabic through everyday and Islamic themes.",
    meta: ["9 months", "Kids", "Theme-based"],
    accent: "gold",
  },
  {
    slug: "hifz-program",
    index: "08",
    category: "Memorisation",
    title: "Qur'an Memorization (Hifz)",
    description:
      "Memorise the Quran at a sustainable pace with the Sabaq, Sabqi and Manzil revision system.",
    meta: ["Ongoing", "All ages", "Live 1:1"],
    accent: "navy",
  },
];

export const freeCourses: FreeCourse[] = [
  {
    slug: "quran-tafsir",
    glyph: "ت",
    title: "Tafsīr of the Qur'an",
    description:
      "Understand the meanings of the Qur'an through the explanations of the Salaf and authentic narrations.",
    duration: "Weekly live class",
    schedule: "Live · Every Monday · 7:50 PM PKT",
    accent: "primary",
    live: true,
  },
  {
    slug: "umdat-al-ahkam",
    glyph: "ح",
    title: "Umdat al-Ahkam",
    description:
      "Authentic hadiths on worship and daily life — prayer, fasting, zakah, Hajj and more.",
    duration: "Weekly live class",
    schedule: "Live · Every Thursday · 7:50 PM PKT",
    accent: "green",
    live: true,
  },
  {
    slug: "arabic-language",
    glyph: "ل",
    title: "Arabic Language",
    description:
      "Read classical Arabic through Ad-Dā' wa ad-Dawā', building vocabulary and grammar as you go.",
    duration: "Weekly live class",
    schedule: "Live · Every Tue & Wed · 7:50 PM PKT",
    accent: "gold",
    live: true,
  },
  {
    slug: "aqeedah-al-wasitiyyah",
    glyph: "ع",
    title: "Aqeedah al-Wasitiyyah",
    description:
      "The fundamentals of Islamic creed from Ibn Taymiyyah's classical text, grounded in the Qur'an and Sunnah.",
    duration: "Full series · watch anytime",
    schedule: "Completed · Full playlist available",
    accent: "navy",
    live: false,
  },
];
