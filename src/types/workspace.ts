export type CourseStatus = "Draft" | "Published" | "Archived";
export type CourseTone = "a1" | "a2" | "a3";

export type ResourceType = "Video" | "Audio" | "PDF" | "Text" | "Download" | "External link";

export interface ManagedResource {
  id: string;
  title: string;
  type: ResourceType;
  textContent?: string;
  url?: string;
  required: boolean;
  file?: File;
}

export interface ManagedLesson {
  id: string;
  title: string;
  type: "Video" | "Audio" | "Text" | "PDF" | "External link" | "Class recording";
  description?: string;
  durationMinutes?: number;
  resources?: ManagedResource[];
}

export interface ManagedModule {
  id: string;
  title: string;
  description?: string;
  lessons: ManagedLesson[];
}

export interface ManagedCourse {
  id: string;
  title: string;
  coverUrl?: string;
  code: string;
  status: CourseStatus;
  description: string;
  category: string;
  difficulty?: string;
  durationWeeks?: number;
  cohortId: string | null;
  facilitatorIds: string[];
  modules: ManagedModule[];
  assessments?: AssessmentRecord[];
  students: number;
  progress: number;
  tone: CourseTone;
  glyph: string;
  nextLesson: string;
}

export interface FacilitatorRecord {
  id: string;
  name: string;
  email: string;
  courseIds: string[];
  canGrade: boolean;
  status: "Invited" | "Active" | "Suspended";
  lastActive: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  cohortId: string;
  courseIds: string[];
  learningStatus: "On track" | "At risk" | "Behind" | "Revision due";
  lastActive: string;
  progress?: number;
  courseProgress?: Record<string, number>;
}

export interface CohortRecord {
  id: string;
  name: string;
  starts: string;
  ends: string;
  studentCount: number;
  studentCap: number | null;
  enrollmentOpensAt: string;
  enrollmentClosesAt: string;
  allowAdminEnrollmentAfterClose: boolean;
  courseIds: string[];
  facilitatorIds: string[];
  status: "Draft" | "Enrolling" | "Active" | "Completed" | "Archived";
}

export interface LiveClassRecord {
  id: string;
  title: string;
  courseId: string;
  date: string;
  time: string;
  duration: number;
  hostId: string;
  meetingUrl: string;
  recordingUrl?: string;
  timezone?: string;
  description?: string;
  status: "Draft" | "Scheduled" | "Ready" | "Live" | "Completed" | "Cancelled";
}

export interface AssessmentRecord {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  questions: number;
  passingScore: number;
  attempts: number;
  status: "Draft" | "Scheduled" | "Published" | "Archived";
}

export interface CourseInput {
  id?: string;
  title: string;
  coverUrl?: string;
  code: string;
  status: CourseStatus;
  description: string;
  category: string;
  difficulty?: string;
  durationWeeks?: number;
  cohortId: string | null;
  facilitatorIds: string[];
  modules: ManagedModule[];
}
