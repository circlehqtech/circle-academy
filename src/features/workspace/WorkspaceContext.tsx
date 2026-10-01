import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../auth/useAuth";
import { lmsApi } from "../../api/lmsApi";
import { useAdminAccounts } from "../../api/adminAccounts";
import { asRecord, collection, extractId, toAnnouncement, toAssessment, toCohort, toFacilitator, toLiveClass, toManagedCourse, toSession, toStudent, toSubmission, unwrap } from "../../api/adapters";
import type { Session, Submission, SubmissionDraftInput, SubmissionStatus } from "../../types/lms";
import type { AssessmentRecord, CohortRecord, CourseInput, FacilitatorRecord, LiveClassRecord, ManagedModule, StudentRecord } from "../../types/workspace";
import { externalHttpUrl } from "../../utils/externalMedia";
import { WorkspaceContext, type WorkspaceContextValue } from "./workspace-context";

interface WorkspacePayload {
  courses: unknown[];
  facilitators: unknown[];
  students: unknown[];
  cohorts: Array<{ value: unknown; courseId: string }>;
  liveClasses: Array<{ value: unknown; courseId: string }>;
  assessments: Array<{ value: unknown; courseId: string }>;
  submissions: unknown[];
  announcements: unknown[];
  sessions: unknown[];
}

const EMPTY_PAYLOAD: WorkspacePayload = {
  courses: [], facilitators: [], students: [], cohorts: [], liveClasses: [], assessments: [], submissions: [], announcements: [], sessions: [],
};
const EMPTY_VALUES: unknown[] = [];

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function apiStatus(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "_");
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function existingContentId(value: string) {
  return UUID_PATTERN.test(value) ? value : undefined;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

function alreadyAssigned(error: unknown) {
  const value = error as { status?: number; message?: string } | null;
  return value?.status === 409 || /already (?:enrolled|assigned|in (?:this )?cohort)/i.test(value?.message ?? "");
}

async function loadWorkspace(role: "student" | "facilitator" | "admin"): Promise<WorkspacePayload> {
  const announcementsPromise = lmsApi.announcements.feed();
  if (role === "student") {
    const [courses, liveClasses, assignments, submissions, announcements, replays] = await Promise.all([
      lmsApi.student.courses(), lmsApi.student.liveClasses(), lmsApi.student.assignments(), lmsApi.student.submissions(), announcementsPromise, lmsApi.student.replays(),
    ]);
    const courseValues = collection(courses, "courses");
    const learning = await Promise.all(courseValues.map(async (value) => {
      const courseId = extractId(value);
      if (!courseId) return value;
      try { return { ...asRecord(value), ...asRecord(unwrap(await lmsApi.student.learning(courseId))) }; }
      catch { return value; }
    }));
    return {
      ...EMPTY_PAYLOAD,
      courses: learning,
      liveClasses: collection(liveClasses, "liveClasses", "classes").map((value) => ({ value, courseId: String(asRecord(value).courseId ?? "") })),
      submissions: [...collection(assignments, "assignments"), ...collection(submissions, "submissions")],
      announcements: collection(announcements, "announcements"),
      sessions: collection(replays, "replays"),
    };
  }
  if (role === "facilitator") {
    const [dashboard, announcements] = await Promise.all([lmsApi.facilitator.dashboard(), announcementsPromise]);
    const courseValues = collection(unwrap(dashboard), "courses", "assignedCourses");
    const courseIds = courseValues.map(extractId).filter(Boolean);
    const details = await Promise.all(courseIds.map(async (courseId) => {
      const [students, liveClasses, submissions] = await Promise.all([
        lmsApi.facilitator.students(courseId), lmsApi.facilitator.liveClasses(courseId), lmsApi.facilitator.submissions(courseId),
      ]);
      return { courseId, students, liveClasses, submissions };
    }));
    return {
      ...EMPTY_PAYLOAD,
      courses: courseValues,
      students: details.flatMap((item) => collection(item.students, "students")),
      liveClasses: details.flatMap((item) => collection(item.liveClasses, "liveClasses", "classes").map((value) => ({ value, courseId: item.courseId }))),
      submissions: details.flatMap((item) => collection(item.submissions, "submissions")),
      assessments: [],
      announcements: collection(announcements, "announcements"),
    };
  }
  // Admin pages can still render useful account data when a secondary
  // workspace endpoint is unavailable. Keep each response independent so a
  // failed announcements/details request cannot blank the People page.
  const [courseResult, announcementsResult] = await Promise.allSettled([
    lmsApi.admin.courses(), announcementsPromise,
  ]);
  const baseCourses = courseResult.status === "fulfilled" ? collection(courseResult.value, "courses") : [];
  const announcements = announcementsResult.status === "fulfilled" ? collection(announcementsResult.value, "announcements") : [];
  // Course list responses may return either a flat course record or an
  // envelope such as { course: { id } }. Always use the shared extractor so
  // the course-scoped cohorts/live-classes endpoints are actually queried.
  const courseIds = baseCourses.map(extractId).filter(Boolean);
  const details = await Promise.all(courseIds.map(async (courseId) => {
    const [contentResult, cohortsResult, liveClassesResult, assessmentsResult, submissionsResult] = await Promise.allSettled([
      lmsApi.admin.courseContent(courseId), lmsApi.admin.cohorts(courseId), lmsApi.admin.liveClasses(courseId), lmsApi.admin.assessments(courseId), lmsApi.admin.submissions(courseId),
    ]);
    return {
      courseId,
      content: contentResult.status === "fulfilled" ? contentResult.value : {},
      cohorts: cohortsResult.status === "fulfilled" ? cohortsResult.value : [],
      liveClasses: liveClassesResult.status === "fulfilled" ? liveClassesResult.value : [],
      assessments: assessmentsResult.status === "fulfilled" ? assessmentsResult.value : [],
      submissions: submissionsResult.status === "fulfilled" ? submissionsResult.value : [],
    };
  }));
  const contentByCourse = new Map(details.map((item) => [item.courseId, asRecord(unwrap(item.content))]));
  return {
    courses: baseCourses.map((value) => ({ ...asRecord(value), ...contentByCourse.get(extractId(value)) })),
    facilitators: [],
    students: [],
    cohorts: details.flatMap((item) => collection(item.cohorts, "cohorts").map((value) => ({ value, courseId: item.courseId }))),
    liveClasses: details.flatMap((item) => collection(item.liveClasses, "liveClasses", "classes").map((value) => ({ value, courseId: item.courseId }))),
    assessments: details.flatMap((item) => collection(item.assessments, "assessments").map((value) => ({ value, courseId: item.courseId }))),
    submissions: details.flatMap((item) => collection(item.submissions, "submissions")),
    announcements: collection(announcements, "announcements"),
    sessions: details.flatMap((item) => collection(item.liveClasses, "liveClasses", "classes")),
  };
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { role, isAuthenticated, mustChangePassword } = useAuth();
  const queryClient = useQueryClient();
  const [announcementPanelOpen, setAnnouncementPanelOpen] = useState(false);
  const adminAccountsEnabled = isAuthenticated && role === "admin";
  const adminStudents = useAdminAccounts("STUDENT", adminAccountsEnabled);
  const adminFacilitators = useAdminAccounts("FACILITATOR", adminAccountsEnabled);
  const workspaceQuery = useQuery({
    queryKey: ["workspace", role],
    queryFn: () => loadWorkspace(role!),
    enabled: isAuthenticated && role !== null,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const raw = workspaceQuery.data ?? EMPTY_PAYLOAD;
  const courses = useMemo(() => raw.courses.map(toManagedCourse), [raw.courses]);
  const facilitatorValues = role === "admin" ? adminFacilitators.data ?? EMPTY_VALUES : raw.facilitators;
  const studentValues = role === "admin" ? adminStudents.data ?? EMPTY_VALUES : raw.students;
  const facilitators = useMemo(() => facilitatorValues.map(toFacilitator), [facilitatorValues]);
  const students = useMemo(() => {
    const mapped = studentValues.map(toStudent);
    if (role !== "facilitator") return mapped;
    const byId = new Map<string, StudentRecord>();
    mapped.forEach((student) => {
      const existing = byId.get(student.id);
      if (!existing) { byId.set(student.id, student); return; }
      const courseIds = [...new Set([...existing.courseIds, ...student.courseIds])];
      const courseProgress = { ...existing.courseProgress, ...student.courseProgress };
      const percentages = Object.values(courseProgress);
      byId.set(student.id, { ...existing, ...student, courseIds, courseProgress, progress: percentages.length ? Math.round(percentages.reduce((total, value) => total + value, 0) / percentages.length) : 0, lastActive: student.lastActive !== "—" ? student.lastActive : existing.lastActive });
    });
    return [...byId.values()];
  }, [role, studentValues]);
  const cohorts = useMemo(() => raw.cohorts.map((item) => toCohort(item.value, item.courseId)), [raw.cohorts]);
  const liveClasses = useMemo(() => raw.liveClasses.map((item) => toLiveClass(item.value, item.courseId)), [raw.liveClasses]);
  const assessments = useMemo(() => raw.assessments.map((item) => toAssessment(item.value, item.courseId)), [raw.assessments]);
  const submissions = useMemo(() => {
    const byWork = new Map<string, Submission>();
    raw.submissions.map(toSubmission).forEach((item) => byWork.set(item.projectId || item.submissionId || item.id, item));
    return [...byWork.values()];
  }, [raw.submissions]);
  const announcements = useMemo(() => {
    const items = raw.announcements.map(toAnnouncement);
    return mustChangePassword ? [{ t: "Change your temporary password", m: "Open Profile → Account & security and replace SecurePass123! now.", unread: true }, ...items] : items;
  }, [mustChangePassword, raw.announcements]);
  const sessions = useMemo(() => raw.sessions.map(toSession), [raw.sessions]);
  const refresh = useCallback(() => queryClient.invalidateQueries({ queryKey: ["workspace"] }), [queryClient]);
  const run = useCallback(async (action: () => Promise<unknown>, success: string) => {
    try { await action(); await refresh(); toast(success); return true; }
    catch (error) { toast(errorMessage(error)); return false; }
  }, [refresh, toast]);

  const markAllAnnouncementsRead = useCallback(() => void run(() => lmsApi.announcements.markAllRead(), "Announcements marked as read."), [run]);
  const markAnnouncementRead = useCallback((announcementId: string) => void run(() => lmsApi.announcements.markRead(announcementId), "Announcement marked as read."), [run]);
  const saveCourseDetails = useCallback(async (course: CourseInput) => {
    let savedCourseId = course.id ?? "";
    try {
      const payload = {
        title: course.title,
        code: course.code || undefined,
        slug: slugify(course.code || course.title),
        description: course.description,
        category: course.category,
        difficulty: course.difficulty,
        durationWeeks: course.durationWeeks,
        coverUrl: course.coverUrl,
      };
      const response = course.id ? await lmsApi.admin.updateCourse(course.id, payload) : await lmsApi.admin.createCourse(payload);
      const courseId = course.id ?? extractId(response);
      if (!courseId) throw new Error("The API did not return the created course ID.");
      savedCourseId = courseId;
      await refresh();
      toast(course.id ? "Course details updated." : "Course created. Continue with the curriculum.");
    } catch (error) {
      toast(errorMessage(error));
      return "";
    }
    return savedCourseId;
  }, [refresh, toast]);

  const saveCourseCurriculum = useCallback(async (courseId: string, modules: ManagedModule[], previousModules: ManagedModule[], course: CourseInput) => {
    try {
      for (const lesson of modules.flatMap((module) => module.lessons)) {
        const resources = lesson.resources ?? [];
        if (["Video", "Class recording"].includes(lesson.type) && !resources.some((resource) => resource.type === "Video" && externalHttpUrl(resource.url))) {
          throw new Error(`${lesson.title} needs an external video link.`);
        }
        for (const resource of resources.filter((item) => item.type === "Video" || item.type === "External link")) {
          if (!externalHttpUrl(resource.url)) throw new Error(`${resource.title} needs a valid http or https URL.`);
        }
      }

      const modulePayloads = await Promise.all(modules.map(async (module, moduleIndex) => ({
        id: existingContentId(module.id),
        title: module.title,
        description: module.description || undefined,
        position: moduleIndex + 1,
        lessons: await Promise.all(module.lessons.map(async (lesson, lessonIndex) => ({
          id: existingContentId(lesson.id),
          title: lesson.title,
          description: lesson.description || undefined,
          type: apiStatus(lesson.type),
          durationMinutes: lesson.durationMinutes,
          position: lessonIndex + 1,
          resources: await Promise.all((lesson.resources ?? []).map(async (resource, resourceIndex) => {
            const linkOnly = resource.type === "Video" || resource.type === "External link";
            const linkedUrl = linkOnly ? externalHttpUrl(resource.url) : resource.url;
            if (linkOnly && !linkedUrl) throw new Error(`${resource.title} needs a valid http or https URL.`);
            const uploaded = resource.file && !linkOnly
              ? await lmsApi.uploads.create(resource.file, "course-resource")
              : null;
            return {
              id: existingContentId(resource.id),
              title: resource.title,
              type: apiStatus(resource.type),
              textContent: resource.textContent || undefined,
              url: (uploaded?.url ?? linkedUrl) || undefined,
              position: resourceIndex + 1,
              required: resource.required,
            };
          })),
        }))),
      })));

      let activeCourseId = courseId;
      let refreshedContent: unknown;
      try {
        await lmsApi.admin.replaceCourseContent(courseId, { modules: modulePayloads });
      } catch (bulkError) {
        // The deployed service can persist the transaction and still respond
        // with 500 while serializing the result. Confirm the stored tree
        // before retrying targeted creates, which would otherwise collide on
        // module positions and produce another 500.
        try {
          const storedContent = await lmsApi.admin.courseContent(courseId);
          const storedModules = toManagedCourse(storedContent).modules;
          const storedLessons = storedModules.reduce((total, module) => total + module.lessons.length, 0);
          const expectedLessons = modules.reduce((total, module) => total + module.lessons.length, 0);
          const storedResources = storedModules.reduce((total, module) => total + module.lessons.reduce((lessonTotal, lesson) => lessonTotal + (lesson.resources?.length ?? 0), 0), 0);
          const expectedResources = modules.reduce((total, module) => total + module.lessons.reduce((lessonTotal, lesson) => lessonTotal + (lesson.resources?.length ?? 0), 0), 0);
          if (storedModules.length === modules.length && storedLessons === expectedLessons && storedResources === expectedResources) refreshedContent = storedContent;
        } catch { /* The recovery below will report a useful error. */ }
        if (!refreshedContent) {
          if (previousModules.length) throw bulkError;
          // POST /admin/courses is the reliable deployed path for a complete
          // new curriculum. Retire the empty draft, free its unique code/slug,
          // and recreate the course atomically with its nested content.
          const retiredSuffix = Date.now().toString().slice(-6);
          await lmsApi.admin.updateCourse(courseId, {
            title: `${course.title} (incomplete draft)`,
            code: `${course.code || slugify(course.title)}-OLD-${retiredSuffix}`,
            slug: `${slugify(course.code || course.title)}-old-${retiredSuffix}`,
          });
          await lmsApi.admin.setCourseStatus(courseId, "ARCHIVED");
          const created = await lmsApi.admin.createCourse({
            title: course.title,
            code: course.code || undefined,
            slug: slugify(course.code || course.title),
            description: course.description,
            category: course.category,
            difficulty: course.difficulty,
            durationWeeks: course.durationWeeks,
            coverUrl: course.coverUrl,
            modules: modulePayloads,
          });
          activeCourseId = extractId(created);
          if (!activeCourseId) throw new Error("The complete course was created without an ID.");
          refreshedContent = created;
        }
      }
      try { refreshedContent ??= await lmsApi.admin.courseContent(activeCourseId); }
      catch (error) { throw new Error(`Curriculum saved, but could not refresh it: ${errorMessage(error)}`); }
      const savedModules = toManagedCourse(refreshedContent).modules;
      await refresh();
      toast("Curriculum saved in one request.");
      return { courseId: activeCourseId, modules: savedModules };
    } catch (error) {
      toast(errorMessage(error));
      return null;
    }
  }, [refresh, toast]);

  const saveCourseFacilitators = useCallback(async (courseId: string, facilitatorIds: string[]) =>
    run(() => lmsApi.admin.replaceFacilitators(courseId, facilitatorIds), "Course facilitators saved."), [run]);

  const setCourseStatus = useCallback(async (courseId: string, status: CourseInput["status"]) =>
    run(() => lmsApi.admin.setCourseStatus(courseId, apiStatus(status)), `Course ${status.toLowerCase()}.`), [run]);
  const duplicateCourse = useCallback((courseId: string) => void run(() => lmsApi.admin.duplicateCourse(courseId), "Course duplicated as a draft."), [run]);
  const archiveCourse = useCallback((courseId: string) => void run(() => lmsApi.admin.setCourseStatus(courseId, "ARCHIVED"), "Course archived."), [run]);
  const saveFacilitator = useCallback(async (facilitator: Omit<FacilitatorRecord, "id" | "lastActive" | "status"> & { id?: string }) => {
    if (!facilitator.id) { toast("Create and approve the facilitator account first; the API does not provide an admin invite endpoint."); return false; }
    return run(async () => { await Promise.all(courses.map((course) => { const ids = new Set(course.facilitatorIds); if (facilitator.courseIds.includes(course.id)) ids.add(facilitator.id!); else ids.delete(facilitator.id!); return lmsApi.admin.replaceFacilitators(course.id, [...ids]); })); }, "Facilitator assignments updated.");
  }, [courses, run, toast]);
  const saveStudent = useCallback(async (student: Omit<StudentRecord, "id" | "lastActive" | "learningStatus"> & { id?: string }) => {
    if (!student.id) { toast("Create and approve the student account first; the API does not provide an admin invite endpoint."); return false; }
    return run(async () => {
      const existing = students.find((item) => item.id === student.id);
      const selectedCohort = cohorts.find((cohort) => cohort.id === student.cohortId);
      // A cohort belongs to a course. Enrolling in that course first keeps the
      // account/course and cohort membership in sync for existing students.
      const desiredCourseIds = new Set(student.courseIds);
      selectedCohort?.courseIds.forEach((courseId) => desiredCourseIds.add(courseId));
      const idsToEnroll = [...desiredCourseIds].filter((courseId) => !existing?.courseIds.includes(courseId));
      await Promise.all(idsToEnroll.map(async (courseId) => {
        try { await lmsApi.admin.enrollStudent(courseId, student.id!); }
        catch (error) { if (!alreadyAssigned(error)) throw error; }
      }));

      const previousCohortId = existing?.cohortId || "";
      const nextCohortId = student.cohortId || "";
      if (previousCohortId !== nextCohortId) {
        if (nextCohortId) {
          try { await lmsApi.admin.addCohortStudent(nextCohortId, student.id!); }
          catch (error) { if (!alreadyAssigned(error)) throw error; }
        }
        if (previousCohortId) await lmsApi.admin.removeCohortStudent(previousCohortId, student.id!);
      }
    }, "Student course and cohort assignments updated.");
  }, [cohorts, run, students, toast]);
  const saveCohort = useCallback(async (cohort: Omit<CohortRecord, "id"> & { id?: string }) => {
    const courseId = cohort.courseIds[0];
    if (!courseId) { toast("Choose a course for this cohort."); return null; }
    try {
      const payload = {
        name: cohort.name,
        startDate: cohort.starts || undefined,
        endDate: cohort.ends || undefined,
        studentCap: cohort.studentCap,
        enrollmentOpensAt: cohort.enrollmentOpensAt || null,
        enrollmentClosesAt: cohort.enrollmentClosesAt || null,
        allowAdminEnrollmentAfterClose: cohort.allowAdminEnrollmentAfterClose,
      };
      const response = cohort.id ? await lmsApi.admin.updateCohort(cohort.id, payload) : await lmsApi.admin.createCohort(courseId, payload);
      const cohortId = cohort.id ?? extractId(response);
      if (!cohortId) throw new Error("The API did not return the created cohort ID.");
      await lmsApi.admin.replaceCohortFacilitators(cohortId, cohort.facilitatorIds);
      const existing = cohorts.find((item) => item.id === cohort.id);
      if ((!cohort.id && cohort.status !== "Draft") || (existing && existing.status !== cohort.status)) {
        await lmsApi.admin.setCohortStatus(cohortId, apiStatus(cohort.status));
      }
      await refresh();
      return cohortId;
    } catch (error) {
      toast(errorMessage(error));
      return null;
    }
  }, [cohorts, refresh, toast]);
  const duplicateCohort = useCallback((cohortId: string) => void run(() => lmsApi.admin.duplicateCohort(cohortId), "Cohort duplicated."), [run]);
  const archiveCohort = useCallback((cohortId: string) => void run(() => lmsApi.admin.setCohortStatus(cohortId, "ARCHIVED"), "Cohort archived."), [run]);
  const saveLiveClass = useCallback(async (liveClass: Omit<LiveClassRecord, "id"> & { id?: string }) => {
    return run(async () => {
      const startsAt = new Date(`${liveClass.date}T${liveClass.time}:00`).toISOString();
      const endsAt = new Date(new Date(startsAt).getTime() + liveClass.duration * 60_000).toISOString();
      const payload = { title: liveClass.title, startsAt, endsAt, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, zoomJoinUrl: liveClass.meetingUrl || undefined };
      const response = liveClass.id ? await lmsApi.admin.updateLiveClass(liveClass.id, payload) : await lmsApi.admin.createLiveClass(liveClass.courseId, payload);
      const liveClassId = liveClass.id ?? extractId(response);
      if (!liveClassId) throw new Error("The API did not return the live class ID.");
      if (liveClass.hostId) await lmsApi.admin.assignLiveClassFacilitator(liveClassId, liveClass.hostId);
      if (["Cancelled", "Completed", "Scheduled"].includes(liveClass.status)) await lmsApi.admin.setLiveClassStatus(liveClassId, apiStatus(liveClass.status));
    }, liveClass.id ? "Class updated." : "Live class scheduled.");
  }, [run]);
  const startLiveClass = useCallback((classId: string) => { const item = liveClasses.find((entry) => entry.id === classId); if (item?.meetingUrl) window.open(item.meetingUrl, "_blank", "noopener,noreferrer"); else toast("Add a Zoom join URL before starting this class."); }, [liveClasses, toast]);
  const duplicateLiveClass = useCallback((classId: string) => { const source = liveClasses.find((item) => item.id === classId); if (source) saveLiveClass({ ...source, id: undefined, title: `${source.title} copy`, status: "Scheduled" }); }, [liveClasses, saveLiveClass]);
  const cancelLiveClass = useCallback((classId: string) => void run(() => lmsApi.admin.setLiveClassStatus(classId, "CANCELLED"), "Class cancelled."), [run]);
  const saveAssessment = useCallback((assessment: Omit<AssessmentRecord, "id"> & { id?: string }) => {
    void run(async () => {
      if (assessment.id) { await lmsApi.admin.setAssessmentStatus(assessment.id, apiStatus(assessment.status === "Scheduled" ? "DRAFT" : assessment.status)); return; }
      const response = await lmsApi.admin.createAssessment(assessment.courseId, { title: assessment.title, passPercentage: assessment.passingScore, attemptLimit: assessment.attempts });
      const assessmentId = extractId(response);
      if (assessmentId && assessment.status === "Published") await lmsApi.admin.setAssessmentStatus(assessmentId, "PUBLISHED");
    }, assessment.id ? "Assessment status updated." : "Assessment created.");
    return assessment.id ?? "pending";
  }, [run]);
  const duplicateAssessment = useCallback((assessmentId: string) => { const source = assessments.find((item) => item.id === assessmentId); if (source) saveAssessment({ ...source, id: undefined, title: `${source.title} copy`, status: "Draft" }); }, [assessments, saveAssessment]);
  const archiveAssessment = useCallback((assessmentId: string) => void run(() => lmsApi.admin.setAssessmentStatus(assessmentId, "ARCHIVED"), "Assessment archived."), [run]);
  const decideSubmission = useCallback((id: string, status: SubmissionStatus, feedback: string) => { void run(() => lmsApi.facilitator.reviewSubmission(id, { decision: status === "approved" ? "APPROVED" : "REVISION_REQUESTED", feedback }), "Review saved."); }, [run]);
  const addSubmission = useCallback(async (submission: SubmissionDraftInput) => {
    return run(async () => {
      let submissionId = submission.submissionId ?? "";
      const payload = { title: submission.title, description: submission.description };
      if (submissionId) {
        await lmsApi.student.updateSubmission(submissionId, payload);
      } else {
        const response = await lmsApi.student.createSubmission(submission.courseId, {
          ...payload,
          projectId: submission.projectId || undefined,
          lessonId: submission.lessonId || undefined,
        });
        submissionId = extractId(response);
      }
      if (!submissionId) throw new Error("The API did not return the submission ID.");
      if (submission.file) await lmsApi.student.uploadSubmissionFile(submissionId, submission.file);
      await lmsApi.student.submitSubmission(submissionId);
    }, "Submission sent for review.");
  }, [run]);
  const attachRecording = useCallback(async (index: number, recordingUrl: string, recordingDurationSeconds?: number) => {
    const session = sessions[index];
    const url = externalHttpUrl(recordingUrl);
    if (!session?.id) { toast("This class does not have a live-class ID yet."); return false; }
    if (!url) { toast("Enter a valid http or https recording URL."); return false; }
    try {
      await lmsApi.admin.updateRecording(session.id, {
        recordingUrl: url,
        ...(recordingDurationSeconds && recordingDurationSeconds > 0 ? { recordingDurationSeconds } : {}),
      });
      const applyRecording = (value: unknown) => extractId(value) === session.id
        ? {
            ...asRecord(value),
            recordingUrl: url,
            ...(recordingDurationSeconds && recordingDurationSeconds > 0 ? { recordingDurationSeconds } : {}),
          }
        : value;
      queryClient.setQueryData<WorkspacePayload>(["workspace", role], (current) => current ? {
        ...current,
        sessions: current.sessions.map(applyRecording),
        liveClasses: current.liveClasses.map((item) => ({ ...item, value: applyRecording(item.value) })),
      } : current);
      toast(session.ok ? "Recording link updated." : "Recording link attached.");
      return true;
    } catch (error) {
      toast(errorMessage(error));
      return false;
    }
  }, [queryClient, role, sessions, toast]);
  const unavailableRecording = useCallback(() => toast("Paste a recording URL to attach the class recording."), [toast]);

  const value = useMemo<WorkspaceContextValue>(() => ({
    // Account lists are page-local data. Their failure should not blank the
    // entire workspace (the People page renders its own loading/error state).
    isLoading: workspaceQuery.isPending,
    isError: workspaceQuery.isError,
    refreshWorkspace: () => { void refresh(); },
    announcements, announcementPanelOpen, openAnnouncementPanel: () => setAnnouncementPanelOpen(true), closeAnnouncementPanel: () => setAnnouncementPanelOpen(false), toggleAnnouncementPanel: () => setAnnouncementPanelOpen((open) => !open), markAnnouncementRead, markAllAnnouncementsRead,
    sessions: sessions as Session[], attachRecording, dropRecording: unavailableRecording,
    submissions, decideSubmission, createdCourses: [], addCreatedCourse: () => undefined,
    courses, saveCourseDetails, saveCourseCurriculum, saveCourseFacilitators, setCourseStatus, duplicateCourse, archiveCourse, facilitators, saveFacilitator, students, saveStudent, cohorts, saveCohort, duplicateCohort, archiveCohort,
    liveClasses, saveLiveClass, startLiveClass, duplicateLiveClass, cancelLiveClass, assessments, saveAssessment, duplicateAssessment, archiveAssessment, addSubmission,
  }), [workspaceQuery.isPending, workspaceQuery.isError, refresh, announcements, announcementPanelOpen, markAnnouncementRead, markAllAnnouncementsRead, sessions, attachRecording, unavailableRecording, submissions, decideSubmission, courses, saveCourseDetails, saveCourseCurriculum, saveCourseFacilitators, setCourseStatus, duplicateCourse, archiveCourse, facilitators, saveFacilitator, students, saveStudent, cohorts, saveCohort, duplicateCohort, archiveCohort, liveClasses, saveLiveClass, startLiveClass, duplicateLiveClass, cancelLiveClass, assessments, saveAssessment, duplicateAssessment, archiveAssessment, addSubmission]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
