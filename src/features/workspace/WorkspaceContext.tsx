import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ANNOUNCEMENTS, SESSIONS, SUBMISSIONS } from "../../data/lms";
import {
  INITIAL_ASSESSMENTS,
  INITIAL_CLASSES,
  INITIAL_COHORTS,
  INITIAL_COURSES,
  INITIAL_FACILITATORS,
  INITIAL_STUDENTS,
} from "../../data/workspace";
import { useToast } from "../../contexts/ToastContext";
import type {
  Announcement,
  Session,
  Submission,
  SubmissionStatus,
} from "../../types/lms";
import type {
  AssessmentRecord,
  CohortRecord,
  CourseInput,
  FacilitatorRecord,
  LiveClassRecord,
  ManagedCourse,
  StudentRecord,
} from "../../types/workspace";
import { createEntityId } from "../../utils/id";
import {
  WorkspaceContext,
  type WorkspaceContextValue,
} from "./workspace-context";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(ANNOUNCEMENTS);
  const [announcementPanelOpen, setAnnouncementPanelOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(SESSIONS);
  const [submissions, setSubmissions] = useState<Submission[]>(SUBMISSIONS);
  const [createdCourses, setCreatedCourses] = useState<string[]>([]);
  const [courses, setCourses] = useState<ManagedCourse[]>(INITIAL_COURSES);
  const [facilitators, setFacilitators] = useState(INITIAL_FACILITATORS);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [cohorts, setCohorts] = useState(INITIAL_COHORTS);
  const [liveClasses, setLiveClasses] = useState(INITIAL_CLASSES);
  const [assessments, setAssessments] = useState(INITIAL_ASSESSMENTS);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => timers.current.forEach((timer) => window.clearTimeout(timer)),
    [],
  );

  const openAnnouncementPanel = useCallback(
    () => setAnnouncementPanelOpen(true),
    [],
  );
  const closeAnnouncementPanel = useCallback(
    () => setAnnouncementPanelOpen(false),
    [],
  );
  const toggleAnnouncementPanel = useCallback(
    () => setAnnouncementPanelOpen((open) => !open),
    [],
  );
  const markAllAnnouncementsRead = useCallback(() => {
    setAnnouncements((current) =>
      current.map((announcement) => ({ ...announcement, unread: false })),
    );
  }, []);

  const attachRecording = useCallback(
    (index: number) => {
      const session = sessions[index];
      if (!session || session.ok || session.uploading) return;

      setSessions((current) =>
        current.map((item, itemIndex) =>
          itemIndex === index ? { ...item, uploading: true } : item,
        ),
      );
      timers.current.push(
        window.setTimeout(() => {
          setSessions((current) =>
            current.map((item, itemIndex) =>
              itemIndex === index
                ? { ...item, uploading: false, ok: true }
                : item,
            ),
          );
          toast("Recording attached. Students can replay it now.");
        }, 1700),
      );
    },
    [sessions, toast],
  );

  const dropRecording = useCallback(() => {
    const index = sessions.findIndex(
      (session) => !session.ok && !session.uploading,
    );
    if (index < 0) {
      toast("Every session already has a recording.");
      return;
    }
    attachRecording(index);
  }, [attachRecording, sessions, toast]);

  const decideSubmission = useCallback(
    (id: string, status: SubmissionStatus, feedback: string) => {
      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === id
            ? {
                ...submission,
                status,
                feedback: feedback || submission.feedback,
              }
            : submission,
        ),
      );
    },
    [],
  );

  const addCreatedCourse = useCallback((title: string) => {
    setCreatedCourses((current) =>
      current.includes(title) ? current : [...current, title],
    );
  }, []);

  const saveCourse = useCallback((course: CourseInput) => {
    const id = course.id ?? createEntityId("course");
    setCourses((current) => {
      const existing = current.find((item) => item.id === id);
      const tone = existing?.tone ?? (["a1", "a2", "a3"] as const)[current.length % 3];
      const record: ManagedCourse = {
        ...course,
        id,
        students: existing?.students ?? 0,
        progress: existing?.progress ?? 0,
        tone,
        glyph: course.title.trim().slice(0, 2) || "Co",
        nextLesson:
          course.modules.flatMap((module) => module.lessons)[0]?.title ??
          "Course orientation",
      };
      return existing
        ? current.map((item) => (item.id === id ? record : item))
        : [...current, record];
    });
    setFacilitators((current) =>
      current.map((facilitator) => ({
        ...facilitator,
        courseIds: course.facilitatorIds.includes(facilitator.id)
          ? Array.from(new Set([...facilitator.courseIds, id]))
          : facilitator.courseIds.filter((courseId) => courseId !== id),
      })),
    );
    return id;
  }, []);

  const duplicateCourse = useCallback((courseId: string) => {
    setCourses((current) => {
      const source = current.find((course) => course.id === courseId);
      if (!source) return current;
      const id = createEntityId("course");
      return [
        ...current,
        {
          ...source,
          id,
          title: `${source.title} copy`,
          code: `${source.code}-COPY`,
          status: "Draft",
          students: 0,
          progress: 0,
          facilitatorIds: [],
          modules: source.modules.map((module) => ({
            ...module,
            id: createEntityId("module"),
            lessons: module.lessons.map((lesson) => ({
              ...lesson,
              id: createEntityId("lesson"),
            })),
          })),
        },
      ];
    });
  }, []);

  const archiveCourse = useCallback((courseId: string) => {
    setCourses((current) =>
      current.map((course) =>
        course.id === courseId ? { ...course, status: "Archived" } : course,
      ),
    );
  }, []);

  const saveFacilitator = useCallback(
    (
      facilitator: Omit<FacilitatorRecord, "id" | "lastActive" | "status"> & {
        id?: string;
      },
    ) => {
      const id = facilitator.id ?? createEntityId("fac");
      setFacilitators((current) => {
        const existing = current.find((item) => item.id === id);
        const record: FacilitatorRecord = {
          ...facilitator,
          id,
          status: existing?.status ?? "Invited",
          lastActive: existing?.lastActive ?? "Invitation pending",
        };
        return existing
          ? current.map((item) => (item.id === id ? record : item))
          : [...current, record];
      });
      setCourses((current) =>
        current.map((course) => ({
          ...course,
          facilitatorIds: facilitator.courseIds.includes(course.id)
            ? Array.from(new Set([...course.facilitatorIds, id]))
            : course.facilitatorIds.filter((facilitatorId) => facilitatorId !== id),
        })),
      );
      return id;
    },
    [],
  );

  const saveStudent = useCallback(
    (
      student: Omit<StudentRecord, "id" | "lastActive" | "learningStatus"> & {
        id?: string;
      },
    ) => {
      const id = student.id ?? createEntityId("student");
      setStudents((current) => {
        const existing = current.find((item) => item.id === id);
        const record: StudentRecord = {
          ...student,
          id,
          learningStatus: existing?.learningStatus ?? "On track",
          lastActive: existing?.lastActive ?? "Invitation pending",
        };
        return existing
          ? current.map((item) => (item.id === id ? record : item))
          : [...current, record];
      });
      if (!student.id) {
        setCourses((current) =>
          current.map((course) =>
            student.courseIds.includes(course.id)
              ? { ...course, students: course.students + 1 }
              : course,
          ),
        );
      }
      return id;
    },
    [],
  );

  const saveCohort = useCallback(
    (cohort: Omit<CohortRecord, "id"> & { id?: string }) => {
      const id = cohort.id ?? createEntityId("cohort");
      const record: CohortRecord = { ...cohort, id };
      setCohorts((current) =>
        current.some((item) => item.id === id)
          ? current.map((item) => (item.id === id ? record : item))
          : [...current, record],
      );
      return id;
    },
    [],
  );

  const duplicateCohort = useCallback((cohortId: string) => {
    setCohorts((current) => {
      const source = current.find((cohort) => cohort.id === cohortId);
      return source
        ? [
            ...current,
            {
              ...source,
              id: createEntityId("cohort"),
              name: `${source.name} copy`,
              studentCount: 0,
              status: "Draft",
            },
          ]
        : current;
    });
  }, []);

  const archiveCohort = useCallback((cohortId: string) => {
    setCohorts((current) =>
      current.map((cohort) =>
        cohort.id === cohortId ? { ...cohort, status: "Archived" } : cohort,
      ),
    );
  }, []);

  const saveLiveClass = useCallback(
    (liveClass: Omit<LiveClassRecord, "id"> & { id?: string }) => {
      const id = liveClass.id ?? createEntityId("class");
      const record: LiveClassRecord = { ...liveClass, id };
      setLiveClasses((current) =>
        current.some((item) => item.id === id)
          ? current.map((item) => (item.id === id ? record : item))
          : [...current, record],
      );
      return id;
    },
    [],
  );

  const startLiveClass = useCallback((classId: string) => {
    setLiveClasses((current) =>
      current.map((item) =>
        item.id === classId ? { ...item, status: "Live" } : item,
      ),
    );
  }, []);

  const duplicateLiveClass = useCallback((classId: string) => {
    setLiveClasses((current) => {
      const source = current.find((item) => item.id === classId);
      return source
        ? [
            ...current,
            {
              ...source,
              id: createEntityId("class"),
              title: `${source.title} copy`,
              status: "Draft",
            },
          ]
        : current;
    });
  }, []);

  const cancelLiveClass = useCallback((classId: string) => {
    setLiveClasses((current) =>
      current.map((item) =>
        item.id === classId ? { ...item, status: "Cancelled" } : item,
      ),
    );
  }, []);

  const saveAssessment = useCallback(
    (assessment: Omit<AssessmentRecord, "id"> & { id?: string }) => {
      const id = assessment.id ?? createEntityId("assessment");
      const record: AssessmentRecord = { ...assessment, id };
      setAssessments((current) =>
        current.some((item) => item.id === id)
          ? current.map((item) => (item.id === id ? record : item))
          : [...current, record],
      );
      return id;
    },
    [],
  );

  const duplicateAssessment = useCallback((assessmentId: string) => {
    setAssessments((current) => {
      const source = current.find((item) => item.id === assessmentId);
      return source
        ? [
            ...current,
            {
              ...source,
              id: createEntityId("assessment"),
              title: `${source.title} copy`,
              status: "Draft",
            },
          ]
        : current;
    });
  }, []);

  const archiveAssessment = useCallback((assessmentId: string) => {
    setAssessments((current) =>
      current.map((item) =>
        item.id === assessmentId ? { ...item, status: "Archived" } : item,
      ),
    );
  }, []);

  const addSubmission = useCallback((submission: Submission) => {
    setSubmissions((current) => [submission, ...current]);
  }, []);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      announcements,
      announcementPanelOpen,
      openAnnouncementPanel,
      closeAnnouncementPanel,
      toggleAnnouncementPanel,
      markAllAnnouncementsRead,
      sessions,
      attachRecording,
      dropRecording,
      submissions,
      decideSubmission,
      createdCourses,
      addCreatedCourse,
      courses,
      saveCourse,
      duplicateCourse,
      archiveCourse,
      facilitators,
      saveFacilitator,
      students,
      saveStudent,
      cohorts,
      saveCohort,
      duplicateCohort,
      archiveCohort,
      liveClasses,
      saveLiveClass,
      startLiveClass,
      duplicateLiveClass,
      cancelLiveClass,
      assessments,
      saveAssessment,
      duplicateAssessment,
      archiveAssessment,
      addSubmission,
    }),
    [
      addCreatedCourse,
      announcementPanelOpen,
      announcements,
      attachRecording,
      closeAnnouncementPanel,
      createdCourses,
      decideSubmission,
      dropRecording,
      markAllAnnouncementsRead,
      openAnnouncementPanel,
      sessions,
      submissions,
      toggleAnnouncementPanel,
      courses,
      saveCourse,
      duplicateCourse,
      archiveCourse,
      facilitators,
      saveFacilitator,
      students,
      saveStudent,
      cohorts,
      saveCohort,
      duplicateCohort,
      archiveCohort,
      liveClasses,
      saveLiveClass,
      startLiveClass,
      duplicateLiveClass,
      cancelLiveClass,
      assessments,
      saveAssessment,
      duplicateAssessment,
      archiveAssessment,
      addSubmission,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
