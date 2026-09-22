import { useState, type FormEvent } from "react";
import { Icon } from "../../components/Icon";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { View } from "../../components/View";
import { useToast } from "../../contexts/ToastContext";
import { useWorkspace } from "../../features/workspace/useWorkspace";
import type { LiveClassRecord } from "../../types/workspace";
import { button, buttonGhostSmall, buttonSmall, card, fieldLabel, selectInput, textInput } from "../../styles";

export function ClassesPage() {
  const { toast } = useToast();
  const { liveClasses, courses, facilitators, saveLiveClass, startLiveClass, duplicateLiveClass, cancelLiveClass } = useWorkspace();
  const [editing, setEditing] = useState<LiveClassRecord | "new" | null>(null);
  const [actionsFor, setActionsFor] = useState<string | null>(null);

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const existing = editing === "new" ? null : editing;
    saveLiveClass({
      id: existing?.id,
      title: String(form.get("title")),
      courseId: String(form.get("courseId")),
      date: String(form.get("date")),
      time: String(form.get("time")),
      duration: Number(form.get("duration")),
      hostId: String(form.get("hostId")),
      meetingUrl: String(form.get("meetingUrl")),
      status: String(form.get("status")) as LiveClassRecord["status"],
    });
    toast(existing ? "Class updated and participants notified." : "Live class scheduled.");
    setEditing(null);
  };

  return (
    <View>
      <PageHeader description="Schedule live classes, choose a host, manage meeting links, and expose the same event to students and facilitators." actionLabel="Schedule class" onAction={() => setEditing("new")} />
      <div className="grid gap-4">
        {liveClasses.map((item) => {
          const course = courses.find((entry) => entry.id === item.courseId);
          const host = facilitators.find((entry) => entry.id === item.hostId);
          const canStart = item.status === "Ready" || item.status === "Scheduled";
          return (
            <article key={item.id} className={`${card} relative grid items-center gap-4 md:grid-cols-[auto_minmax(0,1fr)_160px_150px_auto]`}>
              <span className={`grid size-12 place-items-center rounded-full ${item.status === "Live" || item.status === "Ready" ? "bg-accent text-white" : "bg-surface-2"}`}><Icon name="video" /></span>
              <div><b className="block text-base">{item.title}</b><span className="text-sm text-muted">{course?.title ?? "Unassigned course"} · {item.status}</span></div>
              <div><span className="block text-xs text-muted">When</span><b className="text-sm">{item.date}, {item.time}</b></div>
              <div><span className="block text-xs text-muted">Host</span><b className="text-sm">{host?.name ?? "Unassigned"}</b></div>
              <div className="flex gap-2"><button className={canStart ? buttonSmall : buttonGhostSmall} type="button" disabled={item.status === "Cancelled" || item.status === "Completed"} onClick={() => { if (canStart) { startLiveClass(item.id); toast("Class is live. Host controls opened."); } else { setEditing(item); } }}>{item.status === "Live" ? "Manage live" : canStart ? "Start" : "Edit"}</button><button className="grid size-9 place-items-center rounded-full hover:bg-surface-2" type="button" aria-label={`More actions for ${item.title}`} onClick={() => setActionsFor((current) => current === item.id ? null : item.id)}><Icon name="more" /></button></div>
              {actionsFor === item.id ? <div className="absolute right-4 bottom-14 z-10 grid min-w-36 rounded-xl border border-line bg-background p-1 shadow-xl"><button className="rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2" type="button" onClick={() => { setEditing(item); setActionsFor(null); }}>Edit details</button><button className="rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2" type="button" onClick={() => { duplicateLiveClass(item.id); setActionsFor(null); toast("Class duplicated as a draft."); }}>Duplicate</button>{item.status !== "Cancelled" ? <button className="rounded-lg px-3 py-2 text-left text-sm text-accent-text hover:bg-surface-2" type="button" onClick={() => { cancelLiveClass(item.id); setActionsFor(null); toast("Class cancelled."); }}>Cancel class</button> : null}</div> : null}
            </article>
          );
        })}
      </div>

      {editing ? <ClassModal editing={editing} courses={courses} facilitators={facilitators} onClose={() => setEditing(null)} onSubmit={save} /> : null}
    </View>
  );
}

function ClassModal({ editing, courses, facilitators, onClose, onSubmit }: { editing: LiveClassRecord | "new"; courses: ReturnType<typeof useWorkspace>["courses"]; facilitators: ReturnType<typeof useWorkspace>["facilitators"]; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const item = editing === "new" ? null : editing;
  return <Modal title={item ? `Edit ${item.title}` : "Schedule a live class"} subtitle="Students and the assigned facilitator will see this schedule immediately." onClose={onClose}><form className="grid gap-4" onSubmit={onSubmit}><div><label className={fieldLabel}>Class title</label><input name="title" className={`${textInput} w-full`} defaultValue={item?.title} required /></div><div><label className={fieldLabel}>Course</label><select name="courseId" className={selectInput} defaultValue={item?.courseId}>{courses.filter((course) => course.status !== "Archived").map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></div><div className="grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel}>Date</label><input name="date" className={`${textInput} w-full`} type="date" defaultValue={item?.date ?? "2026-09-29"} required /></div><div><label className={fieldLabel}>Start time</label><input name="time" className={`${textInput} w-full`} type="time" defaultValue={item?.time ?? "16:00"} required /></div></div><div className="grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel}>Duration</label><select name="duration" className={selectInput} defaultValue={item?.duration ?? 90}><option value="60">60 minutes</option><option value="90">90 minutes</option><option value="120">120 minutes</option></select></div><div><label className={fieldLabel}>Host</label><select name="hostId" className={selectInput} defaultValue={item?.hostId}>{facilitators.map((facilitator) => <option key={facilitator.id} value={facilitator.id}>{facilitator.name}</option>)}</select></div></div><div><label className={fieldLabel}>Zoom meeting URL</label><input name="meetingUrl" className={`${textInput} w-full`} type="url" defaultValue={item?.meetingUrl} placeholder="https://zoom.us/j/…" /></div><div><label className={fieldLabel}>Status</label><select name="status" className={selectInput} defaultValue={item?.status ?? "Scheduled"}><option>Draft</option><option>Scheduled</option><option>Ready</option><option>Completed</option><option>Cancelled</option></select></div><button className={button} type="submit">{item ? "Save class" : "Schedule class"}</button></form></Modal>;
}
