import type {
  AssessmentRecord,
  CohortRecord,
  FacilitatorRecord,
  LiveClassRecord,
  ManagedCourse,
  StudentRecord,
} from "../types/workspace";

export const INITIAL_COURSES: ManagedCourse[] = [
  {
    id: "react",
    title: "Advanced React Patterns",
    code: "ARP-07",
    status: "Published",
    description: "Build flexible, accessible React systems for production teams.",
    category: "Engineering",
    cohortId: "cohort-7",
    facilitatorIds: ["fac-kemi"],
    modules: [
      {
        id: "react-foundations",
        title: "Foundations",
        lessons: [
          { id: "rendering", title: "Rendering model", type: "Video" },
          { id: "hooks", title: "Hooks refresher", type: "Video" },
        ],
      },
      {
        id: "react-composition",
        title: "Composition",
        lessons: [
          { id: "render-props", title: "Hooks vs render props", type: "Class recording" },
          { id: "compound", title: "Compound components", type: "Video" },
        ],
      },
    ],
    students: 24,
    progress: 68,
    tone: "a1",
    glyph: "Re",
    nextLesson: "Compound components",
  },
  {
    id: "ts",
    title: "TypeScript for Product Teams",
    code: "TSP-07",
    status: "Published",
    description: "Use TypeScript to model product states and safer APIs.",
    category: "Engineering",
    cohortId: "cohort-7",
    facilitatorIds: ["fac-kemi", "fac-amaka"],
    modules: [
      {
        id: "ts-types",
        title: "Product-safe types",
        lessons: [
          { id: "unions", title: "Discriminated unions", type: "Video" },
          { id: "generics", title: "Generics in practice", type: "Video" },
        ],
      },
    ],
    students: 19,
    progress: 42,
    tone: "a2",
    glyph: "Ts",
    nextLesson: "Generics in practice",
  },
  {
    id: "ds",
    title: "Design Systems with Tailwind",
    code: "DST-06",
    status: "Archived",
    description: "Create durable design systems with tokens and utilities.",
    category: "Design",
    cohortId: "cohort-6",
    facilitatorIds: ["fac-amaka"],
    modules: [
      {
        id: "ds-tokens",
        title: "Design tokens",
        lessons: [{ id: "token-pipeline", title: "Token pipeline", type: "Video" }],
      },
    ],
    students: 31,
    progress: 100,
    tone: "a3",
    glyph: "Ds",
    nextLesson: "Completed",
  },
  {
    id: "product-discovery",
    title: "Product Discovery Sprint",
    code: "PDS-D1",
    status: "Draft",
    description: "Plan and validate a focused discovery sprint.",
    category: "Product",
    cohortId: null,
    facilitatorIds: [],
    modules: [
      {
        id: "discovery-foundations",
        title: "Discovery foundations",
        lessons: [{ id: "problem-frame", title: "Frame the problem", type: "Text" }],
      },
    ],
    students: 0,
    progress: 0,
    tone: "a2",
    glyph: "Pd",
    nextLesson: "Frame the problem",
  },
];

export const INITIAL_FACILITATORS: FacilitatorRecord[] = [
  { id: "fac-kemi", name: "Kemi Adeyemi", email: "kemi@circlehq.co", courseIds: ["react", "ts"], canGrade: true, status: "Active", lastActive: "Today" },
  { id: "fac-amaka", name: "Dr. Amaka Obi", email: "amaka@circlehq.co", courseIds: ["ts", "ds"], canGrade: true, status: "Active", lastActive: "Today" },
  { id: "fac-ife", name: "Ife Okoro", email: "ife@circlehq.co", courseIds: [], canGrade: true, status: "Active", lastActive: "Yesterday" },
];

export const INITIAL_STUDENTS: StudentRecord[] = [
  { id: "student-ngozi", name: "Ngozi Eze", email: "ngozi@circlehq.co", cohortId: "cohort-7", courseIds: ["react", "ts", "ds"], learningStatus: "On track", lastActive: "Today" },
  { id: "student-chidera", name: "Chidera Nwosu", email: "chidera@circlehq.co", cohortId: "cohort-7", courseIds: ["react"], learningStatus: "At risk", lastActive: "3 days ago" },
  { id: "student-femi", name: "Femi Balogun", email: "femi@circlehq.co", cohortId: "cohort-7", courseIds: ["ts"], learningStatus: "Behind", lastActive: "Yesterday" },
  { id: "student-amina", name: "Amina Yusuf", email: "amina@circlehq.co", cohortId: "cohort-7", courseIds: ["react", "ts"], learningStatus: "Revision due", lastActive: "Today" },
  { id: "student-tunde", name: "Tunde Bakare", email: "tunde@circlehq.co", cohortId: "cohort-7", courseIds: ["ts"], learningStatus: "On track", lastActive: "Today" },
];

export const INITIAL_COHORTS: CohortRecord[] = [
  { id: "cohort-7", name: "Cohort 7", starts: "2026-09-01", ends: "2026-10-16", studentCount: 43, courseIds: ["react", "ts"], facilitatorIds: ["fac-kemi", "fac-amaka"], status: "Active" },
  { id: "cohort-8", name: "Cohort 8", starts: "2026-10-05", ends: "2026-11-20", studentCount: 18, courseIds: ["react", "ts", "product-discovery"], facilitatorIds: ["fac-kemi"], status: "Enrolling" },
  { id: "cohort-6", name: "Cohort 6", starts: "2026-07-06", ends: "2026-08-21", studentCount: 31, courseIds: ["ds"], facilitatorIds: ["fac-amaka"], status: "Completed" },
];

export const INITIAL_CLASSES: LiveClassRecord[] = [
  { id: "class-compound", title: "Compound components", courseId: "react", date: "2026-09-22", time: "16:00", duration: 90, hostId: "fac-kemi", meetingUrl: "https://zoom.us/j/123456789", status: "Ready" },
  { id: "class-generics", title: "Generics in practice", courseId: "ts", date: "2026-09-24", time: "17:00", duration: 90, hostId: "fac-amaka", meetingUrl: "https://zoom.us/j/987654321", status: "Scheduled" },
  { id: "class-performance", title: "Performance patterns", courseId: "react", date: "2026-09-28", time: "16:00", duration: 60, hostId: "fac-kemi", meetingUrl: "", status: "Draft" },
];

export const INITIAL_ASSESSMENTS: AssessmentRecord[] = [
  { id: "assessment-quiz-6", title: "Quiz 6: Composition", courseId: "react", questions: 10, passingScore: 80, attempts: 3, status: "Published" },
  { id: "assessment-mid-course", title: "Mid-course exam", courseId: "react", questions: 30, passingScore: 70, attempts: 1, status: "Scheduled" },
  { id: "assessment-generics", title: "Generics checkpoint", courseId: "ts", questions: 12, passingScore: 75, attempts: 3, status: "Draft" },
];
