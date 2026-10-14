// Short motivational reminders on seeking ilm, shown on the student portal
// home page. Not admin-managed — content changes rarely enough that editing
// this file is simpler than building a CMS section for it.
//
// Salaf entries are paraphrased from widely-cited reports; keep them short and
// have a teacher review any addition before it goes live.

export type ReflectionKind = "quran" | "hadith" | "salaf";

export interface Reflection {
  kind: ReflectionKind;
  text: string;
  source: string;
}

export const KIND_LABEL: Record<ReflectionKind, string> = {
  quran: "Quran",
  hadith: "Hadith",
  salaf: "Salaf",
};

export const REFLECTIONS: Reflection[] = [
  { kind: "quran", text: "Say: \"My Lord, increase me in knowledge.\"", source: "Surah Ta Ha 20:114" },
  {
    kind: "quran",
    text: "Say: \"Are those who know equal to those who do not know?\"",
    source: "Surah al-Zumar 39:9",
  },
  {
    kind: "quran",
    text: "Allah will raise those of you who believe and those given knowledge, by degrees.",
    source: "Surah al-Mujadilah 58:11",
  },
  { kind: "quran", text: "And be patient. Indeed, Allah is with the patient.", source: "Surah al-Anfal 8:46" },

  {
    kind: "hadith",
    text: "Whoever treads a path in search of knowledge, Allah makes easy for him the path to Paradise.",
    source: "Sahih Muslim 2699",
  },
  {
    kind: "hadith",
    text: "The most beloved deeds to Allah are those done consistently, even if small.",
    source: "Sahih Bukhari 6464",
  },
  {
    kind: "hadith",
    text: "The best of you are those who learn the Quran and teach it.",
    source: "Sahih Bukhari 5027",
  },
  {
    kind: "hadith",
    text: "When Allah wants good for someone, He gives him understanding of the religion.",
    source: "Sahih Bukhari 71",
  },

  {
    kind: "salaf",
    text: "Asked how long he would keep seeking knowledge, Imam Ahmad replied: \"With the inkwell, to the grave.\"",
    source: "Reported of Imam Ahmad",
  },
  {
    kind: "salaf",
    text: "Yahya ibn Abi Kathir said: \"Knowledge is not gained through bodily comfort.\"",
    source: "Sahih Muslim, after Hadith 612",
  },
  {
    kind: "salaf",
    text: "Ibn Abbas would wait at the Companions' doors for knowledge, resting in the dust until they came out.",
    source: "Reported of Ibn Abbas",
  },
  {
    kind: "salaf",
    text: "Abu Hurayrah stayed beside the Prophet (peace be upon him) content with little food, and that is why he preserved so much.",
    source: "Sahih Bukhari 118",
  },
];

// Day-stable pick per kind, so everyone sees a fresh line each day without
// the card changing on every refresh.
export function dailyReflections(now: Date): Reflection[] {
  const day = Math.floor(now.getTime() / 86_400_000);
  return (Object.keys(KIND_LABEL) as ReflectionKind[]).map((kind) => {
    const pool = REFLECTIONS.filter((r) => r.kind === kind);
    return pool[day % pool.length];
  });
}
