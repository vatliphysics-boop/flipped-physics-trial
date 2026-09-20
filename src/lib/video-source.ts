const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"]);

export type VideoSource =
  | { kind: "storage"; bucket: string; path: string }
  | { kind: "direct"; url: string }
  | { kind: "invalid"; reason: "youtube" | "unsupported" };

export const SUPPORTED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"] as const;

export const SUPPORTED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

const LESSON_VIDEO_STORAGE_PREFIX = "storage:lesson-videos/";

type VideoStorageClient = {
  storage: {
    from: (bucket: string) => {
      getPublicUrl: (objectPath: string) => { data: { publicUrl: string } };
    };
  };
};

export function resolveVideoSource(value: string, supabase: VideoStorageClient): string | null {
  const source = value.trim();

  if (source.startsWith(LESSON_VIDEO_STORAGE_PREFIX)) {
    const objectPath = source.slice(LESSON_VIDEO_STORAGE_PREFIX.length);
    if (!objectPath) return null;

    const { data } = supabase.storage.from("lesson-videos").getPublicUrl(objectPath);
    return data.publicUrl || null;
  }

  if (/^https?:\/\//i.test(source)) return source;

  return null;
}

export function isMovVideoSource(value: string) {
  const source = value.toLowerCase().split("?")[0].split("#")[0];
  return source.endsWith(".mov") || source.includes("/lesson-videos/") && source.endsWith(".mov");
}

export function classifyVideoSource(value: string): VideoSource {
  const source = value.trim();
  if (source.startsWith("storage:lesson-videos/")) {
    const path = source.slice("storage:lesson-videos/".length);
    return path ? { kind: "storage", bucket: "lesson-videos", path } : { kind: "invalid", reason: "unsupported" };
  }

  try {
    const url = new URL(source);
    const hostname = url.hostname.toLowerCase();
    if (YOUTUBE_HOSTS.has(hostname) || hostname.endsWith(".youtube.com")) {
      return { kind: "invalid", reason: "youtube" };
    }
    const pathname = url.pathname.toLowerCase();
    if ((url.protocol === "http:" || url.protocol === "https:") && /\.(mp4|webm|mov)$/.test(pathname)) {
      return { kind: "direct", url: source };
    }
  } catch {
    // Fall through to the common unsupported-source response.
  }
  return { kind: "invalid", reason: "unsupported" };
}

export const YOUTUBE_VIDEO_ERROR = "Link YouTube không thể phát bằng trình phát học tập. Hãy tải video lên hoặc dùng link video trực tiếp.";