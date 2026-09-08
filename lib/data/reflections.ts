// Static ayah/hadith cards shown on the student portal home page. Not
// admin-managed — content changes rarely enough that editing this file is
// simpler than building a CMS section for it.

export interface ReflectionCard {
  tag: string;
  text: string;
  source: string;
  colorVar: string;
}

export const AYAHS: ReflectionCard[] = [
  {
    tag: "The reward",
    text: "Indeed, the patient will be given their reward without measure.",
    source: "Sūrah al-Zumar 39:10",
    colorVar: "var(--primary)",
  },
  {
    tag: "His company",
    text: "And be patient. Indeed, Allah is with the patient.",
    source: "Sūrah al-Anfāl 8:46",
    colorVar: "var(--green)",
  },
  {
    tag: "The greeting",
    text: "And the angels will enter upon them from every gate, saying: peace be upon you for what you patiently endured. Excellent indeed is the final home.",
    source: "Sūrah al-Raʿd 13:23–24",
    colorVar: "var(--primary-2)",
  },
  {
    tag: "The naʿīm",
    text: "Their reward with their Lord is gardens of perpetual residence beneath which rivers flow, wherein they abide forever.",
    source: "Sūrah al-Bayyinah 98:8",
    colorVar: "var(--navy)",
  },
];

export const AHADITH: ReflectionCard[] = [
  {
    tag: "On seeking ʿilm",
    text: "Whoever treads a path in search of knowledge, Allah will make easy for him the path to Paradise.",
    source: "Ṣaḥīḥ Muslim 2699",
    colorVar: "var(--primary)",
  },
  {
    tag: "On ʿamal",
    text: "The most beloved deeds to Allah are those done consistently, even if they are small.",
    source: "Ṣaḥīḥ al-Bukhārī 6464",
    colorVar: "var(--green)",
  },
  {
    tag: "On teaching",
    text: "The best of you are those who learn the Qurʾān and teach it.",
    source: "Ṣaḥīḥ al-Bukhārī 5027",
    colorVar: "var(--primary-2)",
  },
];
