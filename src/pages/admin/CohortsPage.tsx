import { useState, type FormEvent } from "react";
import { Icon } from "../../components/Icon";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { View } from "../../components/View";
import { useToast } from "../../contexts/ToastContext";
import { useWorkspace } from "../../features/workspace/useWorkspace";
import type { CohortRecord } from "../../types/workspace";
import { button, buttonGhostSmall, card, fieldLabel, selectInput, textInput } from "../../styles";

const EMPTY_COHORT: Omit<CohortRecord, "id"> = {
  name: "",
  starts: "2026-10-01",
  ends: "2026-11-30",
  studentCount: 0,
  courseIds: [],
  facilitatorIds: [],
  status: "Draft",
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export function CohortsPage() {
  const { toast } = useToast();
  const { cohorts, courses, facilitators, saveCohort, duplicateCohort, archiveCohort } = useWorkspace();
  const [editing, setEditing] = useState<CohortRecord | "new" | null>(null);
  const [actionsFor, setActionsFor] = useState<string | null>(null);

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const existing = editing === "new" ? null : editing;
    saveCohort({
      id: existing?.id,
      name: String(form.get("name")),
      starts: String(form.get("starts")),
      ends: String(form.get("ends")),
      studentCount: existing?.studentCount ?? 0,
      courseIds: form.getAll("courseIds").map(String),
      facilitatorIds: form.getAll("facilitatorIds").map(String),
      status: String(form.get("status")) as CohortRecord["status"],
    });
    toast(existing ? "Cohort updated." : "Cohort created and ready for enrolment.");
    setEditing(null);
  };

  return (
    <View>
      <PageHeader description="Group students into delivery periods, assign courses and facilitators, and monitor each cohort as one learning unit." actionLabel="Create cohort" onAction={() => setEditing("new")} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cohorts.map((cohort) => (
          <article key={cohort.id} className={`${card} relative`}>
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-hq-red-ink text-sm font-bold text-hq-bone">{cohort.name.match(/\d+/)?.[0] ?? "HQ"}</span>
              <span className="rounded-[99px] bg-surface-2 px-2.5 py-1 text-xs font-semibold">{cohort.status}</span>
            </div>
            <h2 className="mt-5 text-xl font-[680]">{cohort.name}</h2>
            <p className="mt-1 text-sm text-muted">{dateLabel(cohort.starts)} – {dateLabel(cohort.ends)}</p>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-line py-4">
              <div><dt className="text-xs text-muted">Students</dt><dd className="text-xl font-bold">{cohort.studentCount}</dd></div>
              <div><dt className="text-xs text-muted">Courses</dt><dd className="text-xl font-bold">{cohort.courseIds.length}</dd></div>
            </dl>
            <div className="mt-4 flex gap-2">
              <button className={buttonGhostSmall} type="button" onClick={() => setEditing(cohort)}>Manage</button>
              <button className="grid size-9 place-items-center rounded-full hover:bg-surface-2" type="button" aria-label={`More actions for ${cohort.name}`} aria-expanded={actionsFor === cohort.id} onClick={() => setActionsFor((current) => current === cohort.id ? null : cohort.id)}><Icon name="more" /></button>
            </div>
            {actionsFor === cohort.id ? (
              <div className="absolute right-4 bottom-14 z-10 grid min-w-36 rounded-xl border border-line bg-background p-1 shadow-xl">
                <button className="rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2" type="button" onClick={() => { duplicateCohort(cohort.id); setActionsFor(null); toast("Cohort duplicated as a draft."); }}>Duplicate</button>
                {cohort.status !== "Archived" ? <button className="rounded-lg px-3 py-2 text-left text-sm text-accent-text hover:bg-surface-2" type="button" onClick={() => { archiveCohort(cohort.id); setActionsFor(null); toast("Cohort archived."); }}>Archive</button> : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {editing ? (
        <Modal title={editing === "new" ? "Create a cohort" : `Manage ${editing.name}`} subtitle="Set delivery dates and connect the cohort to its courses and facilitator team." onClose={() => setEditing(null)}>
          <form className="grid gap-4" onSubmit={save}>
            <div><label className={fieldLabel} htmlFor="cohort-name">Cohort name</label><input id="cohort-name" name="name" className={`${textInput} w-full`} defaultValue={editing === "new" ? EMPTY_COHORT.name : editing.name} placeholder="e.g. Cohort 9" required /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel} htmlFor="cohort-starts">Starts</label><input id="cohort-starts" name="starts" className={`${textInput} w-full`} type="date" defaultValue={editing === "new" ? EMPTY_COHORT.starts : editing.starts} required /></div><div><label className={fieldLabel} htmlFor="cohort-ends">Ends</label><input id="cohort-ends" name="ends" className={`${textInput} w-full`} type="date" defaultValue={editing === "new" ? EMPTY_COHORT.ends : editing.ends} required /></div></div>
            <div><label className={fieldLabel} htmlFor="cohort-status">Status</label><select id="cohort-status" name="status" className={selectInput} defaultValue={editing === "new" ? EMPTY_COHORT.status : editing.status}><option>Draft</option><option>Enrolling</option><option>Active</option><option>Completed</option><option>Archived</option></select></div>
            <CheckList legend="Courses" name="courseIds" items={courses.filter((course) => course.status !== "Archived").map((course) => ({ id: course.id, label: course.title }))} selected={editing === "new" ? [] : editing.courseIds} />
            <CheckList legend="Facilitator team" name="facilitatorIds" items={facilitators.map((facilitator) => ({ id: facilitator.id, label: facilitator.name }))} selected={editing === "new" ? [] : editing.facilitatorIds} />
            <button className={button} type="submit">{editing === "new" ? "Create cohort" : "Save cohort"}</button>
          </form>
        </Modal>
      ) : null}
    </View>
  );
}

function CheckList({ legend, name, items, selected }: { legend: string; name: string; items: Array<{ id: string; label: string }>; selected: string[] }) {
  return <fieldset><legend className={fieldLabel}>{legend}</legend><div className="grid max-h-40 gap-2 overflow-y-auto rounded-xl border border-line p-3 sm:grid-cols-2">{items.map((item) => <label key={item.id} className="flex gap-2 text-sm"><input name={name} value={item.id} type="checkbox" defaultChecked={selected.includes(item.id)} className="accent-[var(--accent)]" />{item.label}</label>)}</div></fieldset>;
}
