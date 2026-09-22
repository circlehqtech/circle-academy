import { useCallback, useEffect, useRef, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { StudentHome } from "./pages/StudentHome";
import { Courses } from "./pages/Courses";
import { CourseDetail } from "./pages/CourseDetail";
import { LiveReplays } from "./pages/LiveReplays";
import { Study } from "./pages/Study";
import { Certificates } from "./pages/Certificates";
import { FacilitatorTeaching } from "./pages/FacilitatorTeaching";
import { FacilitatorReview } from "./pages/FacilitatorReview";
import { AdminOverview } from "./pages/AdminOverview";
import { AdminRecordings } from "./pages/AdminRecordings";
import { AuthFlow } from "./pages/AuthFlow";
import { ProfileSettings } from "./pages/ProfileSettings";
import { StudentAssignments } from "./pages/StudentAssignments";
import { AdminCourses, CourseBuilder } from "./pages/AdminCourses";
import { AdminPeople } from "./pages/AdminPeople";
import { AdminOperations } from "./pages/AdminOperations";
import {
  FacilitatorClasses,
  FacilitatorResults,
  FacilitatorStudents,
} from "./pages/FacilitatorWorkspace";
import { PlayerProvider, usePlayer } from "./contexts/PlayerContext";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import { useTheme } from "./hooks/useTheme";
import {
  ANNOUNCEMENTS,
  COURSES,
  NAV,
  REPLAYS,
  SESSIONS,
  SUBMISSIONS,
  TITLES,
} from "./data/lms";
import type {
  Announcement,
  Role,
  Session,
  Submission,
  SubmissionStatus,
  ViewId,
} from "./types/lms";

interface AppProps {
  /** Which workspace opens first. */
  initialRole?: "student" | "facilitator" | "admin";
  /** Starting colour mode for the whole platform. */
  initialTheme?: "light" | "dark";
  /** Skip authentication when embedding a specific workspace in tests or previews. */
  initialAuthenticated?: boolean;
}

export function App({
  initialRole = "student",
  initialTheme = "light",
  initialAuthenticated = false,
}: AppProps) {
  const [sessionRole, setSessionRole] = useState<Role | null>(
    initialAuthenticated ? initialRole : null,
  );
  return (
    <ToastProvider>
      <PlayerProvider>
        {sessionRole ? (
          <Shell
            initialRole={sessionRole}
            initialTheme={initialTheme}
            onLogout={() => setSessionRole(null)}
          />
        ) : (
          <AuthFlow onComplete={setSessionRole} />
        )}
      </PlayerProvider>
    </ToastProvider>
  );
}

function Shell({
  initialRole,
  initialTheme,
  onLogout,
}: {
  initialRole: Role;
  initialTheme: "light" | "dark";
  onLogout: () => void;
}) {
  const { theme, toggleTheme } = useTheme(initialTheme);
  const { toast } = useToast();
  const { selectReplay } = usePlayer();

  const [role, setRole] = useState<Role>(initialRole);
  const [view, setView] = useState<ViewId>(NAV[initialRole][0].id);
  const [courseTitle, setCourseTitle] = useState(TITLES.course);
  const [panelOpen, setPanelOpen] = useState(false);
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(ANNOUNCEMENTS);
  const [sessions, setSessions] = useState<Session[]>(SESSIONS);
  const [submissions, setSubmissions] = useState<Submission[]>(SUBMISSIONS);
  const [createdCourses, setCreatedCourses] = useState<string[]>([]);
  const [builderTitle, setBuilderTitle] = useState("");
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => timers.current.forEach((t) => window.clearTimeout(t)),
    [],
  );

  const go = useCallback((id: ViewId) => {
    setView(id);
    setPanelOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const changeRole = (r: Role) => {
    setRole(r);
    go(NAV[r][0].id);
  };

  const openCourse = (id: string) => {
    const c = COURSES.find((x) => x.id === id);
    if (!c) return;
    if (c.p === 100) {
      go("certs");
      return;
    }
    setCourseTitle(c.name);
    go("course");
  };

  const chooseReplay = (id: string) => {
    const r = REPLAYS.find((x) => x.id === id);
    selectReplay(id);
    if (view !== "live") {
      go("live");
      return;
    }
    if (r) {
      toast(
        r.seen > 0 && r.seen < 1
          ? "Resuming where you left off."
          : "Starting from the beginning.",
      );
    }
    window.scrollTo(0, 0);
  };

  const attach = (index: number) => {
    const s = sessions[index];
    if (!s || s.ok || s.uploading) return;
    setSessions((prev) =>
      prev.map((x, i) => (i === index ? { ...x, uploading: true } : x)),
    );
    timers.current.push(
      window.setTimeout(() => {
        setSessions((prev) =>
          prev.map((x, i) =>
            i === index ? { ...x, uploading: false, ok: true } : x,
          ),
        );
        toast("Recording attached. Students can replay it now.");
      }, 1700),
    );
  };

  const dropRecording = () => {
    const i = sessions.findIndex((s) => !s.ok && !s.uploading);
    if (i < 0) {
      toast("Every session already has a recording.");
      return;
    }
    attach(i);
  };

  const decideSubmission = (
    id: string,
    status: SubmissionStatus,
    feedback: string,
  ) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status, feedback: feedback || s.feedback } : s,
      ),
    );
  };

  const pendingSubmissions = submissions.filter((s) => s.status === "pending");
  const missing = sessions.filter((s) => !s.ok).length;
  const title = view === "course" ? courseTitle : TITLES[view];

  return (
    <div className="grid min-h-screen grid-cols-[minmax(0,1fr)] min-[821px]:grid-cols-[248px_minmax(0,1fr)]">
      <Sidebar
        role={role}
        view={view}
        onRole={changeRole}
        onNavigate={go}
        onProfile={() => go("profile")}
      />

      <main className="mx-auto w-full min-w-0 max-w-[1240px] px-[clamp(18px,3.2vw,48px)] pt-6 pb-[100px] min-[821px]:pb-[72px]">
        <TopBar
          title={title}
          theme={theme}
          announcements={announcements}
          panelOpen={panelOpen}
          onTogglePanel={() => setPanelOpen((o) => !o)}
          onClosePanel={() => setPanelOpen(false)}
          onReadAll={() =>
            setAnnouncements((prev) =>
              prev.map((a) => ({ ...a, unread: false })),
            )
          }
          onOpenProfile={() => go("profile")}
          onToggleTheme={toggleTheme}
        />

        {view === "home" && (
          <StudentHome
            key="home"
            onOpenCourse={openCourse}
            onOpenAnnouncements={() => {
              setPanelOpen(true);
              window.scrollTo(0, 0);
            }}
            onOpenAssignments={() => go("assignments")}
            onOpenCertificates={() => go("certs")}
          />
        )}
        {view === "courses" && (
          <Courses key="courses" onOpenCourse={openCourse} />
        )}
        {view === "course" && (
          <CourseDetail
            key="course"
            onBack={() => go("courses")}
            onSelectReplay={chooseReplay}
            onOpenAssignments={() => go("assignments")}
          />
        )}
        {view === "live" && (
          <LiveReplays key="live" onSelectReplay={chooseReplay} />
        )}
        {view === "study" && <Study key="study" />}
        {view === "assignments" && <StudentAssignments key="assignments" />}
        {view === "certs" && <Certificates key="certs" />}
        {view === "profile" && (
          <ProfileSettings
            key={`profile-${role}`}
            role={role}
            onLogout={onLogout}
          />
        )}
        {view === "teaching" && (
          <FacilitatorTeaching
            key="teaching"
            pending={pendingSubmissions.length}
            finalProjects={
              pendingSubmissions.filter((s) => s.kind === "Final project")
                .length
            }
            onOpenReview={() => go("review")}
          />
        )}
        {view === "review" && (
          <FacilitatorReview
            key="review"
            submissions={submissions}
            onDecide={decideSubmission}
          />
        )}
        {view === "facilitatorStudents" && (
          <FacilitatorStudents key="facilitatorStudents" />
        )}
        {view === "results" && <FacilitatorResults key="results" />}
        {view === "facilitatorClasses" && (
          <FacilitatorClasses key="facilitatorClasses" />
        )}
        {view === "overview" && (
          <AdminOverview key="overview" missingRecordings={missing} />
        )}
        {view === "adminCourses" && (
          <AdminCourses
            key="adminCourses"
            createdCourses={createdCourses}
            onCreate={() => {
              setBuilderTitle("");
              go("courseBuilder");
            }}
            onEdit={(course) => {
              setBuilderTitle(course);
              go("courseBuilder");
            }}
          />
        )}
        {view === "courseBuilder" && (
          <CourseBuilder
            key={`courseBuilder-${builderTitle}`}
            initialTitle={builderTitle}
            onBack={() => go("adminCourses")}
            onPublish={(course) => {
              setCreatedCourses((current) =>
                current.includes(course) ? current : [...current, course],
              );
            }}
          />
        )}
        {view === "people" && <AdminPeople key="people" />}
        {(view === "cohorts" ||
          view === "content" ||
          view === "adminClasses" ||
          view === "assessments" ||
          view === "projects" ||
          view === "adminCerts") && (
          <AdminOperations key={view} section={view} />
        )}
        {view === "recs" && (
          <AdminRecordings
            key="recs"
            sessions={sessions}
            onAttach={attach}
            onDrop={dropRecording}
          />
        )}
      </main>
    </div>
  );
}
