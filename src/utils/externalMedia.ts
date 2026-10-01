export function externalHttpUrl(value?: string | null) {
  const input = value?.trim();
  if (!input) return "";
  try {
    const url = new URL(input);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export function videoEmbedUrl(value?: string | null) {
  const safeUrl = externalHttpUrl(value);
  if (!safeUrl) return "";
  const url = new URL(safeUrl);
  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : "";
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v") ?? (url.pathname.startsWith("/shorts/") ? url.pathname.split("/")[2] : "");
    return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : "";
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean).find((part) => /^\d+$/.test(part));
    return id ? `https://player.vimeo.com/video/${id}` : "";
  }
  return "";
}

export function isDirectVideoUrl(value?: string | null) {
  const safeUrl = externalHttpUrl(value);
  return Boolean(safeUrl && /\.(mp4|webm|ogg)(?:$|[?#])/i.test(safeUrl));
}
