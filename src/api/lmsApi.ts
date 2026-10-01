import { apiClient } from "./client";
import { endpoints } from "./endpoints";

type Params = Record<string, string | number | boolean | undefined>;

export type UploadTag = "course-cover" | "course-resource" | "certificate-template" | "submission" | "profile-image";

export interface UploadResult {
  tag: UploadTag;
  url: string;
  publicId: string;
  resourceType: string;
  mimeType: string;
  sizeBytes: number;
}

async function uploadAsset(file: File, tag: UploadTag): Promise<UploadResult> {
  const data = new FormData();
  data.append("file", file);
  data.append("tag", tag);
  const response = await apiClient.post<UploadResult | { data: UploadResult }>(endpoints.uploads, data);
  const result = "data" in response ? response.data : response;
  if (!result.url) throw new Error("The upload completed without returning a file URL.");
  return result;
}

export const lmsApi = {
  uploads: { create: uploadAsset },
  health: () => apiClient.get<unknown>(endpoints.health),
  courses: {
    list: (params?: Params) =>
      apiClient.get<unknown>(endpoints.courses.list, params),
    detail: (courseId: string) =>
      apiClient.get<unknown>(endpoints.courses.detail(courseId)),
    recordProgress: (courseId: string, payload: unknown) =>
      apiClient.post<unknown>(endpoints.courses.progress(courseId), payload),
  },
  announcements: {
    feed: () => apiClient.get<unknown>(endpoints.announcements.feed),
    markRead: (announcementId: string) =>
      apiClient.patch<unknown>(endpoints.announcements.read(announcementId)),
    markAllRead: () => apiClient.post<unknown>(endpoints.announcements.readAll),
  },
  student: {
    dashboard: () => apiClient.get<unknown>(endpoints.student.dashboard),
    courses: (search?: string) =>
      apiClient.get<unknown>(
        endpoints.student.courses,
        search ? { search } : undefined,
      ),
    learning: (courseId: string) =>
      apiClient.get<unknown>(endpoints.student.learning(courseId)),
    assessment: (assessmentId: string) =>
      apiClient.get<unknown>(endpoints.student.assessment(assessmentId)),
    startAttempt: (assessmentId: string) =>
      apiClient.post<unknown>(endpoints.student.startAttempt(assessmentId)),
    submitAttempt: (attemptId: string, responses: unknown[]) =>
      apiClient.post<unknown>(endpoints.student.submitAttempt(attemptId), {
        responses,
      }),
    assessmentResults: () =>
      apiClient.get<unknown>(endpoints.student.assessmentResults),
    assessmentResult: (assessmentId: string) =>
      apiClient.get<unknown>(endpoints.student.assessmentResult(assessmentId)),
    attemptResult: (attemptId: string) =>
      apiClient.get<unknown>(endpoints.student.attemptResult(attemptId)),
    assignments: (courseId?: string) =>
      apiClient.get<unknown>(
        endpoints.student.assignments,
        courseId ? { courseId } : undefined,
      ),
    assignment: (submissionId: string) =>
      apiClient.get<unknown>(endpoints.student.assignment(submissionId)),
    submissions: (courseId?: string) =>
      apiClient.get<unknown>(
        endpoints.student.submissions,
        courseId ? { courseId } : undefined,
      ),
    courseSubmissions: (courseId: string) =>
      apiClient.get<unknown>(endpoints.student.courseSubmissions(courseId)),
    createSubmission: (courseId: string, payload: unknown) =>
      apiClient.post<unknown>(
        endpoints.student.courseSubmissions(courseId),
        payload,
      ),
    updateSubmission: (submissionId: string, payload: unknown) =>
      apiClient.patch<unknown>(
        endpoints.student.submission(submissionId),
        payload,
      ),
    uploadSubmissionFile: (submissionId: string, file: File) => {
      const data = new FormData();
      data.append("file", file);
      return apiClient.post<unknown>(endpoints.student.submissionFile(submissionId), data);
    },
    submitSubmission: (submissionId: string) =>
      apiClient.patch<unknown>(
        endpoints.student.submitSubmission(submissionId),
      ),
    liveClasses: () => apiClient.get<unknown>(endpoints.student.liveClasses),
    liveClass: (liveClassId: string) =>
      apiClient.get<unknown>(endpoints.student.liveClass(liveClassId)),
    certificates: () => apiClient.get<unknown>(endpoints.student.certificates),
    completion: (courseId: string) =>
      apiClient.get<unknown>(endpoints.student.completion(courseId)),
    certificate: (courseId: string) =>
      apiClient.get<unknown>(endpoints.student.certificate(courseId)),
    replays: () => apiClient.get<unknown>(endpoints.student.replays),
    startStudySession: (payload: unknown) =>
      apiClient.post<unknown>(endpoints.student.studySessions, payload),
    studySessions: (courseId?: string) =>
      apiClient.get<unknown>(
        endpoints.student.studySessions,
        courseId ? { courseId } : undefined,
      ),
    completeStudySession: (sessionId: string, payload: unknown) =>
      apiClient.patch<unknown>(
        endpoints.student.completeStudySession(sessionId),
        payload,
      ),
    studySummary: (courseId?: string) =>
      apiClient.get<unknown>(
        endpoints.student.studySummary,
        courseId ? { courseId } : undefined,
      ),
  },
  facilitator: {
    dashboard: () => apiClient.get<unknown>(endpoints.facilitator.dashboard),
    students: (courseId: string) =>
      apiClient.get<unknown>(endpoints.facilitator.students(courseId)),
    liveClasses: (courseId: string) =>
      apiClient.get<unknown>(endpoints.facilitator.liveClasses(courseId)),
    recordAttendance: (liveClassId: string, payload: unknown) =>
      apiClient.post<unknown>(
        endpoints.facilitator.attendance(liveClassId),
        payload,
      ),
    assessmentResults: (courseId: string) =>
      apiClient.get<unknown>(endpoints.facilitator.assessmentResults(courseId)),
    submissions: (courseId: string, status?: string) =>
      apiClient.get<unknown>(
        endpoints.facilitator.submissions(courseId),
        status ? { status } : undefined,
      ),
    reviewAttempt: (attemptId: string, payload: unknown) =>
      apiClient.patch<unknown>(
        endpoints.facilitator.reviewAttempt(attemptId),
        payload,
      ),
    reviewSubmission: (submissionId: string, payload: unknown) =>
      apiClient.patch<unknown>(
        endpoints.facilitator.reviewSubmission(submissionId),
        payload,
      ),
  },
  admin: {
    dashboard: () => apiClient.get<unknown>(endpoints.admin.dashboard),
    accounts: (params?: Params) =>
      apiClient.get<unknown>(endpoints.admin.accounts, params),
    createAccount: (payload: unknown) =>
      apiClient.post<unknown>(endpoints.admin.accounts, payload),
    setAccountStatus: (accountId: string, status: "ACTIVE" | "SUSPENDED") =>
      apiClient.patch<unknown>(endpoints.admin.accountStatus(accountId), { status }),
    deleteAccount: (accountId: string) =>
      apiClient.delete<unknown>(endpoints.admin.account(accountId)),
    pendingAccounts: () =>
      apiClient.get<unknown>(endpoints.admin.pendingAccounts),
    approveAccount: (accountId: string, role: string) =>
      apiClient.patch<unknown>(endpoints.admin.approveAccount(accountId), {
        role,
      }),
    rejectAccount: (accountId: string) =>
      apiClient.patch<unknown>(endpoints.admin.rejectAccount(accountId)),
    courses: (params?: Params) =>
      apiClient.get<unknown>(endpoints.admin.courses, params),
    createCourse: (payload: unknown) =>
      apiClient.post<unknown>(endpoints.admin.courses, payload),
    updateCourse: (courseId: string, payload: unknown) =>
      apiClient.patch<unknown>(endpoints.admin.course(courseId), payload),
    duplicateCourse: (courseId: string) =>
      apiClient.post<unknown>(endpoints.admin.duplicateCourse(courseId)),
    courseContent: (courseId: string) =>
      apiClient.get<unknown>(endpoints.admin.courseContent(courseId)),
    replaceCourseContent: (courseId: string, payload: unknown) =>
      apiClient.put<unknown>(endpoints.admin.courseContent(courseId), payload),
    setCourseStatus: (courseId: string, status: string) =>
      apiClient.patch<unknown>(endpoints.admin.courseStatus(courseId), {
        status,
      }),
    courseProgress: (courseId: string) =>
      apiClient.get<unknown>(endpoints.admin.courseProgress(courseId)),
    createModule: (courseId: string, payload: unknown) =>
      apiClient.post<unknown>(endpoints.admin.modules(courseId), payload),
    updateModule: (moduleId: string, payload: unknown) =>
      apiClient.patch<unknown>(endpoints.admin.module(moduleId), payload),
    deleteModule: (moduleId: string) =>
      apiClient.delete<unknown>(endpoints.admin.module(moduleId)),
    createLesson: (moduleId: string, payload: unknown) =>
      apiClient.post<unknown>(endpoints.admin.lessons(moduleId), payload),
    updateLesson: (lessonId: string, payload: unknown) =>
      apiClient.patch<unknown>(endpoints.admin.lesson(lessonId), payload),
    deleteLesson: (lessonId: string) =>
      apiClient.delete<unknown>(endpoints.admin.lesson(lessonId)),
    createResource: (lessonId: string, payload: unknown) =>
      apiClient.post<unknown>(endpoints.admin.resources(lessonId), payload),
    updateResource: (resourceId: string, payload: unknown) =>
      apiClient.patch<unknown>(endpoints.admin.resource(resourceId), payload),
    deleteResource: (resourceId: string) =>
      apiClient.delete<unknown>(endpoints.admin.resource(resourceId)),
    enrollStudent: (courseId: string, accountId: string) =>
      apiClient.post<unknown>(endpoints.admin.enrollments(courseId), {
        accountId,
      }),
    facilitators: (courseId: string) =>
      apiClient.get<unknown>(endpoints.admin.facilitators(courseId)),
    assignFacilitator: (courseId: string, accountId: string) =>
      apiClient.post<unknown>(endpoints.admin.facilitators(courseId), {
        accountId,
      }),
    replaceFacilitators: (courseId: string, accountIds: string[]) =>
      apiClient.put<unknown>(endpoints.admin.facilitators(courseId), {
        accountIds,
      }),
    removeFacilitator: (courseId: string, accountId: string) =>
      apiClient.delete<unknown>(
        endpoints.admin.facilitator(courseId, accountId),
      ),
    assessments: (courseId: string) =>
      apiClient.get<unknown>(endpoints.admin.assessments(courseId)),
    createAssessment: (courseId: string, payload: unknown) =>
      apiClient.post<unknown>(endpoints.admin.assessments(courseId), payload),
    assessment: (assessmentId: string) =>
      apiClient.get<unknown>(endpoints.admin.assessment(assessmentId)),
    updateAssessment: (assessmentId: string, payload: unknown) =>
      apiClient.patch<unknown>(endpoints.admin.assessment(assessmentId), payload),
    duplicateAssessment: (assessmentId: string) =>
      apiClient.post<unknown>(endpoints.admin.duplicateAssessment(assessmentId)),
    saveAssessmentContent: (assessmentId: string, questions: unknown[]) =>
      apiClient.put<unknown>(endpoints.admin.assessmentContent(assessmentId), { questions }),
    projects: (courseId: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") =>
      apiClient.get<unknown>(endpoints.admin.projects(courseId), { status }),
    createProject: (courseId: string, payload: unknown) =>
      apiClient.post<unknown>(endpoints.admin.projects(courseId), payload),
    updateProject: (projectId: string, payload: unknown) =>
      apiClient.patch<unknown>(endpoints.admin.project(projectId), payload),
    setProjectStatus: (projectId: string, status: string) =>
      apiClient.patch<unknown>(endpoints.admin.projectStatus(projectId), { status }),
    assessmentResults: (courseId: string) =>
      apiClient.get<unknown>(endpoints.admin.assessmentResults(courseId)),
    setAssessmentStatus: (assessmentId: string, status: string) =>
      apiClient.patch<unknown>(endpoints.admin.assessmentStatus(assessmentId), {
        status,
      }),
    createQuestion: (assessmentId: string, payload: unknown) =>
      apiClient.post<unknown>(endpoints.admin.questions(assessmentId), payload),
    createOption: (questionId: string, payload: unknown) =>
      apiClient.post<unknown>(endpoints.admin.options(questionId), payload),
    submissions: (courseId: string, status?: string) =>
      apiClient.get<unknown>(
        endpoints.admin.submissions(courseId),
        status ? { status } : undefined,
      ),
    student: (studentId: string) =>
      apiClient.get<unknown>(endpoints.admin.student(studentId)),
    studentCourses: (studentId: string, params?: Params) =>
      apiClient.get<unknown>(endpoints.admin.studentCourses(studentId), params),
    studentAssessments: (studentId: string, params?: Params) =>
      apiClient.get<unknown>(endpoints.admin.studentAssessments(studentId), params),
    studentSubmissions: (studentId: string, params?: Params) =>
      apiClient.get<unknown>(endpoints.admin.studentSubmissions(studentId), params),
    studentLiveClasses: (studentId: string, params?: Params) =>
      apiClient.get<unknown>(endpoints.admin.studentLiveClasses(studentId), params),
    studentCertificates: (studentId: string, params?: Params) =>
      apiClient.get<unknown>(endpoints.admin.studentCertificates(studentId), params),
    studentActivity: (studentId: string, params?: Params) =>
      apiClient.get<unknown>(endpoints.admin.studentActivity(studentId), params),
    cohorts: (courseId: string) =>
      apiClient.get<unknown>(endpoints.admin.cohorts(courseId)),
    createCohort: (courseId: string, payload: unknown) =>
      apiClient.post<unknown>(endpoints.admin.cohorts(courseId), payload),
    updateCohort: (cohortId: string, payload: unknown) =>
      apiClient.patch<unknown>(endpoints.admin.cohort(cohortId), payload),
    duplicateCohort: (cohortId: string) =>
      apiClient.post<unknown>(endpoints.admin.duplicateCohort(cohortId)),
    setCohortStatus: (cohortId: string, status: string) =>
      apiClient.patch<unknown>(endpoints.admin.cohortStatus(cohortId), {
        status,
      }),
    cohortStudents: (cohortId: string) =>
      apiClient.get<unknown>(endpoints.admin.cohortStudents(cohortId)),
    addCohortStudent: (cohortId: string, accountId: string) =>
      apiClient.post<unknown>(endpoints.admin.cohortStudents(cohortId), {
        accountId,
      }),
    removeCohortStudent: (cohortId: string, accountId: string) =>
      apiClient.delete<unknown>(
        endpoints.admin.cohortStudent(cohortId, accountId),
      ),
    replaceCohortFacilitators: (cohortId: string, accountIds: string[]) =>
      apiClient.put<unknown>(endpoints.admin.cohortFacilitators(cohortId), {
        accountIds,
      }),
    liveClasses: (courseId: string) =>
      apiClient.get<unknown>(endpoints.admin.liveClasses(courseId)),
    createLiveClass: (courseId: string, payload: unknown) =>
      apiClient.post<unknown>(endpoints.admin.liveClasses(courseId), payload),
    updateLiveClass: (liveClassId: string, payload: unknown) =>
      apiClient.patch<unknown>(endpoints.admin.liveClass(liveClassId), payload),
    setLiveClassStatus: (liveClassId: string, status: string) =>
      apiClient.patch<unknown>(endpoints.admin.liveClassStatus(liveClassId), {
        status,
      }),
    assignLiveClassFacilitator: (liveClassId: string, accountId: string) =>
      apiClient.put<unknown>(
        endpoints.admin.liveClassFacilitator(liveClassId),
        { accountId },
      ),
    updateRecording: (liveClassId: string, payload: unknown) =>
      apiClient.patch<unknown>(
        endpoints.admin.liveClassRecording(liveClassId),
        payload,
      ),
    attendance: (liveClassId: string) =>
      apiClient.get<unknown>(endpoints.admin.liveClassAttendance(liveClassId)),
    createCompletionRequirement: (courseId: string, payload: unknown) =>
      apiClient.post<unknown>(
        endpoints.admin.completionRequirements(courseId),
        payload,
      ),
    completionRequirements: (courseId: string) =>
      apiClient.get<unknown>(endpoints.admin.completionRequirements(courseId)),
    certificateTemplate: (courseId: string) =>
      apiClient.get<unknown>(endpoints.admin.certificateTemplate(courseId)),
    upsertCertificateTemplate: (courseId: string, payload: unknown) =>
      apiClient.post<unknown>(
        endpoints.admin.certificateTemplate(courseId),
        payload,
      ),
    certificates: (courseId: string) =>
      apiClient.get<unknown>(endpoints.admin.certificates(courseId)),
    issueCertificate: (courseId: string, accountId: string) =>
      apiClient.post<unknown>(
        endpoints.admin.issueCertificate(courseId, accountId),
      ),
    revokeCertificate: (certificateId: string) =>
      apiClient.patch<unknown>(
        endpoints.admin.revokeCertificate(certificateId),
      ),
    announcements: (params?: Params) =>
      apiClient.get<unknown>(endpoints.admin.announcements, params),
    createAnnouncement: (payload: unknown) =>
      apiClient.post<unknown>(endpoints.admin.announcements, payload),
    setAnnouncementStatus: (announcementId: string, status: string) =>
      apiClient.patch<unknown>(
        endpoints.admin.announcementStatus(announcementId),
        { status },
      ),
  },
  verifyCertificate: (certificateNumber: string) =>
    apiClient.get<unknown>(
      endpoints.certificateVerification(certificateNumber),
    ),
};
