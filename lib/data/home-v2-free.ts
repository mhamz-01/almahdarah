import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

// Server-only (touches the filesystem) — kept apart from home-v2.ts, which client components import.

/** Per free-course slug: Arabic title, subject tag, teacher line, and an optional poster image. */
const freeExtras: Record<string, { subject: string; ar: string; by: string; image: string }> = {
  "quran-tafsir": {
    subject: "TAFSĪR",
    ar: "التفسير",
    by: "Verse by verse",
    image: "free-tafseer-baqarah.png",
  },
  "umdat-al-ahkam": {
    subject: "ḤADĪTH",
    ar: "العمدة في الأحكام",
    by: "al-Ḥāfiẓ ʿAbd al-Ghanī al-Maqdisī",
    image: "free-umdah.jpg",
  },
  "arabic-language": {
    subject: "ARABIC",
    ar: "الداء والدواء",
    by: "Imām Ibn al-Qayyim al-Jawziyyah",
    image: "free-daa-wad-dawa.png",
  },
  "aqeedah-at-tadmuriyyah": {
    subject: "ʿAQĪDAH",
    ar: "الرسالة التدمرية",
    by: "Shaykh al-Islām Ibn Taymiyyah",
    image: "free-tadmuriyyah.png",
  },
  "aqeedah-al-wasitiyyah": {
    subject: "ʿAQĪDAH",
    ar: "العقيدة الواسطية",
    by: "Shaykh al-Islām Ibn Taymiyyah",
    image: "free-wasitiyyah.png",
  },
  "arbaeen-nawawi": {
    subject: "ḤADĪTH",
    ar: "الأربعون النووية",
    by: "al-Imām Yaḥyā an-Nawawī",
    image: "free-arbaeen.png",
  },
};

/** Returns the poster URL only if the file has actually been dropped into public/assets/courses. */
function posterIfPresent(file: string | undefined): string | null {
  if (!file) return null;
  const onDisk = path.join(process.cwd(), "public", "assets", "courses", file);
  return existsSync(onDisk) ? `/assets/courses/${file}` : null;
}

export function freeCourseExtras(slug: string) {
  const e = freeExtras[slug];
  return {
    subject: e?.subject ?? "COURSE",
    ar: e?.ar ?? "علم",
    by: e?.by ?? "",
    image: posterIfPresent(e?.image),
  };
}

