// Client-only loader for the YouTube IFrame Player API, shared by the student
// course player and the admin notes pipeline (which uses it to read a video's
// length — the server can't, YouTube bot-checks server requests).

export interface YTPlayer {
  loadVideoById: (opts: { videoId: string; startSeconds?: number }) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
}

export interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: () => void;
        onStateChange?: (e: { data: number }) => void;
        onError?: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;
export function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve(window.YT as YTNamespace);
      };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    });
  }
  return apiPromise;
}

// Loads the video in an off-screen player just long enough to read its length.
export async function getYouTubeDuration(videoId: string, timeoutMs = 20_000): Promise<number> {
  const YT = await loadYouTubeApi();
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-9999px;top:0;width:320px;height:180px;";
  document.body.appendChild(host);
  const mount = document.createElement("div");
  host.appendChild(mount);

  let player: YTPlayer | null = null;
  try {
    return await new Promise<number>((resolve, reject) => {
      const deadline = Date.now() + timeoutMs;
      player = new YT.Player(mount, {
        videoId,
        playerVars: { autoplay: 0, controls: 0 },
        events: {
          // getDuration() can read 0 for a moment after onReady, so poll briefly.
          onReady: () => {
            const poll = () => {
              const d = player?.getDuration() ?? 0;
              if (d > 0) resolve(Math.round(d));
              else if (Date.now() > deadline) reject(new Error("Couldn't read the video length from YouTube"));
              else setTimeout(poll, 250);
            };
            poll();
          },
          onError: () => reject(new Error("YouTube couldn't load this video")),
        },
      });
      setTimeout(() => reject(new Error("Timed out loading the video from YouTube")), timeoutMs);
    });
  } finally {
    (player as YTPlayer | null)?.destroy();
    host.remove();
  }
}
