import { useMemo, useState, type FormEvent } from "react";
import { asRecord, collection, extractId } from "../../api/adapters";
import { ApiError } from "../../api/client";
import { lmsApi } from "../../api/lmsApi";
import { Icon } from "../../components/Icon";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { EmptyState } from "../../components/ui/EmptyState";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { View } from "../../components/View";
import { useToast } from "../../contexts/ToastContext";
import { useWorkspace } from "../../features/workspace/useWorkspace";
import { button, buttonGhostSmall, card, fieldLabel, selectInput, textInput } from "../../styles";
import type { CohortRecord } from "../../types/workspace";

type EditorTarget = CohortRecord | "new" | null;

function dateOnly(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function emptyCohort(): Omit<CohortRecord, "id"> {
  const starts = new Date();
  const ends = new Date(starts);
  ends.setDate(ends.getDate() + 56);
  return {
    name: "",
    starts: dateOnly(starts),
    ends: dateOnly(ends),
    studentCount: 0,
    studentCap: null,
    enrollmentOpensAt: "",
    enrollmentClosesAt: "",
    allowAdminEnrollmentAfterClose: true,
    courseIds: [],
    facilitatorIds: [],
    status: "Draft",
  };
}

function dateLabel(value: string) {
  if (!value) return "Not set";
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
}

function dateTimeInputValue(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIso(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function membershipIds(response: unknown) {
  return collection(response, "students", "accounts", "members")
    .map((value) => extractId(asRecord(value).account ?? asRecord(value).student ?? value))
    .filter(Boolean);
}

function isAlreadyEnrolled(error: unknown) {
  return error instanceof ApiError
    && (error.status === 409 || (error.status === 400 && /already|enrolled|exists/i.test(error.message)));
}

export function CohortsPage() {
  const { toast } = useToast();
  const { cohorts, courses, facilitators, students, saveCohort, refreshWorkspace } = useWorkspace();
  const [editing, setEditing] = useState<EditorTarget>(null);
  const [actionsFor, setActionsFor] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [initialStudentIds, setInitialStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipReady, setMembershipReady] = useState(false);
  const [membershipError, setMembershipError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const availableCourses = useMemo(() => courses.filter((course) => course.status !== "Archived"), [courses]);
  const editorCourses = useMemo(() => {
    if (!editing || editing === "new") return availableCourses;
    return courses.filter((course) => course.status !== "Archived" || editing.courseIds.includes(course.id));
  }, [availableCourses, courses, editing]);
  const visibleStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => `${student.name} ${student.email}`.toLowerCase().includes(query));
  }, [studentSearch, students]);

  const loadMembership = async (cohortId: string) => {
    setMembershipLoading(true);
    setMembershipReady(false);
    setMembershipError("");
    try {
      const ids = membershipIds(await lmsApi.admin.cohortStudents(cohortId));
      setSelectedStudentIds(ids);
      setInitialStudentIds(ids);
      setMembershipReady(true);
    } catch (error) {
      setMembershipError(error instanceof Error ? error.message : "Unable to load the cohort students.");
    } finally {
      setMembershipLoading(false);
    }
  };

  const openEditor = (target: Exclude<EditorTarget, null>) => {
    setEditing(target);
    setStudentSearch("");
    setSelectedStudentIds([]);
    setInitialStudentIds([]);
    setMembershipError("");
    if (target === "new") {
      setMembershipReady(true);
      setMembershipLoading(false);
    } else {
      void loadMembership(target.id);
    }
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || !editing) return;
    const form = new FormData(event.currentTarget);
    const existing = editing === "new" ? null : editing;
    const starts = String(form.get("starts") ?? "");
    const ends = String(form.get("ends") ?? "");
    const courseId = String(form.get("courseId") ?? "");
    const capValue = String(form.get("studentCap") ?? "").trim();
    const studentCap = capValue ? Number(capValue) : null;
    const enrollmentOpensAt = toIso(form.get("enrollmentOpensAt"));
    const enrollmentClosesAt = toIso(form.get("enrollmentClosesAt"));

    if (ends < starts) { toast("The cohort end date must be after its start date."); return; }
    if (studentCap !== null && (!Number.isInteger(studentCap) || studentCap < 1)) { toast("Student capacity must be a whole number greater than zero."); return; }
    if (studentCap !== null && membershipReady && selectedStudentIds.length > studentCap) { toast(`This cohort has ${selectedStudentIds.length} selected students, above its capacity of ${studentCap}.`); return; }
    if (enrollmentOpensAt && enrollmentClosesAt && enrollmentClosesAt < enrollmentOpensAt) { toast("Enrollment must close after it opens."); return; }

    const cohort: Omit<CohortRecord, "id"> & { id?: string } = {
      id: existing?.id,
      name: String(form.get("name") ?? "").trim(),
      starts,
      ends,
      studentCount: existing?.studentCount ?? 0,
      studentCap,
      enrollmentOpensAt,
      enrollmentClosesAt,
      allowAdminEnrollmentAfterClose: form.get("allowAdminEnrollmentAfterClose") === "on",
      courseIds: [courseId].filter(Boolean),
      facilitatorIds: form.getAll("facilitatorIds").map(String),
      status: String(form.get("status")) as CohortRecord["status"],
    };

    setSaving(true);
    try {
      const cohortId = await saveCohort(cohort);
      if (!cohortId) return;
      if (membershipReady) {
        const additions = selectedStudentIds.filter((id) => !initialStudentIds.includes(id));
        const removals = initialStudentIds.filter((id) => !selectedStudentIds.includes(id));
        await Promise.all(additions.map(async (accountId) => {
          const account = students.find((student) => student.id === accountId);
          if (!account?.courseIds.includes(courseId)) {
            try { await lmsApi.admin.enrollStudent(courseId, accountId); }
            catch (error) { if (!isAlreadyEnrolled(error)) throw error; }
          }
          await lmsApi.admin.addCohortStudent(cohortId, accountId);
        }));
        await Promise.all(removals.map((accountId) => lmsApi.admin.removeCohortStudent(cohortId, accountId)));
      }
      refreshWorkspace();
      toast(existing ? "Cohort details and roster updated." : "Cohort created with its delivery team and students.");
      setEditing(null);
    } catch (error) {
      toast(error instanceof Error ? error.message : "The cohort was saved, but its student roster could not be updated.");
      if (!existing) {
        refreshWorkspace();
        setEditing(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (cohort: CohortRecord, status: CohortRecord["status"]) => {
    setPendingAction(cohort.id);
    setActionsFor(null);
    try {
      await lmsApi.admin.setCohortStatus(cohort.id, status.toUpperCase());
      refreshWorkspace();
      toast(`${cohort.name} is now ${status.toLowerCase()}.`);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to update the cohort status.");
    } finally {
      setPendingAction(null);
    }
  };

  const duplicate = async (cohort: CohortRecord) => {
    setPendingAction(cohort.id);
    setActionsFor(null);
    try {
      await lmsApi.admin.duplicateCohort(cohort.id);
      refreshWorkspace();
      toast(`${cohort.name} was duplicated as a draft.`);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to duplicate the cohort.");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <View>
      <PageHeader description="Group students into delivery periods, assign a course and facilitators, control enrollment, and manage each cohort roster." actionLabel="Create cohort" onAction={() => openEditor("new")} />
      {cohorts.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cohorts.map((cohort) => {
          const course = courses.find((item) => cohort.courseIds.includes(item.id));
          const assignedFacilitators = facilitators.filter((item) => cohort.facilitatorIds.includes(item.id));
          const busy = pendingAction === cohort.id;
          return (
            <article key={cohort.id} className={`${card} relative flex min-h-[290px] flex-col`} aria-busy={busy}>
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-hq-red-ink text-sm font-bold text-hq-bone">{cohort.name.match(/\d+/)?.[0] ?? "HQ"}</span>
                <StatusPill status={cohort.status} />
              </div>
              <h2 className="mt-5 text-xl font-[680]">{cohort.name}</h2>
              <p className="mt-1 text-sm text-muted">{dateLabel(cohort.starts)} – {dateLabel(cohort.ends)}</p>
              <p className="mt-3 flex items-center gap-2 text-sm"><Icon name="book" className="size-4 text-muted" /><span className="truncate">{course?.title ?? "Course unavailable"}</span></p>
              <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-line py-4">
                <div><dt className="text-xs text-muted">Students</dt><dd className="text-xl font-bold">{cohort.studentCount}{cohort.studentCap ? <span className="text-sm font-normal text-muted"> / {cohort.studentCap}</span> : null}</dd></div>
                <div><dt className="text-xs text-muted">Facilitators</dt><dd className="text-xl font-bold">{assignedFacilitators.length}</dd></div>
              </dl>
              <div className="mt-auto flex items-center gap-2 pt-4">
                <button className={buttonGhostSmall} type="button" disabled={busy} onClick={() => openEditor(cohort)}>{busy ? <Spinner /> : <Icon name="settings" />}Manage</button>
                <button className="grid size-9 place-items-center rounded-full hover:bg-surface-2 disabled:opacity-50" type="button" disabled={busy} aria-label={`More actions for ${cohort.name}`} aria-expanded={actionsFor === cohort.id} onClick={() => setActionsFor((current) => current === cohort.id ? null : cohort.id)}><Icon name="more" /></button>
              </div>
              {actionsFor === cohort.id ? (
                <div className="absolute right-4 bottom-14 z-10 grid min-w-48 rounded-xl border border-line bg-background p-1 shadow-xl">
                  <button className="rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2" type="button" onClick={() => void duplicate(cohort)}>Duplicate as draft</button>
                  {cohort.status !== "Enrolling" && cohort.status !== "Archived" ? <button className="rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2" type="button" onClick={() => void changeStatus(cohort, "Enrolling")}>Open enrollment</button> : null}
                  {cohort.status !== "Active" && cohort.status !== "Archived" ? <button className="rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2" type="button" onClick={() => void changeStatus(cohort, "Active")}>Mark active</button> : null}
                  {cohort.status === "Active" ? <button className="rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2" type="button" onClick={() => void changeStatus(cohort, "Completed")}>Mark completed</button> : null}
                  {cohort.status !== "Archived" ? <button className="rounded-lg px-3 py-2 text-left text-sm text-accent-text hover:bg-surface-2" type="button" onClick={() => void changeStatus(cohort, "Archived")}>Archive cohort</button> : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div> : <EmptyState icon="users" title="No cohorts created yet" description="Create a cohort to group students, a course, and facilitators into one delivery period." actionLabel="Create cohort" onAction={() => openEditor("new")} />}

      {editing ? (
        <Modal size="drawer" busy={saving} title={editing === "new" ? "Create a cohort" : `Manage ${editing.name}`} subtitle="Configure delivery, enrollment rules, facilitators, and the student roster." onClose={() => { if (!saving) setEditing(null); }}>
          <form className="grid gap-6" onSubmit={save} aria-busy={saving}>
            <section className="grid gap-4">
              <SectionHeading title="Cohort details" description="The course is fixed after the cohort is created." />
              <div><label className={fieldLabel} htmlFor="cohort-name">Cohort name</label><input id="cohort-name" name="name" className={`${textInput} w-full`} defaultValue={editing === "new" ? emptyCohort().name : editing.name} placeholder="e.g. January 2027 Cohort" required disabled={saving} /></div>
              <div><label className={fieldLabel} htmlFor="cohort-course">Course</label><CustomSelect id="cohort-course" name="courseId" className={selectInput} defaultValue={editing === "new" ? "" : editing.courseIds[0] ?? ""} required disabled={saving || editing !== "new"}><option value="" disabled>Choose a course</option>{editorCourses.map((course) => <option key={course.id} value={course.id}>{course.title}{course.status === "Archived" ? " · Archived" : ""}</option>)}</CustomSelect>{editing !== "new" ? <p className="mt-1.5 text-xs text-muted">Create another cohort if you need to deliver a different course.</p> : null}</div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel} htmlFor="cohort-starts">Starts</label><input id="cohort-starts" name="starts" className={`${textInput} w-full`} type="date" defaultValue={editing === "new" ? emptyCohort().starts : editing.starts} required disabled={saving} /></div><div><label className={fieldLabel} htmlFor="cohort-ends">Ends</label><input id="cohort-ends" name="ends" className={`${textInput} w-full`} type="date" defaultValue={editing === "new" ? emptyCohort().ends : editing.ends} required disabled={saving} /></div></div>
              <div><label className={fieldLabel} htmlFor="cohort-status">Status</label><CustomSelect id="cohort-status" name="status" className={selectInput} defaultValue={editing === "new" ? "Draft" : editing.status} disabled={saving}><option>Draft</option><option>Enrolling</option><option>Active</option><option>Completed</option><option>Archived</option></CustomSelect></div>
            </section>

            <section className="grid gap-4 border-t border-line pt-6">
              <SectionHeading title="Enrollment rules" description="Set capacity and the period when students can be added." />
              <div><label className={fieldLabel} htmlFor="cohort-cap">Student capacity</label><input id="cohort-cap" name="studentCap" className={`${textInput} w-full`} type="number" min="1" step="1" defaultValue={editing === "new" ? "" : editing.studentCap ?? ""} placeholder="No limit" disabled={saving} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel} htmlFor="cohort-enrollment-opens">Enrollment opens</label><input id="cohort-enrollment-opens" name="enrollmentOpensAt" className={`${textInput} w-full`} type="datetime-local" defaultValue={editing === "new" ? "" : dateTimeInputValue(editing.enrollmentOpensAt)} disabled={saving} /></div><div><label className={fieldLabel} htmlFor="cohort-enrollment-closes">Enrollment closes</label><input id="cohort-enrollment-closes" name="enrollmentClosesAt" className={`${textInput} w-full`} type="datetime-local" defaultValue={editing === "new" ? "" : dateTimeInputValue(editing.enrollmentClosesAt)} disabled={saving} /></div></div>
              <label className="flex items-start gap-3 rounded-xl border border-line p-3 text-sm"><input name="allowAdminEnrollmentAfterClose" type="checkbox" defaultChecked={editing === "new" ? true : editing.allowAdminEnrollmentAfterClose} disabled={saving} className="mt-0.5 accent-[var(--accent)]" /><span><b className="block">Allow admin enrollment after the deadline</b><span className="text-muted">Admins can still add a student after enrollment closes.</span></span></label>
            </section>

            <section className="grid gap-4 border-t border-line pt-6">
              <SectionHeading title="Facilitator team" description="Choose the people who will deliver and manage this cohort." />
              <CheckList name="facilitatorIds" items={facilitators.map((facilitator) => ({ id: facilitator.id, label: facilitator.name, description: facilitator.email }))} selected={editing === "new" ? [] : editing.facilitatorIds} disabled={saving} empty="No facilitator accounts are available yet." />
            </section>

            <section className="grid gap-4 border-t border-line pt-6">
              <div className="flex flex-wrap items-start justify-between gap-3"><SectionHeading title="Students" description="Select existing student accounts. New selections are enrolled in the cohort course automatically." /><span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold">{selectedStudentIds.length} selected</span></div>
              <label className="relative"><span className="sr-only">Search students</span><Icon name="search" className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" /><input className={`${textInput} w-full pl-10`} type="search" placeholder="Search existing students" value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} disabled={saving || membershipLoading || !membershipReady} /></label>
              {membershipLoading ? <StudentListSkeleton /> : membershipError ? <div role="alert" className="grid justify-items-start gap-2 rounded-xl border border-line p-4"><b>Could not load this cohort's students</b><p className="text-sm text-muted">{membershipError}</p>{editing !== "new" ? <button className={buttonGhostSmall} type="button" onClick={() => void loadMembership(editing.id)}>Try again</button> : null}</div> : students.length === 0 ? <div className="rounded-xl border border-dashed border-line p-5 text-center"><b>No student accounts yet</b><p className="mt-1 text-sm text-muted">Create students on the People page, then return here to add them.</p></div> : <div className="grid max-h-64 gap-1 overflow-y-auto rounded-xl border border-line p-2">{visibleStudents.length ? visibleStudents.map((student) => <label key={student.id} className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-surface-2"><input type="checkbox" checked={selectedStudentIds.includes(student.id)} onChange={(event) => setSelectedStudentIds((current) => event.target.checked ? [...current, student.id] : current.filter((id) => id !== student.id))} disabled={saving || !membershipReady} className="mt-0.5 accent-[var(--accent)]" /><span className="min-w-0"><b className="block truncate text-sm">{student.name}</b><span className="block truncate text-xs text-muted">{student.email}</span></span></label>) : <p className="p-4 text-center text-sm text-muted">No students match “{studentSearch}”.</p>}</div>}
              <p className="text-xs text-muted">Removing a student here removes the cohort membership only. It does not delete the account.</p>
            </section>

            <button className={`${button} w-full`} type="submit" disabled={saving || (editing === "new" && availableCourses.length === 0)}>{saving ? <><Spinner />Saving cohort…</> : <><Icon name="save" />{editing === "new" ? "Create cohort" : "Save all changes"}</>}</button>
          </form>
        </Modal>
      ) : null}
    </View>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return <div><h3 className="font-[680]">{title}</h3><p className="mt-1 text-sm text-muted">{description}</p></div>;
}

function StatusPill({ status }: { status: CohortRecord["status"] }) {
  const dot = status === "Active" ? "bg-reward" : status === "Archived" || status === "Completed" ? "bg-muted" : status === "Enrolling" ? "bg-hq-amber" : "bg-foreground";
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold"><i className={`size-1.5 rounded-full ${dot}`} />{status}</span>;
}

function CheckList({ name, items, selected, disabled, empty }: { name: string; items: Array<{ id: string; label: string; description?: string }>; selected: string[]; disabled?: boolean; empty: string }) {
  return <fieldset disabled={disabled}><legend className="sr-only">Facilitators</legend><div className="grid max-h-48 gap-1 overflow-y-auto rounded-xl border border-line p-2 sm:grid-cols-2">{items.length ? items.map((item) => <label key={item.id} className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-surface-2"><input name={name} value={item.id} type="checkbox" defaultChecked={selected.includes(item.id)} className="mt-0.5 accent-[var(--accent)]" /><span className="min-w-0"><b className="block truncate text-sm">{item.label}</b>{item.description ? <span className="block truncate text-xs text-muted">{item.description}</span> : null}</span></label>) : <p className="p-3 text-sm text-muted sm:col-span-2">{empty}</p>}</div></fieldset>;
}

function Spinner() {
  return <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />;
}

function StudentListSkeleton() {
  return <div className="grid gap-2 rounded-xl border border-line p-3" role="status" aria-label="Loading cohort students">{Array.from({ length: 3 }, (_, index) => <div key={index} className="flex animate-pulse items-center gap-3 rounded-lg p-2"><span className="size-4 rounded bg-surface-2" /><span className="grid flex-1 gap-2"><i className="h-3 w-36 rounded bg-surface-2" /><i className="h-3 w-52 max-w-full rounded bg-surface-2" /></span></div>)}</div>;
}
