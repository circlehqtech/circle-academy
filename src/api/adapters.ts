import type { Announcement, Session, Submission } from "../types/lms";
import type { AssessmentRecord, CohortRecord, FacilitatorRecord, LiveClassRecord, ManagedCourse, ManagedLesson, ManagedModule, ManagedResource, StudentRecord } from "../types/workspace";
import { externalHttpUrl } from "../utils/externalMedia";
import { formatDateTime, toDateInputValue, toTimeInputValue } from "../utils/dateTime";

type UnknownRecord = Record<string, unknown>;

export function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

export function unwrap(value: unknown): unknown {
  const record = asRecord(value);
  return "data" in record ? record.data : value;
}

export function collection(value: unknown, ...keys: string[]): unknown[] {
  const data = unwrap(value);
  if (Array.isArray(data)) return data;
  const record = asRecord(data);
  for (const key of [...keys, "items", "results", "records"]) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
}

const string = (value: unknown, fallback = "") => typeof value === "string" ? value : value == null ? fallback : String(value);
const number = (value: unknown, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const id = (record: UnknownRecord) => string(record.id ?? record.courseId ?? record.accountId);
const titleCase = (value: unknown) => string(value).toLowerCase().replace(/(^|_)(\w)/g, (_, space: string, letter: string) => `${space ? " " : ""}${letter.toUpperCase()}`);

function resource(value: unknown): ManagedResource {
  const record = asRecord(value);
  const rawType = string(record.type, "TEXT");
  const label = rawType === "EXTERNAL_LINK" ? "External link" : titleCase(rawType);
  const allowed: ManagedResource["type"][] = ["Video", "Audio", "PDF", "Text", "Download", "External link"];
  return {
    id: id(record),
    title: string(record.title, "Untitled resource"),
    type: allowed.includes(label as ManagedResource["type"]) ? label as ManagedResource["type"] : "Text",
    textContent: string(record.textContent) || undefined,
    url: string(record.url) || undefined,
    required: record.required !== false,
  };
}

function lesson(value: unknown): ManagedLesson {
  const record = asRecord(value);
  const resources = collection(record.resources);
  const type = string(record.type ?? asRecord(resources[0]).type, "TEXT");
  const allowed: ManagedLesson["type"][] = ["Video", "Audio", "Text", "PDF", "External link", "Class recording"];
  const label = type === "EXTERNAL_LINK" ? "External link" : type === "CLASS_RECORDING" ? "Class recording" : titleCase(type);
  return {
    id: id(record),
    title: string(record.title, "Untitled lesson"),
    type: allowed.includes(label as ManagedLesson["type"]) ? label as ManagedLesson["type"] : "Text",
    description: string(record.description) || undefined,
    durationMinutes: number(record.durationMinutes) || undefined,
    resources: resources.map(resource),
  };
}

function module(value: unknown): ManagedModule {
  const record = asRecord(value);
  return { id: id(record), title: string(record.title, "Untitled module"), description: string(record.description) || undefined, lessons: collection(record.lessons).map(lesson) };
}

export function toManagedCourse(value: unknown, index = 0): ManagedCourse {
  // Admin course content is returned as { course, modules }, sometimes
  // inside a response `data` envelope. Keep the aggregate fields on the
  // outer object while reading course identity/details from `course`.
  const outer = asRecord(unwrap(value));
  const record = asRecord(outer.course ?? outer);
  const outerProgress = asRecord(outer.progress);
  const recordProgress = asRecord(record.progress);
  const progress = Math.min(100, Math.max(0, number(
    outer.progressPercentage
      ?? outerProgress.percentage
      ?? outerProgress.percent
      ?? record.progressPercentage
      ?? recordProgress.percentage
      ?? recordProgress.percent
      ?? outer.progress
      ?? record.progress,
  )));
  const modules = collection(record.modules ?? outer.modules).map(module);
  const courseId = id(record) || id(outer);
  const facilitators = collection(record.facilitators ?? outer.facilitators);
  const enrollments = collection(record.enrollments ?? outer.enrollments);
  return {
    id: courseId,
    title: string(record.title ?? record.name, "Untitled course"),
    coverUrl: string(record.coverUrl ?? record.coverImage ?? record.thumbnailUrl) || undefined,
    code: string(record.code ?? record.slug, "COURSE"),
    status: titleCase(record.status || "DRAFT") as ManagedCourse["status"],
    description: string(record.description),
    category: string(record.category, "General"),
    difficulty: string(record.difficulty) || undefined,
    durationWeeks: number(record.durationWeeks) || undefined,
    cohortId: string(outer.cohortId ?? record.cohortId) || null,
    facilitatorIds: facilitators.map((item) => id(asRecord(item))).filter(Boolean),
    modules,
    assessments: collection(record.assessments ?? outer.assessments, "assessments").map((assessment) => toAssessment(assessment, courseId)),
    students: number(record.studentCount ?? record.studentsCount ?? (typeof outer.students === "number" ? outer.students : undefined) ?? enrollments.length),
    progress,
    tone: (["a1", "a2", "a3"] as const)[index % 3],
    glyph: string(record.title ?? record.name, "Co").trim().slice(0, 2),
    nextLesson: string(outer.nextLessonTitle ?? outer.nextLesson ?? modules.flatMap((item) => item.lessons)[0]?.title, "Course orientation"),
  };
}

export function toFacilitator(value: unknown): FacilitatorRecord {
  const record = asRecord(value);
  const courseIds = collection(record.courses ?? record.courseAssignments).map((item) => id(asRecord(item))).filter(Boolean);
  return {
    id: id(record),
    name: string(record.name, `${string(record.firstName)} ${string(record.lastName)}`.trim() || "Facilitator"),
    email: string(record.email),
    courseIds,
    canGrade: record.canGrade !== false,
    status: titleCase(record.status || "ACTIVE") as FacilitatorRecord["status"],
    lastActive: formatDateTime(record.lastActiveAt ?? record.updatedAt),
  };
}

export function toStudent(value: unknown): StudentRecord {
  const outer = asRecord(value);
  const record = asRecord(outer.account ?? value);
  const enrollment = asRecord(outer.enrollment);
  const progress = asRecord(outer.progress);
  const courseId = string(enrollment.courseId ?? outer.courseId);
  const percentage = Math.min(100, Math.max(0, number(progress.percentage ?? progress.percent ?? outer.progressPercentage)));
  const nestedCourseIds = collection(outer.courses ?? outer.enrollments).map((item) => id(asRecord(asRecord(item).course ?? item))).filter(Boolean);
  return {
    id: id(record),
    name: string(record.name, `${string(record.firstName)} ${string(record.lastName)}`.trim() || "Student"),
    email: string(record.email),
    cohortId: string(enrollment.cohortId ?? record.cohortId),
    courseIds: [...new Set([courseId, ...nestedCourseIds].filter(Boolean))],
    learningStatus: titleCase(outer.learningStatus ?? record.learningStatus ?? "ON_TRACK") as StudentRecord["learningStatus"],
    lastActive: formatDateTime(progress.lastEventAt ?? record.lastLoginAt ?? record.lastActiveAt ?? record.updatedAt),
    progress: percentage,
    courseProgress: courseId ? { [courseId]: percentage } : {},
  };
}

export function toCohort(value: unknown, courseId = ""): CohortRecord {
  // The course-scoped endpoint returns an envelope like
  // { cohort: { ... }, studentCount, facilitators }. Keep the aggregate
  // fields from the envelope while reading identity/status fields from the
  // nested cohort record.
  const outer = asRecord(value);
  const record = asRecord(outer.cohort ?? value);
  return {
    id: id(record) || id(outer),
    name: string(record.name, "Cohort"),
    starts: string(record.startDate).slice(0, 10),
    ends: string(record.endDate).slice(0, 10),
    studentCount: number(outer.studentCount ?? record.studentCount ?? collection(outer.students ?? record.students).length),
    studentCap: record.studentCap == null ? null : number(record.studentCap),
    enrollmentOpensAt: string(record.enrollmentOpensAt),
    enrollmentClosesAt: string(record.enrollmentClosesAt),
    allowAdminEnrollmentAfterClose: record.allowAdminEnrollmentAfterClose !== false,
    courseIds: [string(record.courseId ?? outer.courseId ?? courseId)].filter(Boolean),
    facilitatorIds: collection(outer.facilitators ?? record.facilitators).map((item) => id(asRecord(item))).filter(Boolean),
    status: titleCase(record.status || "DRAFT") as CohortRecord["status"],
  };
}

export function toLiveClass(value: unknown, courseId = ""): LiveClassRecord {
  const record = asRecord(value);
  const start = new Date(string(record.startsAt, new Date().toISOString()));
  const end = new Date(string(record.endsAt, start.toISOString()));
  const status = titleCase(record.status || "SCHEDULED");
  return {
    id: id(record),
    title: string(record.title, "Live class"),
    courseId: string(record.courseId ?? courseId),
    date: toDateInputValue(start),
    time: toTimeInputValue(start),
    duration: Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000)),
    hostId: string(record.facilitatorId ?? asRecord(record.facilitator).id),
    meetingUrl: string(record.zoomJoinUrl ?? record.meetingUrl),
    recordingUrl: externalHttpUrl(string(record.recordingUrl)) || undefined,
    timezone: string(record.timezone) || undefined,
    description: string(record.description) || undefined,
    status: (status === "Scheduled" || status === "Cancelled" || status === "Completed" ? status : "Scheduled") as LiveClassRecord["status"],
  };
}

export function toAssessment(value: unknown, courseId = ""): AssessmentRecord {
  const outer = asRecord(unwrap(value));
  const record = asRecord(outer.assessment ?? outer);
  return {
    id: id(record),
    title: string(record.title, "Assessment"),
    description: string(record.description) || undefined,
    courseId: string(record.courseId ?? courseId),
    questions: number(outer.questionCount ?? record.questionCount ?? collection(record.questions ?? outer.questions, "questions").length),
    passingScore: number(record.passPercentage, 70),
    attempts: number(record.attemptLimit),
    status: titleCase(record.status || "DRAFT") as AssessmentRecord["status"],
  };
}

export function toSubmission(value: unknown): Submission {
  const outer = asRecord(value);
  const record = asRecord(outer.submission ?? value);
  const project = asRecord(record.project ?? outer.project ?? record.projectDefinition ?? outer.projectDefinition);
  const account = asRecord(record.account ?? record.student);
  const course = asRecord(record.course ?? outer.course ?? project.course);
  const statusValue = string(record.status).toUpperCase();
  const status: Submission["status"] = statusValue === "APPROVED" ? "approved" : statusValue === "REVISION_REQUESTED" ? "revision" : "pending";
  const name = string(account.name, `${string(account.firstName)} ${string(account.lastName)}`.trim() || "Student");
  const projectId = string(record.projectId ?? outer.projectId ?? project.id)
    || (string(record.type).toUpperCase().includes("PROJECT") || string(record.type).toUpperCase().includes("ASSIGNMENT") ? id(record) : "");
  const submissionId = string(record.submissionId ?? outer.submissionId)
    || (projectId && id(record) !== projectId ? id(record) : "");
  return {
    id: submissionId || projectId || id(record),
    submissionId: submissionId || undefined,
    projectId: projectId || undefined,
    courseId: string(record.courseId ?? outer.courseId ?? project.courseId ?? course.id) || undefined,
    lessonId: string(record.lessonId ?? outer.lessonId ?? project.lessonId) || undefined,
    student: name,
    initials: name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    course: string(course.title ?? record.courseTitle, "Course"),
    title: string(project.title ?? record.title, "Submission"),
    kind: string(project.type ?? record.kind ?? record.type).toUpperCase().includes("FINAL_PROJECT") ? "Final project" : "Assignment",
    submitted: formatDateTime(record.submittedAt ?? record.updatedAt),
    attempt: number(record.versionNumber ?? record.attempt, 1),
    format: string(record.format, collection(record.files).length ? "File" : "Written response"),
    body: string(project.brief ?? record.description ?? record.body),
    status,
    feedback: string(record.feedback) || undefined,
    workflowStatus: statusValue,
    dueAt: string(project.dueAt ?? record.dueAt ?? record.deadline),
    requirements: collection(project.requirements ?? record.requirements).map((item) => typeof item === "string" ? item : string(asRecord(item).label)).filter(Boolean),
  };
}

export function toAnnouncement(value: unknown): Announcement & { id?: string } {
  const wrapper = asRecord(value);
  const nested = asRecord(wrapper.announcement);
  const record = Object.keys(nested).length ? nested : wrapper;
  const readState = wrapper.isRead ?? wrapper.read ?? record.isRead ?? record.read;
  const readAt = wrapper.readAt ?? record.readAt;
  return {
    id: id(record),
    t: string(record.title, "Announcement"),
    m: string(record.body ?? record.message),
    unread: typeof readState === "boolean" ? !readState : !readAt,
  };
}

export function toSession(value: unknown): Session & { duration?: number; seen?: number } {
  const record = asRecord(value);
  const recordingUrl = externalHttpUrl(string(record.recordingUrl));
  return {
    id: extractId(record),
    t: string(record.title, "Live class"),
    d: formatDateTime(record.startsAt ?? record.date),
    ok: Boolean(recordingUrl),
    recordingUrl: recordingUrl || undefined,
    duration: number(record.recordingDurationSeconds ?? record.durationSeconds ?? record.duration, 0),
    seen: number(record.progress ?? record.seen, 0),
  };
}

export function extractId(value: unknown): string {
  const data = asRecord(unwrap(value));
  const direct = id(data);
  if (direct) return direct;
  for (const key of ["course", "module", "lesson", "resource", "assessment", "question", "option", "project", "cohort", "liveClass", "submission", "attempt", "studySession", "account"]) {
    const nested = id(asRecord(data[key]));
    if (nested) return nested;
  }
  return "";
}
