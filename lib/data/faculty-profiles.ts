import type { FacultyProfile } from "@/lib/types";

export const facultyProfiles: FacultyProfile[] = [
  {
    slug: "haider-bin-farooq",
    name: "Haider bin Farooq",
    role: "Hadith, Aqīdah & Arabic Specialist",
    department: "Hadith & Islamic Sciences",
    bio: "Holds a BS in Islamic Studies (Hadith) from the International Islamic University Islamabad (IIUI), graduating as a Gold Medalist, and is currently pursuing an MS in Hadith and Its Sciences. He has received ijāzāt from renowned scholars of Pakistan and also holds a One-Year Diploma in Arabic.",
    credentials: [
      "BS Islamic Studies (Hadith) · IIUI, Gold Medalist",
      "Pursuing MS in Hadith and Its Sciences",
      "Ijāzāt from scholars of Pakistan",
      "One-Year Diploma in Arabic",
    ],
    specialties: [
      { icon: "١", title: "Tafsīr", text: "Explaining the meanings of the Qur'an, surah by surah." },
      { icon: "٢", title: "Hadith", text: "His core area of specialization and graduate study." },
      { icon: "٣", title: "Aqīdah", text: "Sound creed grounded in authentic sources." },
      { icon: "٤", title: "Tajwīd", text: "Correct recitation and articulation of the Qur'an." },
      { icon: "٥", title: "Arabic", text: "Language instruction backed by a Diploma in Arabic." },
    ],
    courseSlugs: [
      "tafseer-of-the-quran",
      "quran-tafsir",
      "umdat-al-ahkam",
      "arabic-language",
      "aqeedah-al-wasitiyyah",
      "islamic-studies",
      "quran-recitation",
      "noorani-qaida",
      "quranic-arabic",
    ],
    accent: "primary",
  },
  {
    slug: "ateeq-ur-rehman-zubair",
    name: "Ustadh Ateeq ur Rehman Zubair",
    role: "Tarbiyah, Hadith & Aqīdah Specialist",
    department: "Tarbiyah & Islamic Sciences",
    bio: "Holds an MA in Islamic Studies (Gold Medalist) and an MS in Hadith, and is currently pursuing higher studies at Umm al-Qura University in Makkah. He has studied under renowned scholars in both Pakistan and Saudi Arabia, bringing together strong academic training with traditional scholarship.",
    credentials: [
      "MA Islamic Studies · Gold Medalist",
      "MS in Hadith",
      "Pursuing higher studies at Umm al-Qura University, Makkah",
      "Studied under scholars in Pakistan & Saudi Arabia",
    ],
    specialties: [
      { icon: "١", title: "Tarbiyah", text: "Character and spiritual development rooted in the Sunnah." },
      { icon: "٢", title: "Hadith", text: "Graduate-level study under scholars in Pakistan and Saudi Arabia." },
      { icon: "٣", title: "Aqīdah", text: "Sound creed taught with academic depth." },
      { icon: "٤", title: "Arabic", text: "Strong grounding in the language of the source texts." },
    ],
    courseSlugs: ["umdat-al-ahkam", "aqeedah-al-wasitiyyah", "islamic-studies", "quranic-arabic"],
    accent: "primary-2",
  },
  {
    slug: "ustadhah-laraib-zafar",
    name: "Ustadhah Laraib Zafar",
    role: "Sisters' Hadith, Fiqh & Tafsīr Teacher",
    department: "Sisters' Islamic Studies",
    bio: "Holds a BS in Arabic from the International Islamic University Islamabad (IIUI) and has studied under renowned scholars in Pakistan and Saudi Arabia, combining academic excellence with traditional Islamic learning. She teaches sisters and younger learners, drawing on a wide range of specializations to provide a well-rounded and authentic Islamic education.",
    credentials: [
      "BS Arabic · IIUI",
      "Studied under scholars in Pakistan & Saudi Arabia",
      "Teaches sisters & younger learners",
    ],
    specialties: [
      { icon: "١", title: "Hadith", text: "Authentic narrations taught with clarity for sisters and students." },
      { icon: "٢", title: "Tajwīd", text: "Correct recitation and articulation of the Qur'an." },
      { icon: "٣", title: "Tarbiyah", text: "Character and spiritual development." },
      { icon: "٤", title: "Aqīdah", text: "Sound creed grounded in the Qur'an and Sunnah." },
      { icon: "٥", title: "Fiqh", text: "Practical rulings of worship and daily life." },
      { icon: "٦", title: "Tafsīr", text: "Meanings of the Qur'an explained clearly." },
      { icon: "٧", title: "Sīrah", text: "The life of the Prophet ﷺ, taught in context." },
    ],
    courseSlugs: [
      "umdat-al-ahkam",
      "quran-recitation",
      "noorani-qaida",
      "islamic-studies",
      "tafseer-of-the-quran",
      "quran-tafsir",
      "arabic-language",
    ],
    accent: "gold",
  },
];

export function getFacultyProfile(slug: string): FacultyProfile | undefined {
  return facultyProfiles.find((profile) => profile.slug === slug);
}

export function getAllFacultySlugs(): string[] {
  return facultyProfiles.map((profile) => profile.slug);
}
