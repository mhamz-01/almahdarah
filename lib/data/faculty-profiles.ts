import type { FacultyProfile } from "@/lib/types";

export const facultyProfiles: FacultyProfile[] = [
  {
    slug: "shaykh-a-rahman",
    name: "Shaykh A. Rahman",
    role: "Qur'an & Tajwīd Specialist",
    department: "Qur'anic Sciences",
    bio: "Holds an Ijāzah in Qur'anic recitation with an unbroken chain (sanad) reaching back through generations of scholars. Known for patient, precise correction and a teaching style that puts nervous beginners instantly at ease — from young children to adult learners starting from zero.",
    availability: "Accepting new students",
    statYears: "12+",
    statStudents: "480+",
    statRating: "4.9",
    credentials: ["Ijāzah · Recitation", "Bachelor's, Islamic Studies", "Certified Tajwīd Instructor"],
    specialties: [
      {
        icon: "١",
        title: "Makhārij & Tajwīd rules",
        text: "Correct articulation points and the full rulebook, taught step by step.",
      },
      {
        icon: "٢",
        title: "Beginner confidence-building",
        text: "A calm, encouraging approach for students starting from zero.",
      },
      {
        icon: "٣",
        title: "Ijāzah-track coaching",
        text: "Structured preparation for students pursuing a formal Ijāzah.",
      },
      {
        icon: "٤",
        title: "Children's recitation",
        text: "Age-appropriate pacing and gentle correction for younger learners.",
      },
    ],
    timeline: [
      {
        year: "2011",
        title: "Began formal Qur'anic studies",
        text: "Started structured study of Tajwīd and Qur'anic sciences under local scholars.",
      },
      {
        year: "2015",
        title: "Received Ijāzah in recitation",
        text: "Completed a full chain of recitation with an authorised sanad connecting back through trusted scholars.",
      },
      {
        year: "2018",
        title: "Began teaching students directly",
        text: "Started guiding beginner and intermediate students in small groups and 1:1 sessions.",
      },
      {
        year: "2022",
        title: "Joined Al-Mahdrah faculty",
        text: "Brought over a decade of teaching experience to guide students across Pakistan and abroad.",
      },
    ],
    philosophyQuote:
      "Every student can recite beautifully — it's a matter of the right correction, repeated with patience.",
    courseSlugs: ["tajwid-recitation", "hifz-program"],
    accent: "primary",
  },
  {
    slug: "ustadh-m-yusuf",
    name: "Ustadh M. Yusuf",
    role: "Arabic Language Specialist",
    department: "Arabic Language & Literature",
    bio: "Specialist in Naḥw & Ṣarf who has spent over a decade making Arabic grammar feel intuitive rather than intimidating. Known for breaking down dense classical structure into small, teachable steps that build real reading independence.",
    availability: "Accepting new students",
    statYears: "10+",
    statStudents: "260+",
    statRating: "4.8",
    credentials: ["Certified Arabic Instructor", "Bachelor's, Arabic Language", "10+ years teaching"],
    specialties: [
      {
        icon: "١",
        title: "Naḥw & Ṣarf foundations",
        text: "Grammar and morphology taught as a system, not a memorised list.",
      },
      {
        icon: "٢",
        title: "Zero-to-reading pathway",
        text: "A structured route from the alphabet to independent reading.",
      },
      {
        icon: "٣",
        title: "Seerah storytelling",
        text: "Historical narrative brought to life with context and reflection.",
      },
      {
        icon: "٤",
        title: "Family & sibling pacing",
        text: "Comfortable teaching multiple ages together in one household.",
      },
    ],
    timeline: [
      {
        year: "2013",
        title: "Began Arabic language studies",
        text: "Focused formal study of Naḥw, Ṣarf and classical Arabic texts.",
      },
      {
        year: "2016",
        title: "Completed Arabic language certification",
        text: "Certified to teach Arabic language and grammar to non-native speakers.",
      },
      {
        year: "2019",
        title: "Began teaching students directly",
        text: "Started guiding beginner and intermediate students through structured grammar courses.",
      },
      {
        year: "2023",
        title: "Joined Al-Mahdrah faculty",
        text: "Brought a decade of teaching experience to guide students across the globe.",
      },
    ],
    philosophyQuote: "Grammar isn't a wall to memorise — it's a key. Once it clicks, the sources open up on their own.",
    courseSlugs: ["classical-arabic", "the-seerah", "arabic-alphabet"],
    accent: "primary-2",
  },
  {
    slug: "ustadha-s-khan",
    name: "Ustadha S. Khan",
    role: "Sisters' Tafsīr Teacher",
    department: "Tafsīr & Qur'anic Studies",
    bio: "Leads warm, structured tafsīr classes for sisters and younger learners, known for making dense meanings feel personal and memorable. Focuses on connecting verses to daily life rather than treating tafsīr as distant academic study.",
    availability: "Accepting new students",
    statYears: "8+",
    statStudents: "1,200+",
    statRating: "4.8",
    credentials: ["Certified Tafsīr Instructor", "Bachelor's, Islamic Studies", "Sisters' Circle Lead"],
    specialties: [
      {
        icon: "١",
        title: "Thematic tafsīr",
        text: "Surah-by-surah themes explained clearly, without losing depth.",
      },
      {
        icon: "٢",
        title: "Daily-life application",
        text: "Connecting verses to real parenting, home and personal life.",
      },
      {
        icon: "٣",
        title: "Sisters' & children's classes",
        text: "Warm, structured learning spaces for women and younger students.",
      },
      {
        icon: "٤",
        title: "Daily adhkār coaching",
        text: "Building consistent, meaningful remembrance habits that last.",
      },
    ],
    timeline: [
      {
        year: "2015",
        title: "Began Islamic studies",
        text: "Structured study of tafsīr and Qur'anic sciences under qualified teachers.",
      },
      {
        year: "2018",
        title: "Completed Islamic Studies degree",
        text: "Focused coursework in tafsīr methodology and Qur'anic sciences.",
      },
      {
        year: "2020",
        title: "Began teaching sisters' circles",
        text: "Started leading structured tafsīr classes for women and children.",
      },
      {
        year: "2023",
        title: "Joined Al-Mahdrah faculty",
        text: "Brought warm, structured teaching to students across the academy.",
      },
    ],
    philosophyQuote: "Once a surah's theme clicks, you never read it the same way again.",
    courseSlugs: ["tafsir-essentials", "daily-adhkar"],
    accent: "gold",
  },
  {
    slug: "shaykh-i-malik",
    name: "Shaykh I. Malik",
    role: "Aqīdah & Fiqh Specialist",
    department: "Aqīdah & Fiqh",
    bio: "Grounds students in sound creed and fiqh with patience and clarity, drawing on years of teaching teens and adults alike through cohort-based classes. Known for tying every ruling and belief back to its evidence, not just its conclusion.",
    availability: "Waitlist only",
    statYears: "11+",
    statStudents: "700+",
    statRating: "4.9",
    credentials: ["Certified Aqīdah Instructor", "Bachelor's, Islamic Studies", "Fiqh Cohort Lead"],
    specialties: [
      {
        icon: "١",
        title: "Sound creed foundations",
        text: "The six pillars and Tawḥīd taught with clarity and evidence.",
      },
      {
        icon: "٢",
        title: "Hadīth literacy",
        text: "Understanding isnād and authenticity without academic jargon.",
      },
      {
        icon: "٣",
        title: "Fiqh of worship",
        text: "Practical, evidence-based teaching of purification and prayer.",
      },
      {
        icon: "٤",
        title: "Teen & adult cohorts",
        text: "Structured group classes that build community, not just knowledge.",
      },
    ],
    timeline: [
      {
        year: "2012",
        title: "Began formal Islamic studies",
        text: "Structured study of Aqīdah, Fiqh and the sciences of ḥadīth.",
      },
      {
        year: "2016",
        title: "Completed Islamic Studies degree",
        text: "Specialised coursework in creed and comparative fiqh.",
      },
      {
        year: "2019",
        title: "Began teaching cohort classes",
        text: "Started leading structured Aqīdah and Fiqh classes for teens and adults.",
      },
      {
        year: "2022",
        title: "Joined Al-Mahdrah faculty",
        text: "Brought over a decade of teaching experience to guide students across the academy.",
      },
    ],
    philosophyQuote:
      "A firm creed doesn't just answer doubts — it prevents most of them from taking root in the first place.",
    courseSlugs: ["aqidah-foundations", "intro-to-hadith", "fiqh-of-salah"],
    accent: "green",
  },
];

export function getFacultyProfile(slug: string): FacultyProfile | undefined {
  return facultyProfiles.find((profile) => profile.slug === slug);
}

export function getAllFacultySlugs(): string[] {
  return facultyProfiles.map((profile) => profile.slug);
}
