import { useNavigate } from "react-router-dom";
import { FacilitatorTeaching } from "../pages/FacilitatorTeaching";
import { FacilitatorReview } from "../pages/FacilitatorReview";
import {
  FacilitatorStudents,
} from "../pages/FacilitatorWorkspace";
import { FacilitatorClassesPage } from "../pages/facilitator/ClassesPage";
import { FacilitatorAssessmentResultsPage } from "../pages/facilitator/AssessmentResultsPage";
import { useWorkspace } from "../features/workspace/useWorkspace";
import { toAssignedCourse } from "../utils/course";
import { formatClockTime, formatDate } from "../utils/dateTime";

export function FacilitatorTeachingRoute() {
  const navigate = useNavigate();
  const { submissions, courses, students, liveClasses } = useWorkspace();
  const pendingSubmissions = submissions.filter(
    (submission) => submission.status === "pending",
  );

  return (
    <FacilitatorTeaching
      assignedCourses={courses.filter((course) => course.status !== "Archived").map(toAssignedCourse)}
      pending={pendingSubmissions.length}
      finalProjects={
        pendingSubmissions.filter(
          (submission) => submission.kind === "Final project",
        ).length
      }
      roster={students.map((student) => {
        const course = courses.find((item) => student.courseIds.includes(item.id));
        const status = student.learningStatus === "On track" ? "on track" : student.learningStatus === "Behind" ? "behind" : "at risk";
        return { name: student.name, initials: student.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2), course: course?.title ?? "Assigned course", p: student.progress ?? 0, status, detail: student.lastActive };
      })}
      activities={liveClasses.map((item) => ({ title: item.title, when: `${formatDate(item.date)}, ${formatClockTime(item.time)}`, state: item.status === "Completed" ? "past" : "upcoming", action: item.status === "Completed" ? "View" : "Open", toast: item.meetingUrl ? "Opening class link." : "No meeting link has been added." }))}
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

export { FacilitatorClassesPage, FacilitatorAssessmentResultsPage, FacilitatorStudents };
