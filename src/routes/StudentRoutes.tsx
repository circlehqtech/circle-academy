import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { StudentHome } from "../pages/StudentHome";
import { Courses } from "../pages/Courses";
import { CourseDetail } from "../pages/CourseDetail";
import { LiveReplays } from "../pages/LiveReplays";
import { Study } from "../pages/Study";
import { Certificates } from "../pages/Certificates";
import { StudentAssignments } from "../pages/StudentAssignments";
import { useWorkspace } from "../features/workspace/useWorkspace";
import { usePlayer } from "../contexts/PlayerContext";
import { useToast } from "../contexts/ToastContext";
import { toStudentCourse } from "../utils/course";

function useStudentCourses() {
  const { courses } = useWorkspace();
  return courses;
}

function useCourseNavigation() {
  const navigate = useNavigate();
  const courses = useStudentCourses();

  return (courseId: string) => {
    const course = courses.find((item) => item.id === courseId);
    if (!course) return;
    navigate(`/student/courses/${course.id}`);
  };
}

export function StudentHomeRoute() {
  const navigate = useNavigate();
  const openCourse = useCourseNavigation();
  const managedCourses = useStudentCourses();
  const courses = managedCourses.map(toStudentCourse);
  const { openAnnouncementPanel, liveClasses, facilitators } = useWorkspace();
  const courseIds = new Set(managedCourses.map((course) => course.id));
  const nextLiveClass = liveClasses
    .filter((item) => courseIds.has(item.courseId) && !['Cancelled', 'Completed', 'Draft'].includes(item.status))
    .toSorted((left, right) => `${left.date}T${left.time}`.localeCompare(`${right.date}T${right.time}`))[0];
  const nextClass = nextLiveClass ? {
    title: nextLiveClass.title,
    course: managedCourses.find((course) => course.id === nextLiveClass.courseId)?.title ?? 'Assigned course',
    host: facilitators.find((facilitator) => facilitator.id === nextLiveClass.hostId)?.name ?? 'Your facilitator',
    startsAt: `${nextLiveClass.date}T${nextLiveClass.time}`,
    time: nextLiveClass.time,
    duration: nextLiveClass.duration,
    meetingUrl: nextLiveClass.meetingUrl,
    status: nextLiveClass.status,
  } : undefined;

  return (
    <StudentHome
      courses={courses}
      nextClass={nextClass}
      onOpenCourse={openCourse}
      onOpenAnnouncements={openAnnouncementPanel}
      onOpenAssignments={() => navigate("/student/assignments")}
    />
  );
}

export function CoursesRoute() {
  const courses = useStudentCourses().map(toStudentCourse);
  return <Courses courses={courses} onOpenCourse={useCourseNavigation()} />;
}

export function CourseDetailRoute() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const course = useStudentCourses().find((item) => item.id === courseId);

  if (!course) return <Navigate to="/student/courses" replace />;

  return (
    <CourseDetail
      courseId={course.id}
      progress={course.progress}
      modules={course.modules}
      assessments={course.assessments ?? []}
      onBack={() => navigate("/student/courses")}
      onSelectReplay={(replayId) => navigate(`/student/live/${replayId}`)}
    />
  );
}

export function LiveReplaysRoute() {
  const navigate = useNavigate();
  const { replayId } = useParams();
  const { selectReplay, replays } = usePlayer();
  const { toast } = useToast();

  useEffect(() => {
    if (replayId) selectReplay(replayId);
  }, [replayId, selectReplay]);

  const chooseReplay = (id: string) => {
    const replay = replays.find((item) => item.id === id);
    selectReplay(id);
    navigate(`/student/live/${id}`);
    if (replay) {
      toast(
        replay.seen > 0 && replay.seen < 1
          ? "Resuming where you left off."
          : "Starting from the beginning.",
      );
    }
    window.scrollTo(0, 0);
  };

  return <LiveReplays onSelectReplay={chooseReplay} />;
}

export { Study, Certificates, StudentAssignments };
