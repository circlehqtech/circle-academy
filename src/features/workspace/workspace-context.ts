import { createContext } from "react";
import type {
  Announcement,
  Session,
  Submission,
  SubmissionStatus,
} from "../../types/lms";
import type {
  AssessmentRecord,
  CohortRecord,
  CourseInput,
  FacilitatorRecord,
  LiveClassRecord,
  ManagedCourse,
  StudentRecord,
} from "../../types/workspace";

export interface WorkspaceContextValue {
  announcements: Announcement[];
  announcementPanelOpen: boolean;
  openAnnouncementPanel: () => void;
  closeAnnouncementPanel: () => void;
  toggleAnnouncementPanel: () => void;
  markAllAnnouncementsRead: () => void;
  sessions: Session[];
  attachRecording: (index: number) => void;
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
  saveCourse: (course: CourseInput) => string;
  duplicateCourse: (courseId: string) => void;
  archiveCourse: (courseId: string) => void;
  facilitators: FacilitatorRecord[];
  saveFacilitator: (facilitator: Omit<FacilitatorRecord, "id" | "lastActive" | "status"> & { id?: string }) => string;
  students: StudentRecord[];
  saveStudent: (student: Omit<StudentRecord, "id" | "lastActive" | "learningStatus"> & { id?: string }) => string;
  cohorts: CohortRecord[];
  saveCohort: (cohort: Omit<CohortRecord, "id"> & { id?: string }) => string;
  duplicateCohort: (cohortId: string) => void;
  archiveCohort: (cohortId: string) => void;
  liveClasses: LiveClassRecord[];
  saveLiveClass: (liveClass: Omit<LiveClassRecord, "id"> & { id?: string }) => string;
  startLiveClass: (classId: string) => void;
  duplicateLiveClass: (classId: string) => void;
  cancelLiveClass: (classId: string) => void;
  assessments: AssessmentRecord[];
  saveAssessment: (assessment: Omit<AssessmentRecord, "id"> & { id?: string }) => string;
  duplicateAssessment: (assessmentId: string) => void;
  archiveAssessment: (assessmentId: string) => void;
  addSubmission: (submission: Submission) => void;
}

export const WorkspaceContext =
  createContext<WorkspaceContextValue | null>(null);
