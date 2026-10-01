import { useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Modal } from "../components/ui/Modal";
import { CustomSelect } from "../components/ui/CustomSelect";
import { PageHeader } from "../components/ui/PageHeader";
import { View } from "../components/View";
import { useToast } from "../contexts/ToastContext";
import { useWorkspace } from "../features/workspace/useWorkspace";
import { downloadCsv } from "../utils/csv";
import type { FacilitatorRecord, ManagedCourse, StudentRecord } from "../types/workspace";
import { lmsApi } from "../api/lmsApi";
import { asRecord, unwrap } from "../api/adapters";
import { accountStatusLabel, useAdminAccounts } from "../api/adminAccounts";
import { queryKeys } from "../api/endpoints";
import {
  button,
  buttonGhostSmall,
  fieldLabel,
  selectInput,
  table,
  tableWrap,
  tabButton,
  tabs,
  textInput,
} from "../styles";

type PeopleTab = "students" | "facilitators";

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function AdminPeople() {
  const { toast } = useToast();
  const { students, facilitators, courses, cohorts, saveFacilitator, saveStudent } = useWorkspace();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState<PeopleTab>("students");
  const [query, setQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [managedFacilitator, setManagedFacilitator] = useState<FacilitatorRecord | null>(null);
  const [managedStudent, setManagedStudent] = useState<StudentRecord | null>(null);
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  // These subscriptions share the same cached requests as WorkspaceProvider.
  const studentAccounts = useAdminAccounts("STUDENT");
  const facilitatorAccounts = useAdminAccounts("FACILITATOR");
  const studentStatuses = useMemo(() => new Map((studentAccounts.data ?? []).map((account) => [account.id, accountStatusLabel(account)])), [studentAccounts.data]);

  const activeAccountsQuery = tab === "students" ? studentAccounts : facilitatorAccounts;
  const isLoadingAccounts = activeAccountsQuery.isPending;
  const isRefreshingAccounts = activeAccountsQuery.isFetching && !activeAccountsQuery.isPending;
  const accountsError = activeAccountsQuery.error;

  const visibleStudents = useMemo(
    () => students.filter((student) => `${student.name} ${student.email}`.toLowerCase().includes(query.toLowerCase())),
    [query, students],
  );
  const visibleFacilitators = useMemo(
    () => facilitators.filter((facilitator) => `${facilitator.name} ${facilitator.email}`.toLowerCase().includes(query.toLowerCase())),
    [facilitators, query],
  );

  const createAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCreating) return;
    const form = new FormData(event.currentTarget);
    const role = tab === "students" ? "STUDENT" : "FACILITATOR";
    setIsCreating(true);
    try {
      const response = await lmsApi.admin.createAccount({
        email: String(form.get("email")),
        password: String(form.get("password")),
        firstName: String(form.get("firstName")),
        lastName: String(form.get("lastName")),
        phoneNumber: String(form.get("phoneNumber")) || undefined,
        role,
        courseIds: form.getAll("courseIds").map(String),
        ...(role === "STUDENT" && form.get("cohortId") ? { cohortId: String(form.get("cohortId")) } : {}),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.accounts(role) });
      setInviteOpen(false);
      const result = asRecord(unwrap(response));
      toast(result.emailSent === false
        ? `${String(form.get("firstName"))}'s account is active, but the notification email was not delivered. Share the login details securely or contact support.`
        : `${String(form.get("firstName"))}'s ${role.toLowerCase()} account is active and the account email was sent.`);
    } catch (failure) { toast(failure instanceof Error ? failure.message : 'Unable to create the account.'); }
    finally { setIsCreating(false); }
  };

  const updateFacilitator = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!managedFacilitator) return;
    const form = new FormData(event.currentTarget);
    setIsSavingAssignment(true);
    const saved = await saveFacilitator({
      id: managedFacilitator.id,
      name: String(form.get("name") ?? managedFacilitator.name),
      email: String(form.get("email") ?? managedFacilitator.email),
      courseIds: form.getAll("courseIds").map(String),
      canGrade: form.get("canGrade") === "on",
    });
    setIsSavingAssignment(false);
    if (saved) setManagedFacilitator(null);
  };

  const updateStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!managedStudent) return;
    const form = new FormData(event.currentTarget);
    setIsSavingAssignment(true);
    const saved = await saveStudent({
      id: managedStudent.id,
      name: managedStudent.name,
      email: managedStudent.email,
      cohortId: String(form.get("cohortId") ?? ""),
      courseIds: form.getAll("courseIds").map(String),
    });
    setIsSavingAssignment(false);
    if (saved) setManagedStudent(null);
  };

  const exportPeople = () => {
    const rows = tab === "students"
      ? [["Name", "Email", "Cohort", "Courses", "Status"], ...students.map((student) => [student.name, student.email, cohorts.find((cohort) => cohort.id === student.cohortId)?.name ?? "", student.courseIds.length, student.learningStatus])]
      : [["Name", "Email", "Courses", "Can grade", "Status"], ...facilitators.map((facilitator) => [facilitator.name, facilitator.email, facilitator.courseIds.length, facilitator.canGrade ? "Yes" : "No", facilitator.status])];
    downloadCsv(`hq-learn-${tab}.csv`, rows);
    toast("CSV export downloaded.");
  };

  return (
    <View>
      <PageHeader
        description="Create active student and facilitator accounts with the credentials they need to sign in."
        actionLabel={`Create ${tab === "students" ? "student" : "facilitator"}`}
        onAction={() => setInviteOpen(true)}
      />

      <div className={tabs} role="tablist">
        <button className={tabButton} type="button" role="tab" aria-selected={tab === "students"} onClick={() => setTab("students")}>Students · {students.length}</button>
        <button className={tabButton} type="button" role="tab" aria-selected={tab === "facilitators"} onClick={() => setTab("facilitators")}>Facilitators · {facilitators.length}</button>
      </div>

      <div className="my-5 flex flex-wrap gap-3">
        <label className="relative min-w-[240px] flex-1">
          <span className="sr-only">Search {tab}</span>
          <Icon name="search" className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
          <input className={`${textInput} w-full pl-10`} placeholder={`Search ${tab}`} value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        {isRefreshingAccounts ? <LoadingLabel label={`Refreshing ${tab}…`} /> : null}
        <button className={buttonGhostSmall} type="button" onClick={exportPeople} disabled={isLoadingAccounts}>Export CSV</button>
      </div>

      <div className={tableWrap} aria-busy={activeAccountsQuery.isFetching}>
        <table className={table}>
          <thead><tr><th>{tab === "students" ? "Student" : "Facilitator"}</th><th>Email</th><th>{tab === "students" ? "Cohort" : "Assigned courses"}</th><th>{tab === "students" ? "Enrolment" : "Students"}</th><th>Status</th><th>Last active</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {isLoadingAccounts ? (
              <PeopleTableSkeleton />
            ) : accountsError ? (
              <TableMessage>
                <div role="alert" className="grid justify-items-center gap-3 py-4 text-center">
                  <span><b>Could not load {tab}.</b><span className="mt-1 block text-sm text-muted">{accountsError.message}</span></span>
                  <button className={buttonGhostSmall} type="button" onClick={() => void activeAccountsQuery.refetch()}>Try again</button>
                </div>
              </TableMessage>
            ) : tab === "students" && visibleStudents.length === 0 ? (
              <TableMessage><PeopleEmptyState kind="students" search={query} onCreate={() => setInviteOpen(true)} /></TableMessage>
            ) : tab === "facilitators" && visibleFacilitators.length === 0 ? (
              <TableMessage><PeopleEmptyState kind="facilitators" search={query} onCreate={() => setInviteOpen(true)} /></TableMessage>
            ) : tab === "students" ? visibleStudents.map((student) => (
              <tr key={student.id}>
                <td><Person name={student.name} /></td><td>{student.email}</td><td>{cohorts.find((cohort) => cohort.id === student.cohortId)?.name ?? "Self-paced"}</td><td>{student.courseIds.length} active</td><td><StatusPill disabled={studentStatuses.get(student.id) === "Disabled"}>{studentStatuses.get(student.id) ?? student.learningStatus}</StatusPill></td><td>{student.lastActive}</td><td><div className="flex flex-wrap gap-2"><button className={buttonGhostSmall} type="button" onClick={() => navigate(`/admin/people/students/${student.id}`)}>View</button><button className={buttonGhostSmall} type="button" onClick={() => setManagedStudent(student)}>Assign</button></div></td>
              </tr>
            )) : visibleFacilitators.map((facilitator) => {
              const assigned = courses.filter((course) => facilitator.courseIds.includes(course.id));
              return (
                <tr key={facilitator.id}>
                  <td><Person name={facilitator.name} /></td><td>{facilitator.email}</td><td className="max-w-64">{assigned.length ? assigned.map((course) => course.title).join(", ") : "Unassigned"}</td><td>{assigned.reduce((total, course) => total + course.students, 0)}</td><td><StatusPill>{facilitator.status}</StatusPill></td><td>{facilitator.lastActive}</td><td><button className={buttonGhostSmall} type="button" onClick={() => setManagedFacilitator(facilitator)}>Manage</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {inviteOpen ? (
        <Modal size="wide" busy={isCreating} title={`Create a ${tab === "students" ? "student" : "facilitator"}`} subtitle="The account becomes active immediately and the user receives the credentials created here." onClose={() => { if (!isCreating) setInviteOpen(false); }}>
          <form className="grid gap-4" onSubmit={createAccount} aria-busy={isCreating}>
            <div className="grid gap-4 sm:grid-cols-2"><TextField name="firstName" label="First name" /><TextField name="lastName" label="Last name" /></div>
            <TextField name="email" label="Email address" type="email" />
            <TextField name="phoneNumber" label="Phone number" type="tel" required={false} />
            <div><label className={fieldLabel} htmlFor="people-password">Temporary password</label><input id="people-password" name="password" className={`${textInput} w-full`} type="text" defaultValue="SecurePass123!" required /><p className="mt-1.5 text-xs text-muted">Users who sign in with this temporary password are reminded to change it immediately.</p></div>
            {tab === "students" ? <div><label className={fieldLabel} htmlFor="people-cohort">Cohort</label><CustomSelect id="people-cohort" name="cohortId" className={selectInput}><option value="">Self-paced / assign later</option>{cohorts.filter((cohort) => cohort.status !== "Archived").map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}</CustomSelect></div> : null}
            <CourseAssignmentField courses={courses} />
            <button className={`${button} mt-2 w-full`} type="submit" disabled={isCreating}>
              {isCreating ? <><Spinner />Creating account…</> : <><Icon name="plus" />Create active account</>}
            </button>
          </form>
        </Modal>
      ) : null}

      {managedFacilitator ? (
        <Modal size="drawer" busy={isSavingAssignment} title={`Manage ${managedFacilitator.name}`} subtitle="Update profile permissions and the courses this facilitator can manage." onClose={() => setManagedFacilitator(null)}>
          <form className="grid gap-4" onSubmit={updateFacilitator} aria-busy={isSavingAssignment}>
            <TextField name="name" label="Full name" defaultValue={managedFacilitator.name} />
            <TextField name="email" label="Email address" type="email" defaultValue={managedFacilitator.email} />
            <CourseAssignmentField courses={courses} selectedIds={managedFacilitator.courseIds} />
            <label className="flex gap-3 text-sm"><input name="canGrade" type="checkbox" defaultChecked={managedFacilitator.canGrade} className="accent-[var(--accent)]" />Allow assessment grading and submission approval.</label>
            <button className={`${button} mt-2 w-full`} type="submit" disabled={isSavingAssignment}>{isSavingAssignment ? <><Spinner />Saving facilitator…</> : "Save facilitator"}</button>
          </form>
        </Modal>
      ) : null}

      {managedStudent ? (
        <Modal size="drawer" busy={isSavingAssignment} title={`Assign ${managedStudent.name}`} subtitle="Add this existing student to courses and a cohort. The cohort's course is enrolled automatically." onClose={() => setManagedStudent(null)}>
          <form className="grid gap-4" onSubmit={updateStudent} aria-busy={isSavingAssignment}>
            <div className="rounded-xl bg-surface-2 px-4 py-3 text-sm"><b>{managedStudent.email}</b><span className="mt-1 block text-muted">Existing account · no new invitation will be sent</span></div>
            <div><label className={fieldLabel} htmlFor="manage-student-cohort">Cohort</label><CustomSelect id="manage-student-cohort" name="cohortId" className={selectInput} defaultValue={managedStudent.cohortId || ""}><option value="">Self-paced / assign later</option>{cohorts.filter((cohort) => cohort.status !== "Archived").map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}</CustomSelect></div>
            <CourseAssignmentField courses={courses} selectedIds={managedStudent.courseIds} />
            <button className={`${button} mt-2 w-full`} type="submit" disabled={isSavingAssignment}>{isSavingAssignment ? <><Spinner />Saving assignments…</> : <><Icon name="check" />Save assignments</>}</button>
          </form>
        </Modal>
      ) : null}
    </View>
  );
}

function Spinner() {
  return <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />;
}

function LoadingLabel({ label }: { label: string }) {
  return <span className="inline-flex items-center gap-2 text-sm text-muted" role="status"><Spinner />{label}</span>;
}

function TableMessage({ children }: { children: React.ReactNode }) {
  return <tr><td colSpan={7}><div className="grid min-h-40 place-items-center p-6">{children}</div></td></tr>;
}

function PeopleTableSkeleton() {
  return <>{Array.from({ length: 4 }, (_, row) => <tr key={row} aria-hidden="true" className="animate-pulse"><td><div className="flex items-center gap-3"><span className="size-9 rounded-full bg-surface-2" /><span className="h-4 w-28 rounded bg-surface-2" /></div></td>{Array.from({ length: 5 }, (_, cell) => <td key={cell}><span className="block h-4 rounded bg-surface-2" style={{ width: `${68 + ((row + cell) % 3) * 10}%` }} /></td>)}<td><span className="block h-9 w-16 rounded-full bg-surface-2" /></td></tr>)}</>;
}

function PeopleEmptyState({ kind, search, onCreate }: { kind: PeopleTab; search: string; onCreate: () => void }) {
  const singular = kind === "students" ? "student" : "facilitator";
  if (search) return <div className="grid max-w-sm justify-items-center gap-2 py-7 text-center"><span className="grid size-12 place-items-center rounded-full bg-surface-2"><Icon name="search" className="size-5 text-muted" /></span><b>No {kind} found</b><p className="text-sm text-muted">No {singular} matches “{search}”. Try a different name or email.</p></div>;
  return <div className="grid max-w-md justify-items-center gap-3 py-8 text-center"><span className="grid size-14 place-items-center rounded-full bg-surface-2"><Icon name="users" className="size-6 text-muted" /></span><div><b className="text-lg">No {kind} yet</b><p className="mt-1 text-sm text-muted">Create the first {singular} account to start building your learning workspace.</p></div><button className={buttonGhostSmall} type="button" onClick={onCreate}><Icon name="plus" />Create {singular}</button></div>;
}

function Person({ name }: { name: string }) {
  return <div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-hq-red-ink text-xs font-bold text-hq-bone">{initials(name)}</span><b>{name}</b></div>;
}

function StatusPill({ children, disabled = false }: { children: string; disabled?: boolean }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-[99px] px-2.5 py-1 text-xs font-semibold ${disabled ? "bg-hq-red/10 text-accent-text" : "bg-surface-2"}`}><i className={`size-1.5 rounded-full ${disabled ? "bg-accent" : "bg-reward"}`} />{children}</span>;
}

function TextField({ name, label, type = "text", defaultValue, required = true }: { name: string; label: string; type?: string; defaultValue?: string; required?: boolean }) {
  return <div><label className={fieldLabel} htmlFor={`people-${name}`}>{label}</label><input id={`people-${name}`} name={name} className={`${textInput} w-full`} type={type} defaultValue={defaultValue} required={required} /></div>;
}

function CourseAssignmentField({ courses, selectedIds = [] }: { courses: ManagedCourse[]; selectedIds?: string[] }) {
  return (
    <fieldset>
      <legend className={fieldLabel}>Course assignments</legend>
      <div className="grid max-h-48 gap-2 overflow-y-auto rounded-xl border border-line p-3">
        {courses.filter((course) => course.status !== "Archived").length === 0 ? <p className="py-2 text-sm text-muted">No courses are available yet. You can assign courses later.</p> : courses.filter((course) => course.status !== "Archived").map((course) => (
          <label key={course.id} className="flex items-start gap-3 rounded-lg p-2 text-sm hover:bg-surface-2">
            <input name="courseIds" value={course.id} type="checkbox" defaultChecked={selectedIds.includes(course.id)} className="mt-0.5 accent-[var(--accent)]" />
            <span><b className="block">{course.title}</b><span className="text-xs text-muted">{course.status} · {course.modules.length} modules</span></span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
