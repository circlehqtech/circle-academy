import { useMemo, useState, type FormEvent } from "react";
import { Icon } from "../components/Icon";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { View } from "../components/View";
import { useToast } from "../contexts/ToastContext";
import { useWorkspace } from "../features/workspace/useWorkspace";
import { downloadCsv } from "../utils/csv";
import type { FacilitatorRecord, ManagedCourse } from "../types/workspace";
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
  const { students, facilitators, courses, cohorts, saveStudent, saveFacilitator } = useWorkspace();
  const [tab, setTab] = useState<PeopleTab>("students");
  const [query, setQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [managedFacilitator, setManagedFacilitator] = useState<FacilitatorRecord | null>(null);

  const visibleStudents = useMemo(
    () => students.filter((student) => `${student.name} ${student.email}`.toLowerCase().includes(query.toLowerCase())),
    [query, students],
  );
  const visibleFacilitators = useMemo(
    () => facilitators.filter((facilitator) => `${facilitator.name} ${facilitator.email}`.toLowerCase().includes(query.toLowerCase())),
    [facilitators, query],
  );

  const invite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const courseIds = form.getAll("courseIds").map(String);

    if (tab === "facilitators") {
      saveFacilitator({ name, email, courseIds, canGrade: form.get("canGrade") === "on" });
      toast(`${name} was invited and assigned to ${courseIds.length} course${courseIds.length === 1 ? "" : "s"}.`);
    } else {
      saveStudent({ name, email, cohortId: String(form.get("cohortId") ?? ""), courseIds });
      toast(`${name} was invited and enrolled.`);
    }
    setInviteOpen(false);
  };

  const updateFacilitator = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!managedFacilitator) return;
    const form = new FormData(event.currentTarget);
    saveFacilitator({
      id: managedFacilitator.id,
      name: String(form.get("name") ?? managedFacilitator.name),
      email: String(form.get("email") ?? managedFacilitator.email),
      courseIds: form.getAll("courseIds").map(String),
      canGrade: form.get("canGrade") === "on",
    });
    toast("Facilitator access and course assignments updated.");
    setManagedFacilitator(null);
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
        description="Invite people, control platform access, and connect every student and facilitator to the courses they manage."
        actionLabel={`Invite ${tab === "students" ? "student" : "facilitator"}`}
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
        <button className={buttonGhostSmall} type="button" onClick={exportPeople}>Export CSV</button>
      </div>

      <div className={tableWrap}>
        <table className={table}>
          <thead><tr><th>{tab === "students" ? "Student" : "Facilitator"}</th><th>Email</th><th>{tab === "students" ? "Cohort" : "Assigned courses"}</th><th>{tab === "students" ? "Enrolment" : "Students"}</th><th>Status</th><th>Last active</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {tab === "students" ? visibleStudents.map((student) => (
              <tr key={student.id}>
                <td><Person name={student.name} /></td><td>{student.email}</td><td>{cohorts.find((cohort) => cohort.id === student.cohortId)?.name ?? "Self-paced"}</td><td>{student.courseIds.length} active</td><td><StatusPill>{student.learningStatus}</StatusPill></td><td>{student.lastActive}</td><td><button className={buttonGhostSmall} type="button" onClick={() => toast(`${student.name}'s learner profile opened.`)}>View</button></td>
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
        <Modal title={`Invite a ${tab === "students" ? "student" : "facilitator"}`} subtitle="Create the platform account and connect it to the right learning workspace." onClose={() => setInviteOpen(false)}>
          <form className="grid gap-4" onSubmit={invite}>
            <TextField name="name" label="Full name" />
            <TextField name="email" label="Email address" type="email" />
            {tab === "students" ? <div><label className={fieldLabel} htmlFor="invite-cohort">Cohort</label><select id="invite-cohort" name="cohortId" className={selectInput} required>{cohorts.filter((cohort) => cohort.status !== "Archived").map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}</select></div> : null}
            <CourseAssignmentField courses={courses} />
            {tab === "facilitators" ? <label className="flex gap-3 text-sm"><input name="canGrade" type="checkbox" defaultChecked className="accent-[var(--accent)]" />Allow assessment grading and submission approval.</label> : null}
            <button className={`${button} mt-2 w-full`} type="submit"><Icon name="mail" />Send invitation</button>
          </form>
        </Modal>
      ) : null}

      {managedFacilitator ? (
        <Modal title={`Manage ${managedFacilitator.name}`} subtitle="Update profile permissions and the courses this facilitator can manage." onClose={() => setManagedFacilitator(null)}>
          <form className="grid gap-4" onSubmit={updateFacilitator}>
            <TextField name="name" label="Full name" defaultValue={managedFacilitator.name} />
            <TextField name="email" label="Email address" type="email" defaultValue={managedFacilitator.email} />
            <CourseAssignmentField courses={courses} selectedIds={managedFacilitator.courseIds} />
            <label className="flex gap-3 text-sm"><input name="canGrade" type="checkbox" defaultChecked={managedFacilitator.canGrade} className="accent-[var(--accent)]" />Allow assessment grading and submission approval.</label>
            <button className={`${button} mt-2 w-full`} type="submit">Save facilitator</button>
          </form>
        </Modal>
      ) : null}
    </View>
  );
}

function Person({ name }: { name: string }) {
  return <div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-hq-red-ink text-xs font-bold text-hq-bone">{initials(name)}</span><b>{name}</b></div>;
}

function StatusPill({ children }: { children: string }) {
  return <span className="rounded-[99px] bg-surface-2 px-2.5 py-1 text-xs font-semibold">{children}</span>;
}

function TextField({ name, label, type = "text", defaultValue }: { name: string; label: string; type?: string; defaultValue?: string }) {
  return <div><label className={fieldLabel} htmlFor={`people-${name}`}>{label}</label><input id={`people-${name}`} name={name} className={`${textInput} w-full`} type={type} defaultValue={defaultValue} required /></div>;
}

function CourseAssignmentField({ courses, selectedIds = [] }: { courses: ManagedCourse[]; selectedIds?: string[] }) {
  return (
    <fieldset>
      <legend className={fieldLabel}>Course assignments</legend>
      <div className="grid max-h-48 gap-2 overflow-y-auto rounded-xl border border-line p-3">
        {courses.filter((course) => course.status !== "Archived").map((course) => (
          <label key={course.id} className="flex items-start gap-3 rounded-lg p-2 text-sm hover:bg-surface-2">
            <input name="courseIds" value={course.id} type="checkbox" defaultChecked={selectedIds.includes(course.id)} className="mt-0.5 accent-[var(--accent)]" />
            <span><b className="block">{course.title}</b><span className="text-xs text-muted">{course.status} · {course.modules.length} modules</span></span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
