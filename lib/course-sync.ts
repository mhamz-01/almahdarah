import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface FeedEntry {
  videoId: string;
  title: string;
  published: number;
}

export interface CourseSyncResult {
  course: string;
  added: string[];
  error?: string;
}

// Branding that YouTube titles carry but that is redundant inside a course page.
const NOISE = [
  /Al Da'?a Wa Al Dawa'?a/gi,
  /Ar Risal\w* At[- ]?Tadmu\w*/gi,
  /Quran(?:ic)? Tafs[ie]+r/gi,
  /Al[- ]?Furqan Forum/gi,
  /Arabic Course/gi,
  /Arba'?een e nawawi/gi,
  /Al Arba`?een Al Nawa\w+/gi,
  /Al Umda?h? Fil Al Ahka?a?m/gi,
  /Qasas-ul-nabbiyen(?: \(Arabic\))?/gi,
  /Al-Aqeedat Al-Wassatiyah/gi,
];

export function cleanLessonTitle(raw: string): string {
  const parts = raw
    .split(/\s*\|+\s*/)
    .map((part) => NOISE.reduce((s, re) => s.replace(re, ""), part).replace(/\s+/g, " ").trim())
    .filter(Boolean);
  let title = parts.join(" – ") || raw.trim();
  title = title
    .replace(/\[?\(?\bPart[- ]?(\d+)\)?\]?/gi, "(Part $1)")
    .replace(/\b(?:Episode|Arabic Class|Class no|Class)\s+(\d+)/gi, "Class $1")
    .replace(/(\d)\s*-\s*(\d)/g, "$1–$2");
  return title.replace(/\s+/g, " ").trim();
}

function decodeXml(s: string) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

// The public playlist feed needs no API key and lists the latest ~15 videos.
async function fetchPlaylistFeed(playlistId: string): Promise<FeedEntry[]> {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(playlistId)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`YouTube feed returned ${res.status}`);
  const xml = await res.text();
  const entries: FeedEntry[] = [];
  for (const block of xml.split("<entry>").slice(1)) {
    const videoId = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = block.match(/<title>([^<]*)<\/title>/)?.[1];
    const published = block.match(/<published>([^<]+)<\/published>/)?.[1];
    if (videoId && title) entries.push({ videoId, title: decodeXml(title), published: Date.parse(published ?? "") || 0 });
  }
  return entries;
}

// Appends any playlist videos that aren't lessons yet, oldest first.
export async function syncCoursePlaylists(): Promise<CourseSyncResult[]> {
  const supabase = createSupabaseAdminClient();

  const [coursesRes, lessonsRes] = await Promise.all([
    supabase.from("courses").select("id, title, youtube_playlist_id").not("youtube_playlist_id", "is", null),
    supabase.from("course_lessons").select("course_id, youtube_video_id, position"),
  ]);
  if (coursesRes.error) throw new Error(coursesRes.error.message);
  if (lessonsRes.error) throw new Error(lessonsRes.error.message);

  const known = new Map<number, Set<string>>();
  const lastPosition = new Map<number, number>();
  for (const l of lessonsRes.data ?? []) {
    if (!known.has(l.course_id)) known.set(l.course_id, new Set());
    known.get(l.course_id)!.add(l.youtube_video_id);
    lastPosition.set(l.course_id, Math.max(lastPosition.get(l.course_id) ?? 0, l.position));
  }

  const results: CourseSyncResult[] = [];
  for (const course of coursesRes.data ?? []) {
    try {
      const feed = await fetchPlaylistFeed(course.youtube_playlist_id as string);
      const seen = known.get(course.id) ?? new Set<string>();
      const fresh = feed.filter((e) => !seen.has(e.videoId)).sort((a, b) => a.published - b.published);

      if (fresh.length) {
        const start = lastPosition.get(course.id) ?? 0;
        const { error } = await supabase.from("course_lessons").upsert(
          fresh.map((e, i) => ({
            course_id: course.id,
            position: start + i + 1,
            title: cleanLessonTitle(e.title),
            youtube_video_id: e.videoId,
          })),
          { onConflict: "course_id,youtube_video_id", ignoreDuplicates: true },
        );
        if (error) throw new Error(error.message);
      }
      results.push({ course: course.title, added: fresh.map((e) => cleanLessonTitle(e.title)) });
    } catch (err) {
      results.push({ course: course.title, added: [], error: err instanceof Error ? err.message : "Unknown error" });
    }
  }
  return results;
}
