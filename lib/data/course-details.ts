import type { CourseDetail, CourseFaq, CourseLogisticsRow, CourseStep } from "@/lib/types";

const paidLogistics: CourseLogisticsRow[] = [
  { label: "Format", value: "Live 1:1 (or small group of 2–3)" },
  { label: "Session length", value: "45–60 minutes" },
  { label: "Frequency", value: "1–2 times per week" },
  { label: "Medium", value: "English, with Arabic terms" },
  { label: "Recordings", value: "Every session recorded" },
  { label: "Rescheduling", value: "Flexible, 24hr notice" },
];

const freeLogistics: CourseLogisticsRow[] = [
  { label: "Format", value: "Self-paced video lessons" },
  { label: "Session length", value: "10–20 minutes each" },
  { label: "Frequency", value: "Entirely up to you" },
  { label: "Medium", value: "English, with Arabic terms" },
  { label: "Access", value: "Lifetime, revisit anytime" },
  { label: "Support", value: "Community Q&A included" },
];

const paidSteps: CourseStep[] = [
  { num: "1", title: "Book your free demo", text: "Pick a time that works — no payment, no commitment." },
  { num: "2", title: "Meet your teacher live", text: "See the teaching style firsthand in a real sample class." },
  { num: "3", title: "Continue, off-platform", text: "If it feels right, arrange tuition directly with your teacher." },
];

const freeSteps: CourseStep[] = [
  { num: "1", title: "Create free access", text: "No card, no approval wait — instant access." },
  { num: "2", title: "Start Lesson 1 today", text: "Jump straight into the first module." },
  { num: "3", title: "Learn at your pace", text: "Revisit any lesson, anytime, at no cost." },
];

function sharedFaqs(type: "paid" | "free"): [CourseFaq, CourseFaq, CourseFaq] {
  const isPaid = type === "paid";
  return [
    {
      q: isPaid ? "What happens after I book the free demo?" : "How do I access my first lesson?",
      a: isPaid
        ? "You'll meet your teacher live for a short assessment and sample lesson — completely free, with no obligation to continue."
        : "Your first lesson opens immediately after you create free access. No waiting, no approval needed.",
    },
    {
      q: isPaid ? "Is payment handled on this website?" : "Is this really free, with no hidden steps?",
      a: isPaid
        ? "No. Tuition is arranged directly between you and your teacher after the demo — nothing is processed on the platform."
        : "Yes. The full course is free to access, with no card required at any point.",
    },
    {
      q: isPaid ? "What if I need to reschedule a class?" : "Can I learn at my own pace?",
      a: isPaid
        ? "Sessions can be rescheduled with 24 hours' notice, and every class is recorded so you never lose progress."
        : "Yes — lessons stay unlocked indefinitely. Revisit any lesson as often as you like.",
    },
  ];
}

export const courseDetails: CourseDetail[] = [
  {
    slug: "tajwid-recitation",
    type: "paid",
    category: "Qur'an",
    title: "Tajwīd & Recitation",
    subtitle:
      "Beautify your recitation, letter by letter, with live correction from a certified teacher — upon a clear chain of authentic learning.",
    rating: "4.9",
    studentsLine: "340+ students taught",
    levelLine: "Beginner → Advanced",
    teacherName: "Shaykh A. Rahman",
    teacherRole: "Qur'an & Tajwīd specialist",
    teacherBio:
      "Holds an Ijāzah in Qur'anic recitation and has taught students of every age and level for over a decade — known for patience and precise, encouraging correction.",
    teacherQuote:
      "Every student can recite beautifully — it's a matter of the right correction, repeated with patience.",
    durationLine: "12-week program",
    statStudents: "340+",
    statCountries: "30+",
    statCompletion: "95%",
    accent: "primary",
    outcomes: [
      "Pronounce every Arabic letter correctly from its true articulation point (makhraj)",
      "Apply the core rules of Nūn, Tanwīn and Mīm Sākinah with confidence",
      "Recite with correct Madd (elongation) and natural rhythm",
      "Read fluently at a pace suited to memorisation (ḥifẓ)",
      "Receive live, personal correction — not generic app feedback",
      "Build a foundation toward an Ijāzah in recitation",
    ],
    modules: [
      {
        title: "Foundations: Makhārij al-Ḥurūf",
        meta: "4 lessons · 45 min avg",
        lessons: [
          "Introduction to Tajwīd and its rulings",
          "Articulation points of the throat letters",
          "Articulation points of the tongue letters",
          "Practice: correcting common mistakes",
        ],
      },
      {
        title: "Ṣifāt al-Ḥurūf (Letter Characteristics)",
        meta: "4 lessons · 40 min avg",
        lessons: [
          "Qalqalah and its letters",
          "Heavy (Tafkhīm) vs light (Tarqīq) letters",
          "Ghunnah — the nasal sound",
          "Guided recitation practice",
        ],
      },
      {
        title: "Rules of Nūn Sākinah & Tanwīn",
        meta: "5 lessons · 50 min avg",
        lessons: [
          "Idhhār (clear pronunciation)",
          "Idghām with and without Ghunnah",
          "Iqlāb",
          "Ikhfā",
          "Applied recitation: Juz 'Amma",
        ],
      },
      {
        title: "Rules of Mīm Sākinah & Madd",
        meta: "5 lessons · 50 min avg",
        lessons: [
          "Mīm Sākinah rules",
          "Natural Madd (Madd Aslī)",
          "Connected Madd (Muttaṣil)",
          "Separate Madd (Munfaṣil)",
          "Practice with selected sūrahs",
        ],
      },
      {
        title: "Ijāzah Preparation & Fluent Recitation",
        meta: "4 lessons · 45 min avg",
        lessons: [
          "Tarteel and pacing",
          "Waqf and Ibtidā (stopping & starting)",
          "Full sūrah recitation review",
          "Final assessment with your teacher",
        ],
      },
    ],
    logistics: paidLogistics,
    audience: [
      "Muslim parents seeking a trusted teacher for their children",
      "Homeschooling families building a structured Qur'an curriculum",
      "Adult beginners starting their Tajwīd journey from zero",
      "Anyone refining existing recitation or preparing for Ijāzah",
    ],
    testimonials: [
      {
        quote:
          "My daughter's recitation transformed within three months. She now corrects herself before her teacher even points it out.",
        name: "Umm Zainab",
        role: "Homeschooling parent · Karachi",
        accent: "primary",
      },
      {
        quote:
          "I'd tried apps for years with little progress. A real teacher correcting me live, class after class, changed everything.",
        name: "Ibrahim K.",
        role: "Adult learner · UK",
        accent: "green",
      },
    ],
    ctaHeadline: "Meet your teacher, free.",
    ctaSub:
      "Book a short, no-obligation demo class and experience the teaching style before you commit to anything.",
    steps: paidSteps,
    faqs: [
      {
        q: "Do I need to know Arabic already?",
        a: "No — this course starts from correct pronunciation and builds up. Complete beginners are welcome alongside those refining existing recitation.",
      },
      ...sharedFaqs("paid"),
      {
        q: "Can children join this course?",
        a: "Yes — we regularly teach students from age 6 upward, alongside teens and adults, with pacing adjusted per student.",
      },
      {
        q: "Is there a certificate or Ijāzah?",
        a: "Students who complete the full pathway and pass their final assessment receive a certificate of completion; an Ijāzah track is available for advanced students.",
      },
    ],
  },
  {
    slug: "classical-arabic",
    type: "paid",
    category: "Language",
    title: "Classical Arabic",
    subtitle:
      "Naḥw & Ṣarf from the ground up — read the Qur'an, hadīth and classical sources directly, in their own language.",
    rating: "4.8",
    studentsLine: "210+ students taught",
    levelLine: "Complete beginner → Reader",
    teacherName: "Ustadh M. Yusuf",
    teacherRole: "Arabic language specialist",
    teacherBio:
      "Specialist in Naḥw & Ṣarf who has spent over a decade making Arabic grammar feel intuitive rather than intimidating, for students starting from zero.",
    teacherQuote:
      "Grammar isn't a wall to memorise — it's a key. Once it clicks, the sources open up on their own.",
    durationLine: "24-week program",
    statStudents: "210+",
    statCountries: "24+",
    statCompletion: "91%",
    accent: "primary-2",
    outcomes: [
      "Read unvocalised Arabic texts with confidence",
      "Identify verb forms (wazn) and derive root patterns",
      "Parse basic sentence structure (jumlah ismiyyah & filiyyah)",
      "Apply core iʿrāb rules to determine word endings",
      "Build a working vocabulary of 500+ classical roots",
      "Begin reading short passages from classical sources unaided",
    ],
    modules: [
      {
        title: "Arabic Script & Reading Fluency",
        meta: "4 lessons · 35 min avg",
        lessons: [
          "The Arabic alphabet and joined script",
          "Short vowels and reading fluency drills",
          "Sun and moon letters, the definite article",
          "Practice: reading vocalised sentences aloud",
        ],
      },
      {
        title: "Foundations of Ṣarf (Morphology)",
        meta: "4 lessons · 40 min avg",
        lessons: [
          "The root-and-pattern system (jidhr & wazn)",
          "The past tense (māḍī) across the ten forms",
          "The present tense (muḍāriʿ) and its moods",
          "Deriving nouns from verbs (maṣdar, ism fāʿil)",
        ],
      },
      {
        title: "Foundations of Naḥw (Syntax)",
        meta: "5 lessons · 45 min avg",
        lessons: [
          "Jumlah ismiyyah — the nominal sentence",
          "Jumlah filiyyah — the verbal sentence",
          "Mubtada and khabar in depth",
          "Fāʿil and mafʿūl bih — subject and object",
          "Iḍāfa — the possessive construction",
        ],
      },
      {
        title: "Iʿrāb — Case Endings in Practice",
        meta: "4 lessons · 40 min avg",
        lessons: [
          "Rafʿ, naṣb and jarr explained",
          "Case endings on sound and broken plurals",
          "Reading with correct iʿrāb aloud",
          "Common iʿrāb mistakes and how to avoid them",
        ],
      },
      {
        title: "Reading Classical Texts",
        meta: "5 lessons · 50 min avg",
        lessons: [
          "Approaching a classical text for the first time",
          "Guided reading: a Qur'anic passage",
          "Guided reading: a hadīth text",
          "Building a personal vocabulary system",
          "Capstone: read and parse an unseen passage",
        ],
      },
    ],
    logistics: paidLogistics,
    audience: [
      "Homeschooling families building an Arabic curriculum from scratch",
      "Adult beginners with zero prior Arabic exposure",
      "Students preparing to read Qur'an, hadīth or fiqh texts directly",
      "Anyone who has tried self-study apps and wants real grammar foundations",
    ],
    testimonials: [
      {
        quote:
          "Six months in and I'm reading passages I'd have found impossible before. The step-by-step grammar finally made sense.",
        name: "Bilal R.",
        role: "Adult learner · UK",
        accent: "primary-2",
      },
      {
        quote:
          "My teenager can now open a Qur'an translation and check the Arabic herself. That independence was exactly what we wanted.",
        name: "Umm Yahya",
        role: "Homeschooling parent · Toronto",
        accent: "navy",
      },
    ],
    ctaHeadline: "Meet your teacher, free.",
    ctaSub:
      "Book a short, no-obligation demo class and see how the grammar is taught before you commit to anything.",
    steps: paidSteps,
    faqs: [
      {
        q: "Do I need to know the Arabic alphabet already?",
        a: "It helps, but isn't required — the first module covers script and reading fluency before grammar begins.",
      },
      ...sharedFaqs("paid"),
      {
        q: "Can teenagers join this course?",
        a: "Yes — the pacing is adjusted for teens and adults alike, and many families enrol siblings together.",
      },
      {
        q: "Is there a certificate on completion?",
        a: "Students who complete all five modules and the capstone reading receive a certificate of completion.",
      },
    ],
  },
  {
    slug: "hifz-program",
    type: "paid",
    category: "Memorisation",
    title: "Hifz Program",
    subtitle:
      "Memorise the Qur'an at a sustainable pace, with structured revision and real accountability from your teacher.",
    rating: "4.9",
    studentsLine: "180+ students enrolled",
    levelLine: "All ages · All starting points",
    teacherName: "Shaykh A. Rahman",
    teacherRole: "Qur'an & Ḥifẓ specialist",
    teacherBio:
      "Holds an Ijāzah in Qur'anic recitation and has guided students through complete memorisation for over a decade, with a method built on sustainable daily habits.",
    teacherQuote:
      "Ḥifẓ isn't won in a single sitting — it's won in the quiet, consistent repetition nobody sees.",
    durationLine: "Ongoing enrolment",
    statStudents: "180+",
    statCountries: "22+",
    statCompletion: "89%",
    accent: "navy",
    outcomes: [
      "Memorise new verses accurately with correct tajwīd from day one",
      "Build a revision cycle that prevents forgetting",
      "Recognise and correct mutashābihāt (similar-sounding verses)",
      "Sustain a realistic daily memorisation pace long-term",
      "Track progress against personalised milestones",
      "Recite memorised portions fluently in front of a teacher",
    ],
    modules: [
      {
        title: "Building a Sustainable Daily Wird",
        meta: "4 lessons · 40 min avg",
        lessons: [
          "Setting a realistic daily memorisation target",
          "Choosing your memorisation method (repetition, listening, writing)",
          "Environment and timing for effective ḥifẓ",
          "Tracking progress without burning out",
        ],
      },
      {
        title: "New Memorisation (Ḥifẓ Jadīd)",
        meta: "4 lessons · 45 min avg",
        lessons: [
          "Memorising with correct tajwīd from the first repetition",
          "Linking new verses to previous ones",
          "Locking in memorisation before moving on",
          "Weekly consolidation of new portions",
        ],
      },
      {
        title: "Revision Cycles (Murājaʿah)",
        meta: "4 lessons · 40 min avg",
        lessons: [
          "Designing a daily revision cycle",
          "Designing a weekly and monthly revision cycle",
          "Group revision and accountability partners",
          "Recovering forgotten portions",
        ],
      },
      {
        title: "Consolidation & Mutashābihāt",
        meta: "4 lessons · 45 min avg",
        lessons: [
          "Identifying commonly confused (mutashābih) verses",
          "Techniques for distinguishing similar verses",
          "Full-juz recitation review with your teacher",
          "Preparing for Ijāzah-track assessment",
        ],
      },
    ],
    logistics: [
      { label: "Format", value: "Live 1:1 (or small group of 2–3)" },
      { label: "Session length", value: "30–45 minutes" },
      { label: "Frequency", value: "3–5 times per week" },
      { label: "Medium", value: "English, with Arabic terms" },
      { label: "Recordings", value: "Every session recorded" },
      { label: "Rescheduling", value: "Flexible, 24hr notice" },
    ],
    audience: [
      "Students of any age beginning their ḥifẓ journey",
      "Those restarting ḥifẓ after a break, needing a structured revision plan",
      "Families wanting accountability and a fixed daily schedule",
      "Advanced students polishing toward Ijāzah-level fluency",
    ],
    testimonials: [
      {
        quote:
          "The revision system is what makes this different. My son finally isn't losing what he memorised the month before.",
        name: "Abu Hamza",
        role: "Parent · Jakarta",
        accent: "navy",
      },
      {
        quote:
          "A daily, realistic target instead of an overwhelming one. I've stayed consistent longer than ever before.",
        name: "Maryam T.",
        role: "Adult learner · USA",
        accent: "primary",
      },
    ],
    ctaHeadline: "Meet your teacher, free.",
    ctaSub:
      "Book a short, no-obligation demo class and get a personalised memorisation plan before you commit to anything.",
    steps: paidSteps,
    faqs: [
      {
        q: "Do I need any prior memorisation to start?",
        a: "No — students begin exactly where they are, whether that's zero verses memorised or partway through the Qur'an already.",
      },
      ...sharedFaqs("paid"),
      {
        q: "Can young children join this program?",
        a: "Yes — we teach memorisers from age 5 upward, with session length and pacing adjusted for younger students.",
      },
      {
        q: "Is there a certificate or Ijāzah?",
        a: "Students who complete memorisation with verified revision accuracy are eligible for an Ijāzah assessment with your teacher.",
      },
    ],
  },
  {
    slug: "aqidah-foundations",
    type: "paid",
    category: "Creed",
    title: "Aqīdah Foundations",
    subtitle:
      "Sound creed taught with clarity and evidence — the bedrock every other branch of knowledge is built upon.",
    rating: "4.9",
    studentsLine: "150+ students taught",
    levelLine: "Teens & adults",
    teacherName: "Shaykh I. Malik",
    teacherRole: "Aqīdah & Fiqh specialist",
    teacherBio:
      "Grounds students in sound creed and fiqh with patience and clarity, drawing on years of teaching teens and adults alike through cohort-based classes.",
    teacherQuote:
      "A firm creed doesn't just answer doubts — it prevents most of them from taking root in the first place.",
    durationLine: "10-week program",
    statStudents: "150+",
    statCountries: "19+",
    statCompletion: "93%",
    accent: "green",
    outcomes: [
      "Explain the six pillars of īmān with supporting evidence",
      "Distinguish the three categories of Tawḥīd",
      "Recognise common misconceptions that weaken creed",
      "Understand the wisdom behind divine decree (qadar)",
      "Respond to doubts with calm, sourced clarity",
      "Build a creed that anchors daily practice, not just belief",
    ],
    modules: [
      {
        title: "The Six Pillars of Īmān",
        meta: "4 lessons · 40 min avg",
        lessons: [
          "Belief in Allah — the foundation of all belief",
          "Belief in the angels and their roles",
          "Belief in the revealed books",
          "Belief in the messengers and prophets",
        ],
      },
      {
        title: "Tawḥīd — The Foundation of Islam",
        meta: "4 lessons · 45 min avg",
        lessons: [
          "Tawḥīd al-Rubūbiyyah — Lordship",
          "Tawḥīd al-Ulūhiyyah — worship",
          "Tawḥīd al-Asmā wa'l-Ṣifāt — names and attributes",
          "Common breaches of Tawḥīd in daily life",
        ],
      },
      {
        title: "The Unseen — Angels, Books & Messengers",
        meta: "4 lessons · 40 min avg",
        lessons: [
          "The nature and duties of angels",
          "Previous revealed scriptures and their status",
          "The chain of prophethood, culminating in Muhammad ﷺ",
          "Distinguishing prophets from ordinary righteous people",
        ],
      },
      {
        title: "The Last Day & Divine Decree",
        meta: "4 lessons · 45 min avg",
        lessons: [
          "Signs of the Last Day",
          "Life in the grave and resurrection",
          "Understanding qadar without fatalism",
          "Living with certainty: creed into practice",
        ],
      },
    ],
    logistics: paidLogistics,
    audience: [
      "Teenagers forming their worldview amid conflicting messages",
      "Adults who never studied creed systematically",
      "Parents wanting shared language to discuss faith at home",
      "New Muslims building foundational understanding",
    ],
    testimonials: [
      {
        quote:
          "The Aqīdah course gave my teenager clarity and confidence in her deen. Exactly the grounding we were searching for.",
        name: "Fatima S.",
        role: "Parent · Canada",
        accent: "primary-2",
      },
      {
        quote:
          "Every session tied belief back to evidence, not just assertion. It's changed how I hold my own convictions.",
        name: "Omar J.",
        role: "Adult learner · Australia",
        accent: "green",
      },
    ],
    ctaHeadline: "Meet your teacher, free.",
    ctaSub:
      "Book a short, no-obligation demo class and experience the teaching style before you commit to anything.",
    steps: paidSteps,
    faqs: [
      {
        q: "Is this course only for beginners?",
        a: "It's built as a foundation, so complete beginners are welcome — but many students with prior study join to fill gaps and sharpen clarity.",
      },
      ...sharedFaqs("paid"),
      {
        q: "Is this suitable for teenagers?",
        a: "Yes — this course is especially popular with teens, taught with language and examples relevant to the doubts they encounter today.",
      },
      {
        q: "Is there a certificate on completion?",
        a: "Students who complete all four modules and the final review receive a certificate of completion.",
      },
    ],
  },
  {
    slug: "tafsir-essentials",
    type: "free",
    category: "Qur'an",
    title: "Tafsīr Essentials",
    subtitle:
      "Understand the Book you recite — themes and meanings of selected surahs, taught simply and self-paced.",
    rating: "4.8",
    studentsLine: "1,200+ students enrolled",
    levelLine: "All levels",
    teacherName: "Ustadha S. Khan",
    teacherRole: "Tafsīr instructor",
    teacherBio:
      "Leads warm, structured tafsīr classes for sisters and younger learners, known for making dense meanings feel personal and memorable.",
    teacherQuote:
      "Once a surah's theme clicks, you never read it the same way again.",
    durationLine: "12 lessons · ~3 hrs",
    statStudents: "1,200+",
    statCountries: "40+",
    statCompletion: "78%",
    accent: "primary",
    outcomes: [
      "Understand the core themes of selected surahs",
      "Use basic tafsīr methodology to unlock meaning",
      "Connect verses to their historical context (asbāb al-nuzūl)",
      "Apply Qur'anic themes to daily life",
      "Read the Qur'an with more presence and reflection",
      "Recognise reliable tafsīr sources for further study",
    ],
    modules: [
      {
        title: "How to Approach Tafsīr",
        meta: "4 lessons · 15 min avg",
        lessons: [
          "Why we study tafsīr, not just translation",
          "Asbāb al-nuzūl — occasions of revelation",
          "Makkī vs Madanī surahs — why it matters",
          "Choosing reliable tafsīr sources",
        ],
      },
      {
        title: "Surahs of Guidance",
        meta: "4 lessons · 15 min avg",
        lessons: [
          "Surah Al-Fātiḥah — the opening",
          "Surah Al-Kahf — trials and guidance",
          "Surah Yāsīn — the heart of the Qur'an",
          "Surah Al-Mulk — reflection and protection",
        ],
      },
      {
        title: "Surahs of Law & Community",
        meta: "4 lessons · 15 min avg",
        lessons: [
          "Surah Al-Ḥujurāt — manners and community",
          "Surah Luqmān — timeless parental advice",
          "Surah An-Nūr — light and modesty",
          "Bringing it together: a lifetime of reflection",
        ],
      },
    ],
    logistics: freeLogistics,
    audience: [
      "Muslim parents wanting to teach meaning, not just recitation",
      "Homeschooling families building a Qur'an studies curriculum",
      "Self-paced adult learners with limited weekly time",
      "Anyone wanting to move past translation-only reading",
    ],
    testimonials: [
      {
        quote:
          "Short, focused lessons I could actually finish between errands. I now read Surah Al-Kahf every Friday with real understanding.",
        name: "Aisha N.",
        role: "Parent · London",
        accent: "primary",
      },
      {
        quote:
          "Free and no pressure to keep pace with a class — I worked through it at night after the kids slept.",
        name: "Zayd H.",
        role: "Adult learner · Malaysia",
        accent: "gold",
      },
    ],
    ctaHeadline: "Start this course today.",
    ctaSub: "Create your free access and begin Lesson 1 in under a minute — no payment, ever.",
    steps: freeSteps,
    faqs: [
      {
        q: "Do I need any prior tafsīr knowledge?",
        a: "No — this course starts from the basics of tafsīr methodology before moving into the surahs themselves.",
      },
      ...sharedFaqs("free"),
      {
        q: "Is this suitable for children?",
        a: "It's designed with adults and teens in mind, though many parents adapt the lessons to teach younger children the same themes.",
      },
      {
        q: "Is there a certificate on completion?",
        a: "Students who complete all three modules receive a certificate of completion.",
      },
    ],
  },
  {
    slug: "intro-to-hadith",
    type: "free",
    category: "Hadīth",
    title: "Intro to Hadīth",
    subtitle:
      "How the Sunnah reached us — narrators, chains, and authentication, simply explained and self-paced.",
    rating: "4.7",
    studentsLine: "890+ students enrolled",
    levelLine: "Beginner friendly",
    teacherName: "Shaykh I. Malik",
    teacherRole: "Aqīdah & Fiqh specialist",
    teacherBio:
      "Teaches the sciences of hadīth with an emphasis on why the chain of narration matters, drawing on years of classroom experience with beginners.",
    teacherQuote:
      "The isnād is one of the great gifts of this ummah — a paper trail for truth, centuries before the idea existed elsewhere.",
    durationLine: "8 lessons · ~2 hrs",
    statStudents: "890+",
    statCountries: "35+",
    statCompletion: "74%",
    accent: "green",
    outcomes: [
      "Define hadīth, sunnah, isnād and matn",
      "Explain how scholars graded narrations for authenticity",
      "Recognise ṣaḥīḥ, ḥasan and ḍaʿīf at a basic level",
      "Identify the major hadīth collections and their compilers",
      "Avoid common misuses of weak narrations",
      "Read a hadīth reference with basic literacy",
    ],
    modules: [
      {
        title: "What is a Hadīth?",
        meta: "3 lessons · 15 min avg",
        lessons: [
          "Hadīth, sunnah, isnād and matn defined",
          "Why hadīth is the second source of Islamic law",
          "How hadīth were preserved and transmitted",
        ],
      },
      {
        title: "The Science of Isnād",
        meta: "3 lessons · 15 min avg",
        lessons: [
          "Anatomy of a chain of narration",
          "The role of the muḥaddith (hadīth scholar)",
          "Conditions for an authentic chain",
        ],
      },
      {
        title: "Grades & Collections",
        meta: "2 lessons · 20 min avg",
        lessons: [
          "Ṣaḥīḥ, ḥasan, ḍaʿīf — grading explained",
          "The six major hadīth collections (Kutub al-Sittah)",
        ],
      },
    ],
    logistics: freeLogistics,
    audience: [
      "New Muslims wanting to understand the sources of Islamic law",
      "Homeschooling families adding hadīth literacy to their curriculum",
      "Adults who want to evaluate narrations they encounter online",
      "Anyone preparing for deeper study of fiqh or seerah",
    ],
    testimonials: [
      {
        quote:
          "I finally understand why scholars argue over authenticity instead of just accepting or rejecting a hadīth outright.",
        name: "Khadija P.",
        role: "Adult learner · South Africa",
        accent: "green",
      },
      {
        quote:
          "Short and clear. I use what I learned here every time I see a hadīth shared without a source.",
        name: "Yusuf B.",
        role: "Student · Egypt",
        accent: "primary",
      },
    ],
    ctaHeadline: "Start this course today.",
    ctaSub: "Create your free access and begin Lesson 1 in under a minute — no payment, ever.",
    steps: freeSteps,
    faqs: [
      {
        q: "Is this a deep, academic-level course?",
        a: "No — it's an accessible introduction. Students who want to go further are guided toward more advanced hadīth sciences study.",
      },
      ...sharedFaqs("free"),
      {
        q: "Is this suitable for teenagers?",
        a: "Yes — the lessons are written to be clear for teens and adults alike, with no prior background assumed.",
      },
      {
        q: "Is there a certificate on completion?",
        a: "Students who complete all three modules receive a certificate of completion.",
      },
    ],
  },
  {
    slug: "the-seerah",
    type: "free",
    category: "Seerah",
    title: "The Seerah",
    subtitle:
      "The life of the Prophet ﷺ as a living guide for our own times — told chronologically and self-paced.",
    rating: "4.9",
    studentsLine: "1,450+ students enrolled",
    levelLine: "All ages",
    teacherName: "Ustadh M. Yusuf",
    teacherRole: "Arabic language specialist",
    teacherBio:
      "A gifted storyteller who brings the seerah to life with historical context and practical reflection, popular with both parents and their children.",
    teacherQuote:
      "The seerah isn't history to memorise — it's a map for how to live, tested in the hardest circumstances imaginable.",
    durationLine: "10 lessons · ~3 hrs",
    statStudents: "1,450+",
    statCountries: "45+",
    statCompletion: "81%",
    accent: "gold",
    outcomes: [
      "Trace the major events of the Prophet's ﷺ life chronologically",
      "Draw practical lessons from his ﷺ character",
      "Understand the historical context of revelation",
      "Explain the significance of the Hijrah",
      "Apply prophetic patience to modern challenges",
      "Retell the seerah to children in an engaging way",
    ],
    modules: [
      {
        title: "Makkah — Early Life & Prophethood",
        meta: "4 lessons · 18 min avg",
        lessons: [
          "Arabia before Islam",
          "Birth and early life of the Prophet ﷺ",
          "The first revelation",
          "Early converts and years of quiet daʿwah",
        ],
      },
      {
        title: "Years of Trial",
        meta: "3 lessons · 18 min avg",
        lessons: [
          "Public proclamation and Quraysh's opposition",
          "The boycott and the Year of Sorrow",
          "The night journey and the pledge of ʿAqabah",
        ],
      },
      {
        title: "Madinah — Community & Character",
        meta: "3 lessons · 18 min avg",
        lessons: [
          "The Hijrah and building the first community",
          "Key battles and their lessons",
          "The Farewell Sermon and prophetic legacy",
        ],
      },
    ],
    logistics: freeLogistics,
    audience: [
      "Parents wanting a structured way to teach seerah at home",
      "Homeschooling families following a chronological history curriculum",
      "Adult learners revisiting the seerah with fresh depth",
      "Anyone wanting practical, character-based lessons from the Prophet's ﷺ life",
    ],
    testimonials: [
      {
        quote:
          "I've heard the seerah many times, but the way the historical context was explained here made it feel new.",
        name: "Hamza D.",
        role: "Adult learner · Nigeria",
        accent: "gold",
      },
      {
        quote:
          "We watch a lesson together as a family every weekend. My kids ask questions I never expected.",
        name: "Umm Ismail",
        role: "Homeschooling parent · Indonesia",
        accent: "navy",
      },
    ],
    ctaHeadline: "Start this course today.",
    ctaSub: "Create your free access and begin Lesson 1 in under a minute — no payment, ever.",
    steps: freeSteps,
    faqs: [
      {
        q: "Is this suitable for young children?",
        a: "The lessons are aimed at teens and adults, but many parents watch alongside younger children and pause to explain.",
      },
      ...sharedFaqs("free"),
      {
        q: "Do the lessons follow a strict chronological order?",
        a: "Yes — each module builds on the last, from pre-Islamic Arabia through to the Farewell Sermon.",
      },
      {
        q: "Is there a certificate on completion?",
        a: "Students who complete all three modules receive a certificate of completion.",
      },
    ],
  },
  {
    slug: "daily-adhkar",
    type: "free",
    category: "Worship",
    title: "Daily Adhkār",
    subtitle:
      "Morning and evening remembrances, with meaning and pronunciation — build a routine that sticks.",
    rating: "4.8",
    studentsLine: "2,100+ students enrolled",
    levelLine: "All levels",
    teacherName: "Ustadha S. Khan",
    teacherRole: "Tafsīr instructor",
    teacherBio:
      "Teaches adhkār with an emphasis on meaning and consistency over memorisation alone, helping students build habits that actually last.",
    teacherQuote:
      "A small dhikr said daily outlasts a long one said once. Consistency is the whole secret.",
    durationLine: "6 lessons · ~1 hr",
    statStudents: "2,100+",
    statCountries: "50+",
    statCompletion: "83%",
    accent: "navy",
    outcomes: [
      "Memorise the core morning and evening adhkār",
      "Understand the meaning behind each supplication",
      "Build a consistent daily dhikr routine",
      "Recognise adhkār for specific moments (leaving home, eating, travel)",
      "Pronounce each adhkār correctly",
      "Feel more present in remembrance throughout the day",
    ],
    modules: [
      {
        title: "Morning Adhkār",
        meta: "2 lessons · 20 min avg",
        lessons: ["Āyat al-Kursī and the three Quls", "Sayyid al-Istighfār and morning protection duas"],
      },
      {
        title: "Evening Adhkār",
        meta: "2 lessons · 20 min avg",
        lessons: ["Evening remembrance sequence", "Duas for sleep and protection at night"],
      },
      {
        title: "Adhkār for Daily Moments",
        meta: "2 lessons · 20 min avg",
        lessons: ["Leaving and entering the home, eating, travel", "Building a dhikr habit that sticks"],
      },
    ],
    logistics: freeLogistics,
    audience: [
      "Anyone wanting a consistent morning and evening dhikr routine",
      "Parents teaching children their first daily adhkār",
      "New Muslims learning core supplications from scratch",
      "Busy adults who need short, practical lessons",
    ],
    testimonials: [
      {
        quote:
          "Learning the meaning, not just the Arabic, is what finally made my morning adhkār stick.",
        name: "Sara L.",
        role: "Adult learner · Germany",
        accent: "navy",
      },
      {
        quote:
          "My kids now say the leaving-the-house dua without me reminding them. Small course, big habit change.",
        name: "Abu Musa",
        role: "Parent · Qatar",
        accent: "primary-2",
      },
    ],
    ctaHeadline: "Start this course today.",
    ctaSub: "Create your free access and begin Lesson 1 in under a minute — no payment, ever.",
    steps: freeSteps,
    faqs: [
      {
        q: "Do I need to already know Arabic to follow along?",
        a: "No — every dua is taught with pronunciation guidance, translation and meaning, no prior Arabic required.",
      },
      ...sharedFaqs("free"),
      {
        q: "Is this suitable for children?",
        a: "Yes — many parents use these lessons directly with children, starting with the shorter, simpler duas.",
      },
      {
        q: "Is there a certificate on completion?",
        a: "Students who complete all three modules receive a certificate of completion.",
      },
    ],
  },
  {
    slug: "fiqh-of-salah",
    type: "free",
    category: "Fiqh",
    title: "Fiqh of Salah",
    subtitle:
      "Pray with confidence — the prayer step by step, with the evidences, taught simply and self-paced.",
    rating: "4.8",
    studentsLine: "1,680+ students enrolled",
    levelLine: "Beginner friendly",
    teacherName: "Shaykh I. Malik",
    teacherRole: "Aqīdah & Fiqh specialist",
    teacherBio:
      "Teaches the fiqh of worship with an emphasis on evidence and practical correction, helping students pray with both accuracy and confidence.",
    teacherQuote:
      "Salah is the first thing we're asked about — it deserves to be learned properly, not guessed at.",
    durationLine: "9 lessons · ~2 hrs",
    statStudents: "1,680+",
    statCountries: "38+",
    statCompletion: "79%",
    accent: "primary-2",
    outcomes: [
      "Perform wuḍū correctly with understanding of its conditions",
      "Pray with correct sequence, wording and posture",
      "Identify and correct common mistakes in prayer",
      "Understand the evidences behind each step",
      "Handle doubts (e.g. a missed rakʿah) with confidence",
      "Lead a short prayer for family with assurance",
    ],
    modules: [
      {
        title: "Purification & Conditions of Prayer",
        meta: "3 lessons · 15 min avg",
        lessons: [
          "Wuḍū step by step, with evidences",
          "What breaks wuḍū, and tayammum",
          "Conditions that make prayer valid",
        ],
      },
      {
        title: "The Prayer Step by Step",
        meta: "3 lessons · 15 min avg",
        lessons: [
          "Standing, recitation and rukūʿ",
          "Sujūd and the tashahhud",
          "Completing the prayer correctly",
        ],
      },
      {
        title: "Common Errors & Their Corrections",
        meta: "3 lessons · 15 min avg",
        lessons: [
          "Frequent mistakes in movement and recitation",
          "Handling doubts — missed rakʿah, sujūd al-sahw",
          "Leading a short prayer with confidence",
        ],
      },
    ],
    logistics: freeLogistics,
    audience: [
      "New Muslims learning to pray for the first time",
      "Parents teaching children the prayer step by step",
      "Adults wanting to correct habits picked up without formal teaching",
      "Anyone preparing to lead family prayer confidently",
    ],
    testimonials: [
      {
        quote:
          "I'd been praying a certain way for years without knowing why. Understanding the evidences changed how present I feel in salah.",
        name: "Idris K.",
        role: "Adult learner · Kenya",
        accent: "primary-2",
      },
      {
        quote:
          "As a new Muslim, this was exactly the step-by-step start I needed — no assumptions, no jargon.",
        name: "Amina W.",
        role: "New Muslim · USA",
        accent: "green",
      },
    ],
    ctaHeadline: "Start this course today.",
    ctaSub: "Create your free access and begin Lesson 1 in under a minute — no payment, ever.",
    steps: freeSteps,
    faqs: [
      {
        q: "I've never prayed before — can I really start here?",
        a: "Yes — this course assumes no prior knowledge and walks through purification and prayer from the very beginning.",
      },
      ...sharedFaqs("free"),
      {
        q: "Is this suitable for children learning to pray?",
        a: "Yes — many parents teach directly alongside these lessons when introducing children to salah.",
      },
      {
        q: "Is there a certificate on completion?",
        a: "Students who complete all three modules receive a certificate of completion.",
      },
    ],
  },
  {
    slug: "arabic-alphabet",
    type: "free",
    category: "Language",
    title: "Arabic Alphabet",
    subtitle: "Read the script from zero — letters, joins, and short vowels, taught simply and self-paced.",
    rating: "4.9",
    studentsLine: "2,600+ students enrolled",
    levelLine: "Complete beginner",
    teacherName: "Ustadh M. Yusuf",
    teacherRole: "Arabic language specialist",
    teacherBio:
      "Specialist in Arabic literacy who has helped thousands of complete beginners — young and old — take their very first steps reading the script.",
    teacherQuote:
      "Every reader of the Qur'an started with these same 28 letters. The first step is always the hardest, and the shortest.",
    durationLine: "7 lessons · ~2 hrs",
    statStudents: "2,600+",
    statCountries: "55+",
    statCompletion: "85%",
    accent: "green",
    outcomes: [
      "Recognise and write all 28 Arabic letters",
      "Identify each letter in its four positional forms",
      "Apply short vowels (ḥarakāt) correctly",
      "Blend letters into simple words",
      "Read short words with growing fluency",
      "Build confidence before starting Qur'an reading",
    ],
    modules: [
      {
        title: "Letters & Their Shapes",
        meta: "3 lessons · 18 min avg",
        lessons: [
          "The 28 letters — sounds and shapes",
          "The four positional forms of each letter",
          "Practice: recognising letters at a glance",
        ],
      },
      {
        title: "Joining Letters & Short Vowels",
        meta: "2 lessons · 18 min avg",
        lessons: ["How letters connect within a word", "Fatḥa, kasra, ḍamma and sukūn"],
      },
      {
        title: "Reading Simple Words",
        meta: "2 lessons · 20 min avg",
        lessons: ["Blending letters into two- and three-letter words", "First steps toward Qur'an reading"],
      },
    ],
    logistics: freeLogistics,
    audience: [
      "Complete beginners with zero exposure to Arabic script",
      "Parents teaching young children their first Arabic letters",
      "Adults preparing to start Qur'an reading from scratch",
      "Anyone who has tried and struggled to self-teach before",
    ],
    testimonials: [
      {
        quote:
          "I'm in my forties and never thought I could learn this. Two weeks in, I was already sounding out simple words.",
        name: "Layla F.",
        role: "Adult learner · Sweden",
        accent: "green",
      },
      {
        quote:
          "My five-year-old now points out letters on packaging at home. This made it playful instead of stressful.",
        name: "Umm Khalid",
        role: "Parent · UAE",
        accent: "primary",
      },
    ],
    ctaHeadline: "Start this course today.",
    ctaSub: "Create your free access and begin Lesson 1 in under a minute — no payment, ever.",
    steps: freeSteps,
    faqs: [
      {
        q: "Is this really for absolute beginners?",
        a: "Yes — this is the true starting point, assuming no prior familiarity with the Arabic script at all.",
      },
      ...sharedFaqs("free"),
      {
        q: "What's the right age to start?",
        a: "This course works well from around age 5 upward, with parents guiding the youngest learners through each lesson.",
      },
      {
        q: "Is there a certificate on completion?",
        a: "Students who complete all three modules receive a certificate of completion.",
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
