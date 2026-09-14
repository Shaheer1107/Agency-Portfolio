export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `project-${Date.now()}`
  );
}

export function getYouTubeEmbedUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be")
      return `https://www.youtube.com/embed/${url.pathname.slice(1).split("?")[0]}`;
    if (url.hostname.includes("youtube.com")) {
      const id =
        url.searchParams.get("v") ||
        url.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function isVideoUrl(value: string | null | undefined) {
  return Boolean(
    value &&
    (/\.(mp4|webm|ogg)(\?.*)?$/i.test(value) || getYouTubeEmbedUrl(value)),
  );
}

export function isImageUrl(value: string | null | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(url.pathname) ||
      url.hostname.endsWith(".supabase.co")
    );
  } catch {
    return false;
  }
}
