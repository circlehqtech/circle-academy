import type { ViewId } from "../types/lms";

const PATH_VIEW_MAP: Array<[RegExp, ViewId]> = [
  [/^\/student\/courses\/[^/]+$/, "course"],
  [/^\/student\/courses$/, "courses"],
  [/^\/student\/live(?:\/[^/]+)?$/, "live"],
  [/^\/student\/home$/, "home"],
  [/^\/student\/assignments$/, "assignments"],
  [/^\/student\/study$/, "study"],
  [/^\/student\/certificates$/, "certs"],
  [/^\/facilitator\/teaching$/, "teaching"],
  [/^\/facilitator\/reviews$/, "review"],
  [/^\/facilitator\/students$/, "facilitatorStudents"],
  [/^\/facilitator\/results$/, "results"],
  [/^\/facilitator\/classes$/, "facilitatorClasses"],
  [/^\/admin\/overview$/, "overview"],
  [/^\/admin\/courses\/(?:new|[^/]+\/edit)$/, "courseBuilder"],
  [/^\/admin\/courses$/, "adminCourses"],
  [/^\/admin\/people$/, "people"],
  [/^\/admin\/cohorts$/, "cohorts"],
  [/^\/admin\/content$/, "content"],
  [/^\/admin\/classes$/, "adminClasses"],
  [/^\/admin\/assessments$/, "assessments"],
  [/^\/admin\/projects$/, "projects"],
  [/^\/admin\/certificates$/, "adminCerts"],
  [/^\/admin\/recordings$/, "recs"],
  [/^\/(?:student|facilitator|admin)\/profile$/, "profile"],
];

export function getViewFromPath(pathname: string): ViewId | null {
  return PATH_VIEW_MAP.find(([pattern]) => pattern.test(pathname))?.[1] ?? null;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function titleFromSlug(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
