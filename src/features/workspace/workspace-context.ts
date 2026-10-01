import { createContext } from "react";
import type {
  Announcement,
  Session,
  Submission,
  SubmissionDraftInput,
  SubmissionStatus,
} from "../../types/lms";
import type {
  AssessmentRecord,
  CohortRecord,
  CourseInput,
  FacilitatorRecord,
  LiveClassRecord,
  ManagedCourse,
  ManagedModule,
  StudentRecord,
} from "../../types/workspace";

export interface WorkspaceContextValue {
  isLoading: boolean;
  isError: boolean;
  refreshWorkspace: () => void;
  announcements: Announcement[];
  announcementPanelOpen: boolean;
  openAnnouncementPanel: () => void;
  closeAnnouncementPanel: () => void;
  toggleAnnouncementPanel: () => void;
  markAnnouncementRead: (announcementId: string) => void;
  markAllAnnouncementsRead: () => void;
  sessions: Session[];
  attachRecording: (
    index: number,
    recordingUrl: string,
    recordingDurationSeconds?: number,
  ) => Promise<boolean>;
  dropRecording: () => void;
  submissions: Submission[];
  decideSubmission: (
    id: string,
    status: SubmissionStatus,
    feedback: string,
  ) => void;
  createdCourses: string[];
  addCreatedCourse: (title: string) => void;
  courses: ManagedCourse[];
  saveCourseDetails: (course: CourseInput) => Promise<string>;
  saveCourseCurriculum: (courseId: string, modules: ManagedModule[], previousModules: ManagedModule[], course: CourseInput) => Promise<{ courseId: string; modules: ManagedModule[] } | null>;
  saveCourseFacilitators: (courseId: string, facilitatorIds: string[]) => Promise<boolean>;
  setCourseStatus: (courseId: string, status: CourseInput["status"]) => Promise<boolean>;
  duplicateCourse: (courseId: string) => void;
  archiveCourse: (courseId: string) => void;
  facilitators: FacilitatorRecord[];
  saveFacilitator: (facilitator: Omit<FacilitatorRecord, "id" | "lastActive" | "status"> & { id?: string }) => Promise<boolean>;
  students: StudentRecord[];
  saveStudent: (student: Omit<StudentRecord, "id" | "lastActive" | "learningStatus"> & { id?: string }) => Promise<boolean>;
  cohorts: CohortRecord[];
  saveCohort: (cohort: Omit<CohortRecord, "id"> & { id?: string }) => Promise<string | null>;
  duplicateCohort: (cohortId: string) => void;
  archiveCohort: (cohortId: string) => void;
  liveClasses: LiveClassRecord[];
  saveLiveClass: (liveClass: Omit<LiveClassRecord, "id"> & { id?: string }) => Promise<boolean>;
  startLiveClass: (classId: string) => void;
  duplicateLiveClass: (classId: string) => void;
  cancelLiveClass: (classId: string) => void;
  assessments: AssessmentRecord[];
  saveAssessment: (assessment: Omit<AssessmentRecord, "id"> & { id?: string }) => string;
  duplicateAssessment: (assessmentId: string) => void;
  archiveAssessment: (assessmentId: string) => void;
  addSubmission: (submission: SubmissionDraftInput) => Promise<boolean>;
}

export const WorkspaceContext =
  createContext<WorkspaceContextValue | null>(null);
