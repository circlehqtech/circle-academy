import { useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { View } from "../../components/View";
import { useToast } from "../../contexts/ToastContext";
import { useWorkspace } from "../../features/workspace/useWorkspace";
import type { AssessmentRecord } from "../../types/workspace";
import { button, buttonGhostSmall, fieldLabel, selectInput, table, tableWrap, textInput } from "../../styles";

export function AssessmentsPage() {
  const { toast } = useToast();
  const { assessments, courses, saveAssessment, duplicateAssessment, archiveAssessment } = useWorkspace();
  const [editing, setEditing] = useState<AssessmentRecord | "new" | null>(null);

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const current = editing === "new" ? null : editing;
    saveAssessment({
      id: current?.id,
      title: String(form.get("title")),
      courseId: String(form.get("courseId")),
      questions: Number(form.get("questions")),
      passingScore: Number(form.get("passingScore")),
      attempts: Number(form.get("attempts")),
      status: String(form.get("status")) as AssessmentRecord["status"],
    });
    toast(current ? "Assessment updated." : "Assessment created and ready for questions.");
    setEditing(null);
  };

  return (
    <View>
      <PageHeader description="Build assessments with explicit scoring, attempts, publishing state, and a course connection the backend can model." actionLabel="Create assessment" onAction={() => setEditing("new")} />
      <div className={tableWrap}><table className={table}><thead><tr><th>Assessment</th><th>Course</th><th>Questions</th><th>Passing score</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{assessments.map((assessment) => <tr key={assessment.id}><td><b>{assessment.title}</b></td><td>{courses.find((course) => course.id === assessment.courseId)?.title ?? "Unassigned"}</td><td>{assessment.questions} questions</td><td>{assessment.passingScore}%</td><td><span className="rounded-[99px] bg-surface-2 px-2.5 py-1 text-xs font-semibold">{assessment.status}</span></td><td><div className="flex flex-wrap justify-end gap-2"><button className={buttonGhostSmall} type="button" onClick={() => setEditing(assessment)}>Edit</button><button className={buttonGhostSmall} type="button" onClick={() => { duplicateAssessment(assessment.id); toast("Assessment duplicated as a draft."); }}>Duplicate</button>{assessment.status !== "Archived" ? <button className={buttonGhostSmall} type="button" onClick={() => { archiveAssessment(assessment.id); toast("Assessment archived."); }}>Archive</button> : null}</div></td></tr>)}</tbody></table></div>
      {editing ? <AssessmentModal editing={editing} courses={courses} onClose={() => setEditing(null)} onSubmit={save} /> : null}
    </View>
  );
}

function AssessmentModal({ editing, courses, onClose, onSubmit }: { editing: AssessmentRecord | "new"; courses: ReturnType<typeof useWorkspace>["courses"]; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const item = editing === "new" ? null : editing;
  return <Modal title={item ? `Edit ${item.title}` : "Create an assessment"} subtitle="Configure delivery rules now; question content can be added next." onClose={onClose}><form className="grid gap-4" onSubmit={onSubmit}><div><label className={fieldLabel}>Assessment title</label><input name="title" className={`${textInput} w-full`} defaultValue={item?.title} required /></div><div><label className={fieldLabel}>Course</label><select name="courseId" className={selectInput} defaultValue={item?.courseId}>{courses.filter((course) => course.status !== "Archived").map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></div><div className="grid gap-4 sm:grid-cols-3"><div><label className={fieldLabel}>Questions</label><input name="questions" className={`${textInput} w-full`} type="number" min="1" defaultValue={item?.questions ?? 10} /></div><div><label className={fieldLabel}>Passing score</label><input name="passingScore" className={`${textInput} w-full`} type="number" min="0" max="100" defaultValue={item?.passingScore ?? 80} /></div><div><label className={fieldLabel}>Attempts</label><input name="attempts" className={`${textInput} w-full`} type="number" min="1" defaultValue={item?.attempts ?? 3} /></div></div><div><label className={fieldLabel}>Status</label><select name="status" className={selectInput} defaultValue={item?.status ?? "Draft"}><option>Draft</option><option>Scheduled</option><option>Published</option><option>Archived</option></select></div><button className={button} type="submit">{item ? "Save assessment" : "Create assessment"}</button></form></Modal>;
}
