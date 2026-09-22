export type Role = 'student' | 'facilitator' | 'admin';

export type ViewId =
'home' |
'courses' |
'course' |
'live' |
'study' |
'assignments' |
'certs' |
'profile' |
'teaching' |
'review' |
'facilitatorStudents' |
'results' |
'facilitatorClasses' |
'overview' |
'adminCourses' |
'courseBuilder' |
'people' |
'cohorts' |
'content' |
'adminClasses' |
'assessments' |
'projects' |
'adminCerts' |
'recs';

export interface Course {
  id: string;
  name: string;
  p: number;
  next: string;
  lessons: number;
  art: 'a1' | 'a2' | 'a3';
  g: string;
}

export interface Replay {
  id: string;
  title: string;
  dur: number;
  seen: number;
  date: string;
}

export interface Announcement {
  t: string;
  m: string;
  unread: boolean;
}

export interface ModuleLesson {
  label: string;
  current?: boolean;
}

export interface CourseModule {
  title: string;
  meta: string;
  state: 'ok' | 'now' | 'lock';
  open?: boolean;
  lessons: ModuleLesson[];
}

export interface QuizQuestion {
  q: string;
  o: string[];
  a: number;
  why: string;
}

export interface Note {
  t: number;
  text: string;
}

export interface Session {
  t: string;
  d: string;
  ok: boolean;
  uploading?: boolean;
}

export interface NavItem {
  id: ViewId;
  label: string;
  icon: 'home' | 'book' | 'video' | 'pen' | 'award' | 'chart' | 'upload' | 'users' | 'inbox';
}

export interface AssignedCourse {
  id: string;
  name: string;
  cohort: string;
  students: number;
  p: number;
  art: 'a1' | 'a2' | 'a3';
  g: string;
}

export interface RosterStudent {
  name: string;
  initials: string;
  course: string;
  p: number;
  status: 'on track' | 'behind' | 'at risk';
  detail: string;
}

export type SubmissionStatus = 'pending' | 'approved' | 'revision';

export interface Submission {
  id: string;
  student: string;
  initials: string;
  course: string;
  title: string;
  kind: 'Assignment' | 'Final project';
  submitted: string;
  attempt: number;
  format: string;
  body: string;
  status: SubmissionStatus;
  feedback?: string;
}

export interface ClassActivity {
  title: string;
  when: string;
  state: 'today' | 'upcoming' | 'past';
  action: string;
  toast: string;
}
