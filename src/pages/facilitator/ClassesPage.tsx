import { useState, type FormEvent } from "react";
import { Icon } from "../../components/Icon";
import { Modal } from "../../components/ui/Modal";
import { View } from "../../components/View";
import { useToast } from "../../contexts/ToastContext";
import { useWorkspace } from "../../features/workspace/useWorkspace";
import type { LiveClassRecord } from "../../types/workspace";
import { button, buttonGhostSmall, buttonSmall, card, fieldLabel, heading, selectInput, textInput } from "../../styles";

export function FacilitatorClassesPage() {
  const { toast } = useToast();
  const { liveClasses, courses, saveLiveClass, startLiveClass } = useWorkspace();
  const [editing, setEditing] = useState<LiveClassRecord | null>(null);
  const assigned = liveClasses.filter((item) => item.hostId === "fac-kemi" && item.status !== "Cancelled");

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    saveLiveClass({
      ...editing,
      title: String(form.get("title")),
      date: String(form.get("date")),
      time: String(form.get("time")),
      meetingUrl: String(form.get("meetingUrl")),
      status: String(form.get("status")) as LiveClassRecord["status"],
    });
    toast("Class changes saved. Students now see the updated schedule.");
    setEditing(null);
  };

  return (
    <View>
      <div className="grid gap-8 min-[1021px]:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)]">
        <section>
          <h2 className={heading}>Assigned class schedule</h2>
          <div className="grid gap-3">
            {assigned.map((item) => (
              <article key={item.id} className={`${card} flex flex-wrap items-center gap-4`}>
                <span className={`grid size-11 place-items-center rounded-full ${item.status === "Live" || item.status === "Ready" ? "bg-accent text-white" : "bg-surface-2"}`}><Icon name="video" /></span>
                <div className="min-w-52 flex-1"><b className="block">{item.title}</b><span className="text-sm text-muted">{courses.find((course) => course.id === item.courseId)?.title} · {item.date}, {item.time}</span></div>
                <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold">{item.status}</span>
                <button className={item.status === "Ready" || item.status === "Scheduled" ? buttonSmall : buttonGhostSmall} type="button" onClick={() => { if (item.status === "Ready" || item.status === "Scheduled") { startLiveClass(item.id); toast("Class is now live. Opening host controls."); } else { setEditing(item); } }}>{item.status === "Live" ? "Manage live" : item.status === "Ready" || item.status === "Scheduled" ? "Start class" : "Edit"}</button>
              </article>
            ))}
            {assigned.length === 0 ? <div className={`${card} text-center text-muted`}>No classes are assigned to this facilitator yet.</div> : null}
          </div>
        </section>
        <section>
          <div className={card}>
            <h2 className={heading}>Backend flow to test</h2>
            <ol className="grid gap-3 text-sm text-muted">
              <li><b className="text-foreground">1.</b> Admin schedules a class and assigns Kemi as host.</li>
              <li><b className="text-foreground">2.</b> It appears here after switching to Facilitator.</li>
              <li><b className="text-foreground">3.</b> Starting the class updates its shared status to Live.</li>
            </ol>
          </div>
        </section>
      </div>

      {editing ? <Modal title={`Edit ${editing.title}`} subtitle="Changes are shared with the admin and student schedule." onClose={() => setEditing(null)}><form className="grid gap-4" onSubmit={save}><div><label className={fieldLabel}>Title</label><input name="title" className={`${textInput} w-full`} defaultValue={editing.title} /></div><div className="grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel}>Date</label><input name="date" className={`${textInput} w-full`} type="date" defaultValue={editing.date} /></div><div><label className={fieldLabel}>Time</label><input name="time" className={`${textInput} w-full`} type="time" defaultValue={editing.time} /></div></div><div><label className={fieldLabel}>Meeting URL</label><input name="meetingUrl" className={`${textInput} w-full`} type="url" defaultValue={editing.meetingUrl} /></div><div><label className={fieldLabel}>Status</label><select name="status" className={selectInput} defaultValue={editing.status}><option>Draft</option><option>Scheduled</option><option>Ready</option><option>Live</option><option>Completed</option></select></div><button className={button} type="submit"><Icon name="save" />Save class</button></form></Modal> : null}
    </View>
  );
}
