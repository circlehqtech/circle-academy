import { Navigate, Route, Routes } from "react-router-dom";
import { WorkspaceLayout } from "../layouts/WorkspaceLayout";
import { NotFound } from "../pages/NotFound";
import { useAuth } from "../features/auth/useAuth";
import { ROLE_HOME } from "./routeConfig";
import { AuthGuard, GuestGuard, RoleGuard } from "./guards";
import { AuthRoute } from "./AuthRoute";
import {
  Certificates,
  CourseDetailRoute,
  CoursesRoute,
  LiveReplaysRoute,
  StudentAssignments,
  StudentHomeRoute,
  Study,
} from "./StudentRoutes";
import {
  FacilitatorClassesPage,
  FacilitatorResults,
  FacilitatorReviewRoute,
  FacilitatorStudents,
  FacilitatorTeachingRoute,
} from "./FacilitatorRoutes";
import {
  AdminCoursesRoute,
  AdminOperations,
  AdminOverviewRoute,
  AdminPeople,
  AdminRecordingsRoute,
  CourseBuilderRoute,
  CohortsPage,
  ClassesPage,
  AssessmentsPage,
} from "./AdminRoutes";
import { ProfileRoute } from "./ProfileRoute";

function RootRedirect() {
  const { role } = useAuth();
  return <Navigate to={role ? ROLE_HOME[role] : "/auth"} replace />;
}

export function AppRoutes({
  initialTheme,
}: {
  initialTheme: "light" | "dark";
}) {
  const layout = <WorkspaceLayout initialTheme={initialTheme} />;

  return (
    <Routes>
      <Route element={<GuestGuard />}>
        <Route path="/auth" element={<AuthRoute />} />
      </Route>

      <Route element={<AuthGuard />}>
        <Route element={<RoleGuard allowedRole="student" />}>
          <Route path="/student" element={layout}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<StudentHomeRoute />} />
            <Route path="courses" element={<CoursesRoute />} />
            <Route path="courses/:courseId" element={<CourseDetailRoute />} />
            <Route path="live" element={<LiveReplaysRoute />} />
            <Route path="live/:replayId" element={<LiveReplaysRoute />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="study" element={<Study />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="profile" element={<ProfileRoute />} />
          </Route>
        </Route>

        <Route element={<RoleGuard allowedRole="facilitator" />}>
          <Route path="/facilitator" element={layout}>
            <Route index element={<Navigate to="teaching" replace />} />
            <Route path="teaching" element={<FacilitatorTeachingRoute />} />
            <Route path="reviews" element={<FacilitatorReviewRoute />} />
            <Route path="students" element={<FacilitatorStudents />} />
            <Route path="results" element={<FacilitatorResults />} />
            <Route path="classes" element={<FacilitatorClassesPage />} />
            <Route path="profile" element={<ProfileRoute />} />
          </Route>
        </Route>

        <Route element={<RoleGuard allowedRole="admin" />}>
          <Route path="/admin" element={layout}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminOverviewRoute />} />
            <Route path="courses" element={<AdminCoursesRoute />} />
            <Route path="courses/new" element={<CourseBuilderRoute />} />
            <Route path="courses/:courseId/edit" element={<CourseBuilderRoute />} />
            <Route path="people" element={<AdminPeople />} />
            <Route path="cohorts" element={<CohortsPage />} />
            <Route path="content" element={<AdminOperations section="content" />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="projects" element={<AdminOperations section="projects" />} />
            <Route path="certificates" element={<AdminOperations section="adminCerts" />} />
            <Route path="recordings" element={<AdminRecordingsRoute />} />
            <Route path="profile" element={<ProfileRoute />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
