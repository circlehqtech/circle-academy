import { useNavigate } from "react-router-dom";
import { FacilitatorTeaching } from "../pages/FacilitatorTeaching";
import { FacilitatorReview } from "../pages/FacilitatorReview";
import {
  FacilitatorResults,
  FacilitatorStudents,
} from "../pages/FacilitatorWorkspace";
import { FacilitatorClassesPage } from "../pages/facilitator/ClassesPage";
import { useWorkspace } from "../features/workspace/useWorkspace";
import { toAssignedCourse } from "../utils/course";

export function FacilitatorTeachingRoute() {
  const navigate = useNavigate();
  const { submissions, courses } = useWorkspace();
  const pendingSubmissions = submissions.filter(
    (submission) => submission.status === "pending",
  );

  return (
    <FacilitatorTeaching
      assignedCourses={courses.filter((course) => course.facilitatorIds.includes("fac-kemi") && course.status !== "Archived").map(toAssignedCourse)}
      pending={pendingSubmissions.length}
      finalProjects={
        pendingSubmissions.filter(
          (submission) => submission.kind === "Final project",
        ).length
      }
      onOpenReview={() => navigate("/facilitator/reviews")}
    />
  );
}

export function FacilitatorReviewRoute() {
  const { submissions, decideSubmission } = useWorkspace();
  return (
    <FacilitatorReview
      submissions={submissions}
      onDecide={decideSubmission}
    />
  );
}

export { FacilitatorClassesPage, FacilitatorResults, FacilitatorStudents };
