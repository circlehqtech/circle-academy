import type { NavItem, Role } from "../types/lms";

export const ROLE_HOME: Record<Role, string> = {
  student: "/student/home",
  facilitator: "/facilitator/teaching",
  admin: "/admin/overview",
};

export const ROLE_NAVIGATION: Record<Role, NavItem[]> = {
  student: [
    { id: "home", label: "Home", icon: "home", path: "/student/home" },
    {
      id: "courses",
      label: "Courses",
      icon: "book",
      path: "/student/courses",
    },
    {
      id: "live",
      label: "Live & Replays",
      icon: "video",
      path: "/student/live",
    },
    {
      id: "assignments",
      label: "Assignments",
      icon: "inbox",
      path: "/student/assignments",
    },
    { id: "study", label: "Study", icon: "pen", path: "/student/study" },
    {
      id: "certs",
      label: "Certificates",
      icon: "award",
      path: "/student/certificates",
    },
  ],
  facilitator: [
    {
      id: "teaching",
      label: "Teaching",
      icon: "users",
      path: "/facilitator/teaching",
    },
    {
      id: "review",
      label: "Review queue",
      icon: "inbox",
      path: "/facilitator/reviews",
    },
    {
      id: "facilitatorStudents",
      label: "Students",
      icon: "users",
      path: "/facilitator/students",
    },
    {
      id: "results",
      label: "Results",
      icon: "chart",
      path: "/facilitator/results",
    },
    {
      id: "facilitatorClasses",
      label: "Classes",
      icon: "video",
      path: "/facilitator/classes",
    },
  ],
  admin: [
    {
      id: "overview",
      label: "Overview",
      icon: "chart",
      path: "/admin/overview",
    },
    {
      id: "adminCourses",
      label: "Courses",
      icon: "book",
      path: "/admin/courses",
    },
    { id: "people", label: "People", icon: "users", path: "/admin/people" },
    {
      id: "cohorts",
      label: "Cohorts",
      icon: "users",
      path: "/admin/cohorts",
    },
    {
      id: "content",
      label: "Content",
      icon: "upload",
      path: "/admin/content",
    },
    {
      id: "adminClasses",
      label: "Classes",
      icon: "video",
      path: "/admin/classes",
    },
    {
      id: "assessments",
      label: "Assessments",
      icon: "pen",
      path: "/admin/assessments",
    },
    {
      id: "projects",
      label: "Projects",
      icon: "inbox",
      path: "/admin/projects",
    },
    {
      id: "adminCerts",
      label: "Certificates",
      icon: "award",
      path: "/admin/certificates",
    },
    {
      id: "recs",
      label: "Recordings",
      icon: "upload",
      path: "/admin/recordings",
    },
  ],
};
