import type { CourseDetail, CourseFaq, CourseLogisticsRow, CourseStep } from "@/lib/types";

const liveFreeLogistics: CourseLogisticsRow[] = [
  { label: "Format", value: "Live online class, via community group" },
  { label: "Session length", value: "~45–60 minutes" },
  { label: "Frequency", value: "Weekly, fixed schedule" },
  { label: "Medium", value: "English, with Arabic text & translation" },
  { label: "Access", value: "Join anytime, sessions shared for catch-up" },
  { label: "Support", value: "Live Q&A + community group" },
];

const recordedFreeLogistics: CourseLogisticsRow[] = [
  { label: "Format", value: "Recorded playlist, self-paced" },
  { label: "Session length", value: "Full series already recorded" },
  { label: "Frequency", value: "Watch anytime, at your own pace" },
  { label: "Medium", value: "English, with Arabic text & translation" },
  { label: "Access", value: "Lifetime, revisit anytime" },
  { label: "Support", value: "Community discussion group" },
];

const paidSteps: CourseStep[] = [
  { num: "1", title: "Book your free demo", text: "Pick a time that works — no payment, no commitment." },
  { num: "2", title: "Meet your teacher live", text: "See the teaching style firsthand in a real sample class." },
  { num: "3", title: "Continue, off-platform", text: "If it feels right, arrange tuition directly with your teacher." },
];

const freeSteps: CourseStep[] = [
  { num: "1", title: "Join the community", text: "No card, no approval wait — get the class link today." },
  { num: "2", title: "Attend or catch up", text: "Join live at class time, or catch the recording after." },
  { num: "3", title: "Learn at your pace", text: "Stay as long as you like, at no cost, ever." },
];

function sharedFaqs(type: "paid" | "free"): [CourseFaq, CourseFaq, CourseFaq] {
  const isPaid = type === "paid";
  return [
    {
      q: isPaid ? "What happens after I book the free demo?" : "How do I join the class?",
      a: isPaid
        ? "You'll meet your teacher live for a short assessment and sample lesson — completely free, with no obligation to continue."
        : "Tap \"Join for free\" on this page and you'll receive the class link through our community group — no approval wait.",
    },
    {
      q: isPaid ? "Is payment handled on this website?" : "Is this really free, with no hidden steps?",
      a: isPaid
        ? "No. Tuition is arranged directly between you and your teacher after the demo — nothing is processed on the platform."
        : "Yes. The class is free to join, with no card required at any point.",
    },
    {
      q: isPaid ? "What if I need to reschedule a class?" : "What if I miss a live session?",
      a: isPaid
        ? "Sessions can be rescheduled with 24 hours' notice, and every class is recorded so you never lose progress."
        : "Sessions are shared in the community group afterward, so you can catch up in your own time.",
    },
  ];
}

export const courseDetails: CourseDetail[] = [
  {
    slug: "noorani-qaida",
    type: "paid",
    category: "Qur'an",
    title: "Noorani Qaida",
    subtitle:
      "The essential first step for anyone beginning their Quran learning journey — building a strong foundation in Arabic letter recognition, correct pronunciation, and reading fluency.",
    rating: "5",
    studentsLine: "1:1 live classes",
    levelLine: "Complete beginner",
    teacherName: "Al-Mahdrah Teacher",
    teacherRole: "Qur'an Reading Teacher",
    teacherBio:
      "Separate male and female teachers are available, with classes arranged around your schedule and paced to how quickly you're ready to progress — recordings are provided so nothing is missed.",
    teacherQuote: "Master the Foundations of Quranic Reading",
    durationLine: "2–4 months",
    statStudents: "50+",
    statCountries: "2+",
    accent: "primary",
    outcomes: [
      "Correct pronunciation of Arabic letters, both individually and in combined forms",
      "Makhārij (articulation points) — exactly where and how each letter is pronounced from the mouth and throat",
      "Reading practice in both Uthmani and Indo-Pak script, so you're comfortable with whichever mushaf you'll use",
      "Basic Tajweed rules to prepare for advanced Quran reading",
      "Readiness to move directly into the Qur'an Recitation course",
    ],
    modules: [
      {
        title: "Letter Recognition & Pronunciation",
        meta: "Stage 1 of 2",
        lessons: [
          "Correct pronunciation of Arabic letters, individually and in combined forms",
          "Makhārij — where and how each letter is pronounced from the mouth and throat",
        ],
      },
      {
        title: "Reading Fluency & Application",
        meta: "Stage 2 of 2",
        lessons: [
          "Reading practice in both Uthmani and Indo-Pak script",
          "Basic Tajweed rules to prepare for advanced Quran reading",
        ],
      },
    ],
    logistics: [
      { label: "Format", value: "One-on-one (private) online classes" },
      { label: "Scheduling", value: "Flexible — arranged around your availability" },
      { label: "Teachers", value: "Separate male and female teachers available" },
      { label: "Recordings", value: "Provided on demand for revision" },
      { label: "Assessment", value: "Regular tests throughout the course" },
      { label: "Free trial", value: "Available before enrollment" },
    ],
    audience: [
      "Anyone starting their Quran journey from the very beginning",
      "Children learning to read the Quran for the first time",
      "Adults revisiting their Quran reading skills from the basics",
    ],
    testimonials: [],
    ctaHeadline: "Meet your teacher, free.",
    ctaSub:
      "A free trial class is available before enrollment, so students and parents can experience the teaching style and ensure it's the right fit before committing.",
    steps: paidSteps,
    faqs: [
      {
        q: "Do I need any prior experience to start?",
        a: "No — this course is designed for complete beginners, with no prior Quran reading experience required.",
      },
      ...sharedFaqs("paid"),
      {
        q: "Is there a certificate on completion?",
        a: "Yes — students receive a certificate upon successful completion.",
      },
      {
        q: "What comes after Noorani Qaida?",
        a: "Students move on to the Qur'an Recitation course, where they begin reading directly from the Quran with proper Tajweed, building on the foundation from Noorani Qaida.",
      },
    ],
  },
  {
    slug: "islamic-studies",
    type: "paid",
    category: "Islamic Studies",
    title: "Islamic Studies",
    subtitle:
      "In a world full of fitnah (trials and distractions), this course roots children and homeschoolers in authentic Islamic knowledge and identity — building a lived, practical connection to Islam that lasts a lifetime.",
    rating: "5",
    studentsLine: "1:1 or group classes",
    levelLine: "All ages · Content adapted per student",
    teacherName: "Al-Mahdrah Teacher",
    teacherRole: "Islamic Studies Teacher",
    teacherBio:
      "Choice of one-on-one or group classes, arranged around your schedule, with separate male and female teachers available and content adapted to your child's age, level and Islamic background.",
    teacherQuote: "Building a Strong Muslim Identity for the Next Generation",
    durationLine: "One year",
    statStudents: "50+",
    statCountries: "2+",
    accent: "gold",
    outcomes: [
      "Explain the core beliefs of Islam with clarity and confidence",
      "Perform and understand key acts of worship",
      "Apply Islamic manners in daily life and interactions",
      "Recite and understand essential duas",
      "Reflect on the meanings of selected Quranic passages",
      "Read Quran with appropriate proficiency for their level",
      "Carry a firm, confident Muslim identity in the face of modern trials",
    ],
    modules: [
      {
        title: "Belief & Worship",
        meta: "Stage 1 of 3",
        lessons: ["Aqeedah — core Islamic beliefs", "Ibadaat — Salah, Fasting, Zakah, Hajj & Umrah, and other essential worship"],
      },
      {
        title: "Character & Text",
        meta: "Stage 2 of 3",
        lessons: [
          "Akhlaq — Islamic manners and character development",
          "Tafsir of selected Surahs",
          "Hadith — the 40 Hadith of Imam Nawawi",
        ],
      },
      {
        title: "Practice & Growth",
        meta: "Stage 3 of 3",
        lessons: [
          "Authentic Duas for daily life",
          "Quran and Qaidah — included as needed based on current level",
          "Monthly Tarbiyah Sessions — spiritual and character development beyond regular lessons",
        ],
      },
    ],
    logistics: [
      { label: "Format", value: "Choice of one-on-one or group classes" },
      { label: "Scheduling", value: "Flexible — arranged around your availability" },
      { label: "Teachers", value: "Separate male and female teachers available" },
      { label: "Content", value: "Adapted to age, level & Islamic background" },
      { label: "Recordings", value: "Provided on demand" },
      { label: "Assessment", value: "Regular reports shared with parents" },
    ],
    audience: [
      "Homeschoolers and children seeking a strong, confident Muslim identity",
      "Families navigating outside influences and the trials of the modern world",
      "Anyone wanting Islam taught from the Quran, Hadith and the understanding of the Salaf",
    ],
    testimonials: [],
    ctaHeadline: "Meet your teacher, free.",
    ctaSub:
      "A free trial class is available before enrollment, so families can experience the teaching style and ensure it's the right fit.",
    steps: paidSteps,
    faqs: [
      {
        q: "Does the content suit my child's age and background?",
        a: "Yes — content is adapted to suit the student's age, level, and Islamic background, and no prior knowledge is required.",
      },
      ...sharedFaqs("paid"),
      {
        q: "How is progress tracked?",
        a: "Regular progress assessments are carried out, with progress reports shared with parents throughout the year.",
      },
      {
        q: "Is there a certificate on completion?",
        a: "Students who complete the year's curriculum receive a certificate of completion.",
      },
    ],
  },
  {
    slug: "quran-recitation",
    type: "paid",
    category: "Qur'an",
    title: "Qur'an Recitation",
    subtitle:
      "Building on the foundation laid in Noorani Qaida, this course develops fluent, correct Quran recitation, while nurturing the everyday practice of faith through duas, basic worship, and character development.",
    rating: "5",
    studentsLine: "1:1 live classes",
    levelLine: "After Noorani Qaida",
    teacherName: "Al-Mahdrah Teacher",
    teacherRole: "Qur'an Recitation Teacher",
    teacherBio:
      "One-on-one online classes arranged around your schedule, with separate male and female teachers and every session recorded for revision.",
    teacherQuote: "Reading the Quran with Confidence, Fluency, and Understanding",
    durationLine: "Ongoing — no fixed duration",
    statStudents: "50+",
    statCountries: "2+",
    accent: "primary-2",
    outcomes: [
      "Recite the Quran fluently with correct Tajweed application",
      "Recognize and self-correct common recitation errors",
      "Recite and understand key daily duas",
      "Understand and practice basic acts of worship",
      "Apply Islamic manners and character in daily life",
    ],
    modules: [
      {
        title: "Recitation & Fluency",
        meta: "Stage 1 of 3",
        lessons: [
          "Tajweed Application — correctly applying Tajweed rules while reading directly from the Quran",
          "Fluency Building — progressively smoother, more confident recitation",
        ],
      },
      {
        title: "Daily Practice of Faith",
        meta: "Stage 2 of 3",
        lessons: [
          "Authentic Duas — memorization and understanding of daily duas",
          "Basic Ibadaat — essential knowledge of Salah, fasting, and other core acts of worship",
        ],
      },
      {
        title: "Character & Growth",
        meta: "Stage 3 of 3",
        lessons: [
          "Basic Islamic Studies — foundational Aqeedah appropriate to your level",
          "Akhlaq/Ethics — Islamic manners and character in daily life",
          "Monthly Tarbiyah Sessions — spiritual and character development beyond regular lessons",
        ],
      },
    ],
    logistics: [
      { label: "Format", value: "One-on-one (private) online classes" },
      { label: "Scheduling", value: "Flexible — arranged around your availability" },
      { label: "Teachers", value: "Separate male and female teachers available" },
      { label: "Recordings", value: "Provided on demand" },
      { label: "Assessment", value: "Regular assessments, with reports for younger students" },
      { label: "Free trial", value: "Available before enrollment" },
    ],
    audience: [
      "Students who've completed Noorani Qaida (or have equivalent reading ability)",
      "Learners ready to move from letter-level reading to fluent recitation",
      "Anyone wanting daily duas and basic worship woven into their Quran lessons",
    ],
    testimonials: [],
    ctaHeadline: "Meet your teacher, free.",
    ctaSub:
      "A free trial class is available before enrollment, so families can experience the teaching style and ensure it's the right fit.",
    steps: paidSteps,
    faqs: [
      {
        q: "Do I need to have completed Noorani Qaida first?",
        a: "Yes — completion of Noorani Qaida (or equivalent reading ability) is required before starting this course.",
      },
      ...sharedFaqs("paid"),
      {
        q: "How long does the course take?",
        a: "There's no fixed duration — you progress at your own pace until fluent recitation is achieved.",
      },
      {
        q: "What comes after this course?",
        a: "Once you're reciting fluently, you may progress to the Qur'an Memorization (Hifz) program or continue refining Tajweed at an advanced level.",
      },
    ],
  },
  {
    slug: "tafseer-of-the-quran",
    type: "paid",
    category: "Tafsīr",
    title: "Tafsīr of the Qur'an",
    subtitle:
      "This course takes students through the meanings, context, and lessons of the entire Quran — Surah by Surah — using explanations grounded in the Quran, authentic Hadith, and the understanding of the Salaf, free from sectarianism and personal opinion.",
    rating: "5",
    studentsLine: "1:1 or group classes",
    levelLine: "Kids/teens & adult tracks",
    teacherName: "Al-Mahdrah Teacher",
    teacherRole: "Tafsīr Teacher",
    teacherBio:
      "Taught strictly according to the understanding of the Salaf as-Salih, with separate tracks for kids/teens and adults, flexible scheduling, and every session recorded for revision.",
    teacherQuote: "Understanding the Meanings of Allah's Words",
    durationLine: "Ongoing — module by module",
    statStudents: "50+",
    statCountries: "2+",
    accent: "navy",
    outcomes: [
      "Understand the meaning and context of Quranic verses covered in their module",
      "Explain key lessons and rulings drawn from each Surah",
      "Connect Quranic teachings to daily life and character",
      "Recognize authentic Tafsīr methodology as opposed to personal opinion or sectarian interpretation",
    ],
    modules: [
      {
        title: "Module 1 — Juz 25–30 (Juz Amma and surrounding Surahs)",
        meta: "6 Juz",
        lessons: [
          "Surah-by-surah explanation across Juz 25–30",
          "Rooted in the Quran, authentic Hadith, and the understanding of the Salaf",
        ],
      },
      {
        title: "Module 2 — Juz 19–24",
        meta: "6 Juz",
        lessons: ["Surah-by-surah explanation across Juz 19–24"],
      },
      {
        title: "Module 3 — Juz 13–18",
        meta: "6 Juz",
        lessons: ["Surah-by-surah explanation across Juz 13–18"],
      },
      {
        title: "Module 4 — Juz 7–12",
        meta: "6 Juz",
        lessons: ["Surah-by-surah explanation across Juz 7–12"],
      },
      {
        title: "Module 5 — Juz 1–6",
        meta: "6 Juz",
        lessons: ["Surah-by-surah explanation across Juz 1–6"],
      },
    ],
    logistics: [
      { label: "Format", value: "One-on-one or group classes" },
      { label: "Tracks", value: "Separate tracks for kids/teens and adults" },
      { label: "Scheduling", value: "Flexible — arranged around your availability" },
      { label: "Teachers", value: "Separate male and female teachers available" },
      { label: "Recordings", value: "Provided on demand" },
      { label: "Assessment", value: "Regular reports for younger students" },
    ],
    audience: [
      "Kids and teens, taught on an age-appropriate track",
      "Adults wanting Surah-by-surah understanding of the Quran",
      "Anyone seeking Tafsīr grounded in the Salaf's understanding, not personal opinion",
    ],
    testimonials: [],
    ctaHeadline: "Meet your teacher, free.",
    ctaSub:
      "A free trial class is available before enrollment, so families can experience the teaching style and ensure it's the right fit.",
    steps: paidSteps,
    faqs: [
      {
        q: "Do I need prior Tafsīr knowledge to start?",
        a: "No — basic Quran reading ability is recommended, but no prior Tafsīr knowledge is required.",
      },
      ...sharedFaqs("paid"),
      {
        q: "Can I choose which part of the Quran to start with?",
        a: "Yes — the Quran is divided into 5 modules of 6 Juz each, and you may start with any module based on interest or familiarity.",
      },
      {
        q: "Is this suitable for both kids and adults?",
        a: "Yes — it's offered as separate tracks suited to each age group's level of understanding.",
      },
    ],
  },
  {
    slug: "spoken-arabic",
    type: "paid",
    category: "Language",
    title: "Spoken Arabic",
    subtitle:
      "This course builds practical, conversational Arabic skills using Modern Standard Arabic (MSA) — helping students speak confidently, understand spoken and written Arabic, and build a strong linguistic foundation for daily life, travel, and further Islamic studies.",
    rating: "5",
    studentsLine: "1:1 or group classes",
    levelLine: "Complete beginner → Advanced",
    teacherName: "Al-Mahdrah Teacher",
    teacherRole: "Spoken Arabic Teacher",
    teacherBio:
      "Taught in Modern Standard Arabic across three levels, with both male and female teachers available and every session recorded so you can revisit lessons anytime.",
    teacherQuote: "Speak, Understand, and Connect in Modern Standard Arabic",
    durationLine: "3 levels · 4 months each (12 months total)",
    statStudents: "50+",
    statCountries: "2+",
    accent: "primary",
    outcomes: [
      "Read and write Arabic script confidently",
      "Hold everyday conversations in Arabic",
      "Understand spoken and written Arabic at a practical level",
      "Build a strong foundation for further Arabic or Quranic studies",
    ],
    modules: [
      {
        title: "Level 1 — Beginner",
        meta: "4 months",
        lessons: ["Arabic alphabet", "Basic vocabulary", "Simple sentence structure", "Everyday greetings and phrases"],
      },
      {
        title: "Level 2 — Intermediate",
        meta: "4 months",
        lessons: ["Expanded vocabulary", "Grammar rules", "Forming more complex sentences", "Holding basic conversations"],
      },
      {
        title: "Level 3 — Advanced",
        meta: "4 months",
        lessons: [
          "Fluent conversation practice",
          "Deeper grammar",
          "Reading and understanding Arabic texts",
          "Confident real-world communication",
        ],
      },
    ],
    logistics: [
      { label: "Format", value: "One-on-one or group classes" },
      { label: "Scheduling", value: "Flexible — arranged around your availability" },
      { label: "Teachers", value: "Both male and female teachers available" },
      { label: "Recordings", value: "Provided on demand" },
      { label: "Assessment", value: "At the end of each level" },
      { label: "Suitability", value: "Suitable for both children and adults" },
    ],
    audience: [
      "Kids and adults starting Arabic from the ground up",
      "Anyone wanting practical, everyday conversational skills",
      "Learners building a foundation for further Arabic or Quranic study",
    ],
    testimonials: [],
    ctaHeadline: "Meet your teacher, free.",
    ctaSub:
      "A free trial class is available before enrollment, so families can experience the teaching style and ensure it's the right fit.",
    steps: paidSteps,
    faqs: [
      {
        q: "Do I need any Arabic background to start?",
        a: "No — this course is open to complete beginners.",
      },
      ...sharedFaqs("paid"),
      {
        q: "How long is the full track?",
        a: "The course has 3 levels, each lasting 4 months — 12 months in total for the complete track.",
      },
      {
        q: "What can I do after finishing all 3 levels?",
        a: "You'll have a strong conversational command of Arabic and can continue toward advanced Arabic literature, or apply your skills toward understanding Quranic and Classical Arabic.",
      },
    ],
  },
  {
    slug: "quranic-arabic",
    type: "paid",
    category: "Language",
    title: "Qur'anic Arabic",
    subtitle:
      "This course equips students with the grammar and vocabulary needed to understand the Quran directly in its original Arabic — moving beyond translation to grasp the depth and precision of Allah's words as revealed.",
    rating: "5",
    studentsLine: "1:1 or group classes",
    levelLine: "Requires basic Arabic reading ability",
    teacherName: "Al-Mahdrah Teacher",
    teacherRole: "Qur'anic Arabic Teacher",
    teacherBio:
      "Builds Nahw and Sarf step by step across three levels, with both male and female teachers available and every session recorded for revision.",
    teacherQuote: "Understanding the Language of the Quran",
    durationLine: "3 levels · 3 months each (9 months total)",
    statStudents: "50+",
    statCountries: "2+",
    accent: "primary-2",
    outcomes: [
      "Understand core Quranic grammar (Nahw & Sarf)",
      "Recognize and understand high-frequency Quranic vocabulary",
      "Read Quranic verses and grasp their direct meaning without relying solely on translation",
      "Build a strong foundation for deeper Tafsīr and Quranic studies",
    ],
    modules: [
      {
        title: "Level 1 — Foundations",
        meta: "3 months",
        lessons: [
          "Basic Quranic vocabulary (most frequently occurring words)",
          "Simple sentence structure",
          "Introduction to Nahw (grammar) and Sarf (word structure)",
        ],
      },
      {
        title: "Level 2 — Building Understanding",
        meta: "3 months",
        lessons: ["Expanded Quranic vocabulary", "Deeper grammar rules", "Understanding verb forms and sentence patterns"],
      },
      {
        title: "Level 3 — Direct Comprehension",
        meta: "3 months",
        lessons: [
          "Advanced grammar application",
          "Word-by-word understanding of Quranic verses",
          "Reading and comprehending Quranic Arabic directly",
        ],
      },
    ],
    logistics: [
      { label: "Format", value: "One-on-one or group classes" },
      { label: "Prerequisite", value: "Arabic alphabet & basic reading ability" },
      { label: "Scheduling", value: "Flexible — arranged around your availability" },
      { label: "Teachers", value: "Both male and female teachers available" },
      { label: "Recordings", value: "Provided on demand" },
      { label: "Assessment", value: "At the end of each level" },
    ],
    audience: [
      "Students who already read Arabic and want to understand the Quran's grammar",
      "Anyone wanting to move beyond translation to direct comprehension",
      "Learners building toward deeper Tafsīr study",
    ],
    testimonials: [],
    ctaHeadline: "Meet your teacher, free.",
    ctaSub:
      "A free trial class is available before enrollment, so families can experience the teaching style and ensure it's the right fit.",
    steps: paidSteps,
    faqs: [
      {
        q: "Do I need to already read Arabic?",
        a: "Yes — you must know the Arabic alphabet and have basic reading ability before starting.",
      },
      ...sharedFaqs("paid"),
      {
        q: "How long is the full track?",
        a: "The course has 3 levels, each lasting 3 months — 9 months in total for the complete track.",
      },
      {
        q: "What comes after completing all 3 levels?",
        a: "You'll be equipped to understand the Quran directly in Arabic and can move on to deeper Tafsīr studies with a stronger grasp of the text's original language.",
      },
    ],
  },
  {
    slug: "arabic-for-kids",
    type: "paid",
    category: "Language",
    title: "Arabic for Kids",
    subtitle:
      "A fun, theme-based course designed to help kids live and breathe the Arabic language — teaching practical sentences and important vocabulary through everyday life and Islamic themes.",
    rating: "5",
    studentsLine: "1:1 or group classes",
    levelLine: "Kids · content adapted by age",
    teacherName: "Al-Mahdrah Teacher",
    teacherRole: "Kids' Arabic Teacher",
    teacherBio:
      "Theme-based lessons paced to your child's age, with both male and female teachers available and every session recorded so nothing is missed.",
    teacherQuote: "Learning Arabic Through Everyday Themes",
    durationLine: "3 stages · 3 months each (9 months total)",
    statStudents: "50+",
    statCountries: "2+",
    accent: "gold",
    outcomes: [
      "Read basic Arabic script",
      "Understand and use everyday Arabic vocabulary confidently",
      "Form simple, practical sentences around familiar themes",
      "Recognize and use Islamic vocabulary naturally in daily life",
      "Build a strong, enjoyable connection with the Arabic language from a young age",
    ],
    modules: [
      {
        title: "Foundation Step",
        meta: "For children who don't yet read Arabic",
        lessons: ["Arabic alphabet", "Basic reading ability"],
      },
      {
        title: "Everyday Life Themes",
        meta: "3 months",
        lessons: ["Family, home & daily routine", "Food, colors & numbers", "Animals & weather"],
      },
      {
        title: "Islamic Themes",
        meta: "3 months",
        lessons: ["Masjid & Salah vocabulary", "Ramadan & Islamic greetings", "Everyday Islamic vocabulary"],
      },
    ],
    logistics: [
      { label: "Format", value: "One-on-one or group classes" },
      { label: "Scheduling", value: "Flexible — arranged around your availability" },
      { label: "Teachers", value: "Both male and female teachers available" },
      { label: "Recordings", value: "Provided on demand" },
      { label: "Assessment", value: "At the end of each level, shared with parents" },
    ],
    audience: [
      "Kids of any age, with pace adapted individually",
      "Children who don't yet read Arabic (reading taught first)",
      "Parents wanting Arabic taught through fun, everyday themes",
    ],
    testimonials: [],
    ctaHeadline: "Meet your teacher, free.",
    ctaSub:
      "A free trial class is available before enrollment, so parents can experience the teaching style and ensure it's the right fit for their child.",
    steps: paidSteps,
    faqs: [
      {
        q: "What if my child doesn't know Arabic letters yet?",
        a: "That's fine — if your child doesn't yet read Arabic, basic reading is taught first, before moving into themed vocabulary and sentences.",
      },
      ...sharedFaqs("paid"),
      {
        q: "How long is the full track?",
        a: "The course has 3 levels, each lasting 3 months — 9 months in total for the complete track.",
      },
      {
        q: "What comes next after this course?",
        a: "Children will have a strong practical vocabulary and comfort with Arabic, forming a foundation to continue into Spoken Arabic or Qur'anic Arabic as they grow older.",
      },
    ],
  },
  {
    slug: "hifz-program",
    type: "paid",
    category: "Memorisation",
    title: "Qur'an Memorization (Hifz)",
    subtitle:
      "This course guides students through memorizing the Quran using a structured, time-tested system of daily lessons and revision — helping students not just memorize, but retain and preserve what they've learned for life.",
    rating: "5",
    studentsLine: "1:1 live classes",
    levelLine: "All ages · Any starting point",
    teacherName: "Al-Mahdrah Teacher",
    teacherRole: "Ḥifẓ Teacher",
    teacherBio:
      "Progress follows the traditional Sabaq, Sabqi and Manzil system, with both male and female teachers available and a pace personalised to each student's consistency.",
    teacherQuote: "Preserving the Words of Allah in the Heart",
    durationLine: "Ongoing — partial or full Quran",
    statStudents: "50+",
    statCountries: "2+",
    accent: "navy",
    outcomes: [
      "Recite memorized portions of the Quran fluently and accurately",
      "Apply proper Tajweed while reciting from memory",
      "Retain memorized portions long-term through consistent revision",
      "Build a lifelong habit of Quran review and preservation",
    ],
    modules: [
      {
        title: "Sabaq — New Memorization",
        meta: "Daily",
        lessons: ["New daily memorization portion, with correct tajwīd from the first repetition"],
      },
      {
        title: "Sabqi — Recent Revision",
        meta: "Daily",
        lessons: ["Reinforcing recently memorized portions"],
      },
      {
        title: "Manzil — Long-Term Revision",
        meta: "Ongoing",
        lessons: ["Regularly reviewing previously memorized sections for lifelong retention"],
      },
    ],
    logistics: [
      { label: "Format", value: "One-on-one online classes" },
      { label: "System", value: "Sabaq, Sabqi & Manzil revision cycle" },
      { label: "Pace", value: "Flexible & personalised — no rigid schedule" },
      { label: "Teachers", value: "Both male and female teachers available" },
      { label: "Recordings", value: "Provided on demand" },
      { label: "Assessment", value: "Tracks new memorization & revision retention" },
    ],
    audience: [
      "Students who can already read the Quran, at any age",
      "Those restarting Hifz after a break, needing a structured revision plan",
      "Anyone pursuing partial or full Quran memorization",
    ],
    testimonials: [],
    ctaHeadline: "Meet your teacher, free.",
    ctaSub:
      "A free trial class is available before enrollment, so families can experience the teaching style and ensure it's the right fit.",
    steps: paidSteps,
    faqs: [
      {
        q: "Do I need to have memorized anything before starting?",
        a: "No prior memorization is required, but you should already have basic Quran reading ability (completion of Noorani Qaida or equivalent).",
      },
      ...sharedFaqs("paid"),
      {
        q: "Can I memorize just part of the Quran?",
        a: "Yes — there's no fixed duration, and students may pursue partial memorization (select Surahs or Juz) or work toward completing the full Quran.",
      },
      {
        q: "Is there an Ijāzah available?",
        a: "Students who complete the full Quran memorization may pursue an Ijāzah — a certified chain of transmission.",
      },
    ],
  },
  {
    slug: "quran-tafsir",
    type: "free",
    category: "Tafsīr",
    title: "Tafsīr of the Qur'an",
    subtitle:
      "Understand the meanings of the Qur'an through the explanations of the Salaf and authentic narrations — live, every week.",
    rating: "5.0",
    studentsLine: "100+ students enrolled",
    levelLine: "All levels",
    teacherName: "Al-Mahdrah Teacher",
    teacherRole: "Tafsīr Teacher",
    teacherBio:
      "Explains the meanings of the Qur'an through the understanding of the righteous predecessors (Salaf), the authentic Sunnah, and the works of reliable scholars of Ahl al-Sunnah.",
    teacherQuote:
      "The Qur'an is the ultimate source of guidance — understood correctly, it becomes a practical guide for every part of life.",
    durationLine: "Weekly live class · Mondays",
    statStudents: "100+",
    accent: "primary",
    formatLine: "Live weekly class",
    outcomes: [
      "Understand the core themes and meanings of the Qur'an",
      "Learn the context (asbāb al-nuzūl) behind revealed verses",
      "See how the Qur'an shapes belief, worship, character and family life",
      "Build a habit of tadabbur — reflecting on the Qur'an daily",
      "Strengthen īmān through a correct understanding of Allah's words",
      "Gain a structured, authentic foundation for lifelong Qur'an study",
    ],
    modules: [
      {
        title: "Foundations of Tafsīr",
        meta: "4 lessons · ~50 min avg",
        lessons: [
          "Why we study tafsīr through the Salaf, not opinion alone",
          "The authentic Sunnah as a source of tafsīr",
          "Reliable scholars of Ahl al-Sunnah relied upon",
          "Reading a verse in its context",
        ],
      },
      {
        title: "Meanings & Lessons",
        meta: "3 lessons · ~50 min avg",
        lessons: [
          "The wisdom behind Allah's commands and prohibitions",
          "Belief, worship and akhlāq drawn from the verses",
          "Family life and society through Qur'anic guidance",
        ],
      },
      {
        title: "Living the Qur'an",
        meta: "3 lessons · ~50 min avg",
        lessons: [
          "Tadabbur — reflecting on the Qur'an daily",
          "Applying guidance to life's challenges",
          "Building a lifelong relationship with the Qur'an",
        ],
      },
    ],
    logistics: liveFreeLogistics,
    audience: [
      "Anyone wanting to understand the Qur'an's meanings, not just recite it",
      "Students seeking tafsīr grounded in the understanding of the Salaf",
      "Adults and teens ready for a weekly structured class",
      "Anyone building a lifelong foundation of Qur'anic reflection",
    ],
    testimonials: [],
    ctaHeadline: "Join this week's class.",
    ctaSub: "Free to join, every Monday at 7:50 PM — no fee, ever.",
    steps: freeSteps,
    faqs: [
      {
        q: "Do I need any prior tafsīr knowledge?",
        a: "No — the class builds understanding step by step, starting from how to approach tafsīr correctly.",
      },
      ...sharedFaqs("free"),
      {
        q: "Is this class for men or women?",
        a: "Separate classes are available — let us know your preference when you join the community.",
      },
      {
        q: "Is there a certificate on completion?",
        a: "A certificate of completion is available on request.",
      },
    ],
  },
  {
    slug: "umdat-al-ahkam",
    type: "free",
    category: "Hadīth",
    title: "Umdat al-Ahkam",
    subtitle:
      "Authentic hadiths on worship and daily life, from Sahih al-Bukhari and Sahih Muslim — live, every week.",
    rating: "5.0",
    studentsLine: "100+ students enrolled",
    levelLine: "All levels",
    teacherName: "Al-Mahdrah Teacher",
    teacherRole: "Hadith Teacher",
    teacherBio:
      "Teaches the authentic narrations of Prophet Muhammad ﷺ on purification, prayer, fasting, zakah, Hajj and daily life, according to the methodology of Ahl al-Sunnah.",
    teacherQuote: "Every act of worship should be understood from the authentic Sunnah, not guessed at.",
    durationLine: "Weekly live class · Thursdays",
    statStudents: "100+",
    accent: "green",
    formatLine: "Live weekly class",
    outcomes: [
      "Study authentic hadiths from Sahih al-Bukhari and Sahih Muslim on Ahkam",
      "Understand the rulings of purification, prayer, fasting, zakah and Hajj from the Sunnah",
      "Learn practical rulings on marriage, business dealings and manners",
      "Apply hadiths according to the methodology of Ahl al-Sunnah scholars",
      "Practice worship with confidence, upon authentic evidence",
      "Grow in love and appreciation for the Prophet's ﷺ guidance",
    ],
    modules: [
      {
        title: "Purification & Prayer",
        meta: "3 lessons · ~50 min avg",
        lessons: [
          "Hadiths on purification (Ṭahārah)",
          "Hadiths on Ṣalāh — conditions and etiquette",
          "Common errors clarified through authentic narrations",
        ],
      },
      {
        title: "Fasting, Zakah & Hajj",
        meta: "3 lessons · ~50 min avg",
        lessons: [
          "Hadiths on Ṣawm and its rulings",
          "Zakah — obligations from the Sunnah",
          "Hajj rites as narrated in Bukhari and Muslim",
        ],
      },
      {
        title: "Daily Life & Dealings",
        meta: "3 lessons · ~50 min avg",
        lessons: [
          "Marriage and family narrations",
          "Business dealings and honesty in trade",
          "Manners and everyday conduct from the Sunnah",
        ],
      },
    ],
    logistics: liveFreeLogistics,
    audience: [
      "Muslims wanting to practice worship upon authentic evidence",
      "Students building a foundation in the sciences of Aḥkām",
      "Adults and teens ready for a weekly structured class",
      "Anyone wanting to strengthen love for the Prophet's ﷺ Sunnah",
    ],
    testimonials: [],
    ctaHeadline: "Join this week's class.",
    ctaSub: "Free to join, every Thursday at 7:50 PM — no fee, ever.",
    steps: freeSteps,
    faqs: [
      {
        q: "Do I need prior hadith knowledge?",
        a: "No — the class starts from the hadiths themselves and explains each ruling as it comes.",
      },
      ...sharedFaqs("free"),
      {
        q: "Is this class for men or women?",
        a: "Separate classes are available — let us know your preference when you join the community.",
      },
      {
        q: "Is there a certificate on completion?",
        a: "A certificate of completion is available on request.",
      },
    ],
  },
  {
    slug: "arabic-language",
    type: "free",
    category: "Language",
    title: "Arabic Language",
    subtitle:
      "Read classical Arabic through Ad-Dā' wa ad-Dawā' by Ibn Taymiyyah, building vocabulary and grammar as you go — live, every week.",
    rating: "5.0",
    studentsLine: "100+ students enrolled",
    levelLine: "All levels",
    teacherName: "Al-Mahdrah Teacher",
    teacherRole: "Arabic Teacher",
    teacherBio:
      "Teaches Arabic through direct reading of classical texts rather than grammar alone, helping students approach original Islamic works with growing confidence.",
    teacherQuote:
      "Understanding Arabic opens the door to the Qur'an, the Sunnah and the heritage of Islamic scholarship directly.",
    durationLine: "Weekly live class · Tue & Wed",
    statStudents: "100+",
    accent: "gold",
    formatLine: "Live weekly class",
    outcomes: [
      "Read and understand classical Arabic texts, not just translations",
      "Study Ad-Dā' wa ad-Dawā' by Ibn Taymiyyah in the original Arabic",
      "Build vocabulary and reading comprehension gradually",
      "Strengthen understanding of Arabic grammar through application",
      "Use foundational texts like Al-Ājurrūmiyyah when needed",
      "Approach classical Islamic books independently after the course",
    ],
    modules: [
      {
        title: "Reading Classical Arabic",
        meta: "3 lessons · ~50 min avg",
        lessons: [
          "A practical, application-based approach to Arabic",
          "Reading Ad-Dā' wa ad-Dawā' passage by passage",
          "Building vocabulary through real texts",
        ],
      },
      {
        title: "Grammar in Context",
        meta: "3 lessons · ~50 min avg",
        lessons: [
          "Grammar explained as it's needed, not in isolation",
          "Foundational principles from Al-Ājurrūmiyyah",
          "Sentence structure and comprehension practice",
        ],
      },
      {
        title: "Toward Independent Reading",
        meta: "3 lessons · ~50 min avg",
        lessons: [
          "Analysing and understanding original Arabic works",
          "Preparing for Tafsīr, Hadith, Aqīdah and Fiqh texts",
          "Reading with confidence beyond translation",
        ],
      },
    ],
    logistics: liveFreeLogistics,
    audience: [
      "Anyone wanting to move beyond translations of Islamic texts",
      "Students preparing for deeper study of Tafsīr, Hadith, Aqīdah or Fiqh",
      "Adults and teens ready for a weekly structured class",
      "Anyone who wants a practical, reading-based approach to Arabic",
    ],
    testimonials: [],
    ctaHeadline: "Join this week's class.",
    ctaSub: "Free to join, every Tuesday & Wednesday at 7:50 PM — no fee, ever.",
    steps: freeSteps,
    faqs: [
      {
        q: "Do I need to know Arabic already?",
        a: "No — the class builds vocabulary and grammar gradually through reading, explaining what's needed as it comes up.",
      },
      ...sharedFaqs("free"),
      {
        q: "Is this class for men or women?",
        a: "Separate classes are available — let us know your preference when you join the community.",
      },
      {
        q: "Is there a certificate on completion?",
        a: "A certificate of completion is available on request.",
      },
    ],
  },
  {
    slug: "aqeedah-al-wasitiyyah",
    type: "free",
    category: "Aqīdah",
    title: "Aqeedah al-Wasitiyyah",
    subtitle:
      "The fundamentals of Islamic creed from Ibn Taymiyyah's classical text — the full series is recorded and ready to watch.",
    rating: "5.0",
    studentsLine: "100+ students enrolled",
    levelLine: "All levels",
    teacherName: "Al-Mahdrah Teacher",
    teacherRole: "Aqīdah Teacher",
    teacherBio:
      "Taught Al-'Aqeedah al-Wasitiyyah with textual evidence from the Qur'an and authentic Sunnah, following the understanding of the righteous predecessors.",
    teacherQuote: "Correct belief is the foundation every act of worship is built upon.",
    durationLine: "Full series · watch anytime",
    statStudents: "100+",
    accent: "navy",
    formatLine: "Recorded playlist",
    outcomes: [
      "Study Al-'Aqeedah al-Wasitiyyah by Ibn Taymiyyah",
      "Learn the creed of Ahl al-Sunnah wal-Jamā'ah with textual evidence",
      "Understand faith in Allah's Names and Attributes correctly",
      "Study the pillars of faith — the Angels, Books, Messengers, the Last Day and Qadr",
      "Clarify common misconceptions in Aqīdah",
      "Build certainty and sincerity in worship through sound belief",
    ],
    modules: [
      {
        title: "Foundations of Belief",
        meta: "3 lessons · ~50 min avg",
        lessons: [
          "Why correct Aqīdah comes before every act of worship",
          "Overview of Al-'Aqeedah al-Wasitiyyah",
          "Faith in Allah's Names and Attributes",
        ],
      },
      {
        title: "The Pillars of Faith",
        meta: "3 lessons · ~50 min avg",
        lessons: [
          "The Angels, the Divine Books and the Messengers",
          "The Last Day and what precedes it",
          "Divine Decree (Qadr) explained",
        ],
      },
      {
        title: "Certainty & Practice",
        meta: "3 lessons · ~50 min avg",
        lessons: [
          "Common misconceptions addressed with evidence",
          "Textual proofs from the Qur'an and authentic hadith",
          "How correct Aqīdah shapes sincere worship",
        ],
      },
    ],
    logistics: recordedFreeLogistics,
    audience: [
      "Anyone wanting a clear foundation in Islamic creed",
      "Students seeking Aqīdah grounded in the Qur'an and Sunnah",
      "Adults and teens who prefer to learn at their own pace",
      "Anyone wanting to address common misconceptions with evidence",
    ],
    testimonials: [],
    ctaHeadline: "Watch the full series.",
    ctaSub: "The complete playlist is ready — join the community for access, free, anytime.",
    steps: [
      { num: "1", title: "Join the community", text: "No card, no approval wait — get the playlist link today." },
      {
        num: "2",
        title: "Watch at your pace",
        text: "The full series is already recorded, so go through it whenever suits you.",
      },
      { num: "3", title: "Discuss in community", text: "Ask questions and revisit any part of the series, anytime." },
    ],
    faqs: [
      {
        q: "Is this class still running live?",
        a: "No — the live series has finished. The complete playlist is available now, so you can start anytime.",
      },
      {
        q: "How do I get access to the playlist?",
        a: "Tap \"Watch the full series\" and join the community — you'll receive the playlist link with no approval wait.",
      },
      {
        q: "Is this really free, with no hidden steps?",
        a: "Yes. The full series is free to watch, with no card required at any point.",
      },
      {
        q: "Can I go at my own pace?",
        a: "Yes — every session is already recorded, so you can watch in order at whatever pace suits you.",
      },
      {
        q: "Is there a certificate on completion?",
        a: "A certificate of completion is available on request.",
      },
    ],
  },
];

export function getCourseDetail(slug: string): CourseDetail | undefined {
  return courseDetails.find((course) => course.slug === slug);
}

export function getAllCourseSlugs(): string[] {
  return courseDetails.map((course) => course.slug);
}
