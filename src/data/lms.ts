import type {
  Announcement,
  AssignedCourse,
  ClassActivity,
  Course,
  CourseModule,
  Note,
  QuizQuestion,
  Replay,
  Role,
  RosterStudent,
  Session,
  Submission,
  ViewId } from
'../types/lms';

export const COURSES: Course[] = [
{
  id: 'react',
  name: 'Advanced React Patterns',
  p: 68,
  next: 'Compound components',
  lessons: 18,
  art: 'a1',
  g: 'Re'
},
{
  id: 'ts',
  name: 'TypeScript for Product Teams',
  p: 42,
  next: 'Generics in practice',
  lessons: 22,
  art: 'a2',
  g: 'Ts'
},
{
  id: 'ds',
  name: 'Design Systems with Tailwind',
  p: 100,
  next: 'Completed',
  lessons: 14,
  art: 'a3',
  g: 'Ds'
}];


export const REPLAYS: Replay[] = [
{ id: 'w5', title: 'Week 5: Hooks vs render props', dur: 3492, seen: 0.74, date: 'Mon 14 Sep' },
{ id: 'w4', title: 'Week 4: Context without the re-renders', dur: 3880, seen: 1, date: 'Mon 7 Sep' },
{ id: 'w3', title: 'Week 3: State machines in UI', dur: 3125, seen: 0.2, date: 'Mon 31 Aug' }];


export const ANNOUNCEMENTS: Announcement[] = [
{ t: "Thursday's TypeScript class moves to 5:00 pm", m: 'Today', unread: true },
{ t: 'Mid-course exam opens Friday at 9:00 am. 60 minutes, one attempt.', m: 'Yesterday', unread: true },
{ t: 'Week 5 replays are now available.', m: 'Mon 14 Sep', unread: false }];


export const TITLES: Record<ViewId, string> = {
  home: 'Welcome back, Ngozi',
  courses: 'My courses',
  course: 'Advanced React Patterns',
  live: 'Live classes and replays',
  study: 'Study session',
  assignments: 'Assignments and projects',
  certs: 'Certificates',
  profile: 'Profile and settings',
  teaching: 'Your courses and students',
  review: 'Review queue',
  facilitatorStudents: 'Students',
  results: 'Assessment results',
  facilitatorClasses: 'Classes and activities',
  overview: 'Cohort overview',
  adminCourses: 'Courses',
  courseBuilder: 'Create a course',
  people: 'Students and facilitators',
  cohorts: 'Cohorts',
  content: 'Content library',
  adminClasses: 'Live classes',
  assessments: 'Assessments and checkpoints',
  projects: 'Assignments and projects',
  adminCerts: 'Certificate management',
  recs: 'Recordings'
};

export const MODULES: CourseModule[] = [
{
  title: 'Foundations',
  meta: '4 of 4 lessons',
  state: 'ok',
  lessons: [
  { label: 'Rendering model' },
  { label: 'Hooks refresher' },
  { label: 'Effects without surprises' },
  { label: 'Module quiz' }]

},
{
  title: 'State patterns',
  meta: '5 of 5 lessons',
  state: 'ok',
  lessons: [
  { label: 'Reducers' },
  { label: 'State machines in UI' },
  { label: 'Context without re-renders' }]

},
{
  title: 'Composition',
  meta: '2 of 5 lessons',
  state: 'now',
  open: true,
  lessons: [
  { label: 'Hooks vs render props' },
  { label: 'Compound components', current: true },
  { label: 'Slots and polymorphic props' },
  { label: 'Headless UI' }]

},
{
  title: 'Performance',
  meta: 'Unlocks after Composition',
  state: 'lock',
  lessons: []
}];


export const QUIZ: QuizQuestion[] = [
{
  q: 'Which pattern lets a parent share implicit state with its children without prop drilling?',
  o: ['Compound components', 'Global CSS variables', 'Uncontrolled inputs', 'Server components'],
  a: 0,
  why: 'Compound components share state through context, so children stay flexible.'
},
{
  q: 'What does useReducer return?',
  o: ['[state, setState]', '[state, dispatch]', 'A memoized callback', 'A ref object'],
  a: 1,
  why: 'It returns the current state and a dispatch function.'
},
{
  q: 'Why memoize a context provider value?',
  o: [
  'To skip re-rendering consumers when nothing changed',
  'To make the value immutable',
  'To send it to the server',
  'To avoid using hooks'],

  a: 0,
  why: 'A new object on every render makes every consumer re-render.'
}];


export const INITIAL_NOTES: Note[] = [
{ t: 612, text: 'Children read shared state through context, not props.' },
{ t: 1804, text: 'Static properties like Tabs.Panel make the API feel like one unit.' }];


export const WEEKS: number[] = [72, 78, 81, 76, 84, 88, 83, 86];

export const NEEDS_NUDGE: {name: string;note: string;}[] = [
{ name: 'Chidera Nwosu', note: 'Missed 3 live classes' },
{ name: 'Femi Balogun', note: 'No quiz attempts yet' },
{ name: 'Amina Yusuf', note: 'Inactive for 12 days' }];


export const SESSIONS: Session[] = [
{ t: 'Week 5: Hooks vs render props', d: 'Mon 14 Sep', ok: true },
{ t: 'Week 4: Context without the re-renders', d: 'Mon 7 Sep', ok: true },
{ t: 'TypeScript: Utility types', d: 'Thu 17 Sep', ok: false },
{ t: 'Week 3: State machines in UI', d: 'Mon 31 Aug', ok: false }];


export const PEOPLE: Record<Role, {initials: string;name: string;sub: string;}> = {
  student: { initials: 'NE', name: 'Ngozi Eze', sub: 'Frontend, cohort 7' },
  facilitator: { initials: 'KA', name: 'Kemi Adeyemi', sub: 'Facilitator, cohort 7' },
  admin: { initials: 'AO', name: 'Dr. Amaka Obi', sub: 'Instructor and admin' }
};

export const ASSIGNED_COURSES: AssignedCourse[] = [
{
  id: 'react',
  name: 'Advanced React Patterns',
  cohort: 'Cohort 7',
  students: 24,
  p: 68,
  art: 'a1',
  g: 'Re'
},
{
  id: 'ts',
  name: 'TypeScript for Product Teams',
  cohort: 'Cohort 7',
  students: 19,
  p: 42,
  art: 'a2',
  g: 'Ts'
}];


export const ROSTER: RosterStudent[] = [
{
  name: 'Ngozi Eze',
  initials: 'NE',
  course: 'Advanced React Patterns',
  p: 68,
  status: 'on track',
  detail: 'Quiz 6 passed, 84%'
},
{
  name: 'Chidera Nwosu',
  initials: 'CN',
  course: 'Advanced React Patterns',
  p: 31,
  status: 'at risk',
  detail: 'Missed 3 live classes'
},
{
  name: 'Femi Balogun',
  initials: 'FB',
  course: 'TypeScript for Product Teams',
  p: 46,
  status: 'behind',
  detail: 'No quiz attempts yet'
},
{
  name: 'Amina Yusuf',
  initials: 'AY',
  course: 'Advanced React Patterns',
  p: 52,
  status: 'behind',
  detail: 'Assignment 4 waiting on revision'
},
{
  name: 'Tunde Bakare',
  initials: 'TB',
  course: 'TypeScript for Product Teams',
  p: 77,
  status: 'on track',
  detail: 'Final project submitted'
},
{
  name: 'Zainab Idris',
  initials: 'ZI',
  course: 'Advanced React Patterns',
  p: 91,
  status: 'on track',
  detail: 'Ready for final project'
}];


export const SUBMISSIONS: Submission[] = [
{
  id: 's1',
  student: 'Zainab Idris',
  initials: 'ZI',
  course: 'Advanced React Patterns',
  title: 'Final project: Headless data table',
  kind: 'Final project',
  submitted: 'Today, 9:12 am',
  attempt: 1,
  format: 'Project link',
  body: 'github.com/zainabidris/hq-headless-table — a compound-component table with sorting, selection and a keyboard-navigable header. README covers the API decisions and the trade-offs behind the context split.',
  status: 'pending'
},
{
  id: 's2',
  student: 'Ngozi Eze',
  initials: 'NE',
  course: 'Advanced React Patterns',
  title: 'Assignment 6: Compound component API',
  kind: 'Assignment',
  submitted: 'Today, 8:04 am',
  attempt: 1,
  format: 'Written response',
  body: 'I exposed Tabs, Tabs.List, Tabs.Tab and Tabs.Panel and kept the active id in context so consumers can reorder or wrap children freely. The provider value is memoised so panels do not re-render when an unrelated sibling updates.',
  status: 'pending'
},
{
  id: 's3',
  student: 'Amina Yusuf',
  initials: 'AY',
  course: 'Advanced React Patterns',
  title: 'Assignment 4: Reducer refactor',
  kind: 'Assignment',
  submitted: 'Yesterday, 6:40 pm',
  attempt: 2,
  format: 'File, refactor.zip',
  body: 'Second attempt. The reducer now handles every transition in one switch and the impossible loading-and-error state is gone.',
  status: 'pending'
},
{
  id: 's4',
  student: 'Femi Balogun',
  initials: 'FB',
  course: 'TypeScript for Product Teams',
  title: 'Assignment 3: Narrowing in practice',
  kind: 'Assignment',
  submitted: 'Mon 14 Sep',
  attempt: 1,
  format: 'Written response',
  body: 'Used discriminated unions for the request state and a type predicate to narrow the API response before it reaches the view layer.',
  status: 'approved',
  feedback: 'Clear write-up. The type predicate is exactly the right call here.'
},
{
  id: 's5',
  student: 'Tunde Bakare',
  initials: 'TB',
  course: 'TypeScript for Product Teams',
  title: 'Final project: Design token pipeline',
  kind: 'Final project',
  submitted: 'Sun 13 Sep',
  attempt: 1,
  format: 'Project link',
  body: 'A token pipeline that emits CSS variables and typed constants from one source file.',
  status: 'revision',
  feedback: 'Strong idea. Add tests around the emitter before I can approve it.'
}];


export const CLASS_ACTIVITIES: ClassActivity[] = [
{
  title: 'Compound components',
  when: 'Today, 4:00 pm, 90 minutes',
  state: 'today',
  action: 'Start class',
  toast: 'Opening Zoom as host. This is a preview.'
},
{
  title: 'TypeScript: Generics in practice',
  when: 'Thursday, 5:00 pm',
  state: 'upcoming',
  action: 'Edit agenda',
  toast: 'Agenda opened for editing.'
},
{
  title: 'Week 5: Hooks vs render props',
  when: 'Mon 14 Sep, recording attached',
  state: 'past',
  action: 'Post summary',
  toast: 'Class summary posted to the cohort.'
}];
