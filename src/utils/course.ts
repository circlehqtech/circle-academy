import type { AssignedCourse, Course } from "../types/lms";
import type { ManagedCourse } from "../types/workspace";

export function toStudentCourse(course: ManagedCourse): Course {
  return {
    id: course.id,
    name: course.title,
    p: course.progress,
    next: course.progress === 100 ? "Completed" : course.nextLesson,
    lessons: course.modules.reduce((total, module) => total + module.lessons.length, 0),
    art: course.tone,
    g: course.glyph,
  };
}

export function toAssignedCourse(course: ManagedCourse): AssignedCourse {
  return {
    id: course.id,
    name: course.title,
    cohort: course.cohortId ? "Assigned cohort" : "Self-paced",
    students: course.students,
    p: course.progress,
    art: course.tone,
    g: course.glyph,
  };
}
