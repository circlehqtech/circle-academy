import { useNavigate, useParams } from "react-router-dom";
import { AdminOverview } from "../pages/AdminOverview";
import { AdminCourses, CourseBuilder } from "../pages/AdminCourses";
import { AdminPeople } from "../pages/AdminPeople";
import { AdminOperations } from "../pages/AdminOperations";
import { AdminRecordings } from "../pages/AdminRecordings";
import { CohortsPage } from "../pages/admin/CohortsPage";
import { ClassesPage } from "../pages/admin/ClassesPage";
import { AssessmentsPage } from "../pages/admin/AssessmentsPage";
import { useWorkspace } from "../features/workspace/useWorkspace";

export function AdminOverviewRoute() {
  const { sessions } = useWorkspace();
  return (
    <AdminOverview
      missingRecordings={sessions.filter((session) => !session.ok).length}
    />
  );
}

export function AdminCoursesRoute() {
  const navigate = useNavigate();
  const { courses, duplicateCourse, archiveCourse } = useWorkspace();

  return (
    <AdminCourses
      courses={courses}
      onCreate={() => navigate("/admin/courses/new")}
      onEdit={(courseId) => navigate(`/admin/courses/${courseId}/edit`)}
      onDuplicate={duplicateCourse}
      onArchive={archiveCourse}
    />
  );
}

export function CourseBuilderRoute() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { courses, facilitators, cohorts, saveCourse } = useWorkspace();
  const initialCourse = courses.find((course) => course.id === courseId);

  return (
    <CourseBuilder
      initialCourse={initialCourse}
      facilitators={facilitators}
      cohorts={cohorts}
      onBack={() => navigate("/admin/courses")}
      onSave={saveCourse}
    />
  );
}

export function AdminRecordingsRoute() {
  const { sessions, attachRecording, dropRecording } = useWorkspace();
  return (
    <AdminRecordings
      sessions={sessions}
      onAttach={attachRecording}
      onDrop={dropRecording}
    />
  );
}

export { AdminOperations, AdminPeople, CohortsPage, ClassesPage, AssessmentsPage };
