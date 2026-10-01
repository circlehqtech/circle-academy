import { useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { asRecord, collection, extractId, toAssessment, unwrap } from "../../api/adapters";
import { queryKeys } from "../../api/endpoints";
import { lmsApi } from "../../api/lmsApi";
import { Icon } from "../../components/Icon";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { EmptyState } from "../../components/ui/EmptyState";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { View } from "../../components/View";
import { useToast } from "../../contexts/ToastContext";
import { useWorkspace } from "../../features/workspace/useWorkspace";
import { button, buttonGhostSmall, fieldLabel, selectInput, table, tableWrap, textInput } from "../../styles";
import type { AssessmentRecord } from "../../types/workspace";
import { createEntityId } from "../../utils/id";

type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "WRITTEN_RESPONSE";
type QuestionDraft = { localId: string; id?: string; prompt: string; type: QuestionType; points: number; options: Array<{ id?: string; label: string; isCorrect: boolean }> };
type AssessmentDraft = { id?: string; courseId: string; title: string; description: string; moduleId: string; lessonId: string; shuffleQuestions: boolean; passingScore: number; attempts: number; status: "Draft" | "Published" | "Archived"; questions: QuestionDraft[] };

const newQuestion = (): QuestionDraft => ({ localId: createEntityId("question"), prompt: "", type: "MULTIPLE_CHOICE", points: 1, options: [{ label: "", isCorrect: true }, { label: "", isCorrect: false }] });

function titleStatus(value: unknown): AssessmentDraft["status"] {
  const status = String(value ?? "DRAFT").toUpperCase();
  return status === "PUBLISHED" ? "Published" : status === "ARCHIVED" ? "Archived" : "Draft";
}

function readAssessment(value: unknown, fallback: AssessmentDraft): AssessmentDraft {
  const outer = asRecord(unwrap(value));
  const record = asRecord(outer.assessment ?? outer);
  const questionValues = collection(record.questions ?? outer.questions, "questions");
  return {
    ...fallback,
    id: String(record.id ?? fallback.id ?? "") || undefined,
    courseId: String(record.courseId ?? fallback.courseId), title: String(record.title ?? fallback.title), description: String(record.description ?? ""), moduleId: String(record.moduleId ?? ""), lessonId: String(record.lessonId ?? ""), shuffleQuestions: record.shuffleQuestions === true,
    passingScore: Number(record.passPercentage ?? fallback.passingScore), attempts: Number(record.attemptLimit ?? fallback.attempts), status: titleStatus(record.status ?? fallback.status),
    questions: questionValues.map((questionValue) => {
      const questionOuter = asRecord(questionValue);
      const question = asRecord(questionOuter.question ?? questionOuter);
      const rawType = String(question.type ?? "MULTIPLE_CHOICE");
      const type: QuestionType = rawType === "WRITTEN" ? "WRITTEN_RESPONSE" : rawType === "TRUE_FALSE" ? "TRUE_FALSE" : rawType === "WRITTEN_RESPONSE" ? "WRITTEN_RESPONSE" : "MULTIPLE_CHOICE";
      return { localId: String(question.id ?? createEntityId("question")), id: String(question.id ?? "") || undefined, prompt: String(question.prompt ?? ""), type, points: Number(question.points ?? 1), options: collection(question.options ?? questionOuter.options, "options").map((optionValue) => { const optionOuter = asRecord(optionValue); const option = asRecord(optionOuter.option ?? optionOuter); return { id: String(option.id ?? "") || undefined, label: String(option.label ?? option.text ?? ""), isCorrect: option.isCorrect === true }; }) };
    }),
  };
}

export function AssessmentsPage() {
  const { toast } = useToast();
  const { courses } = useWorkspace();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<AssessmentDraft | null>(null);
  const [courseFilter, setCourseFilter] = useState("");
  const [loadingEditor, setLoadingEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState("");
  const activeCourses = useMemo(() => courses.filter((course) => course.status !== "Archived"), [courses]);
  const filteredCourseId = courseFilter || activeCourses[0]?.id || "";
  const assessmentQuery = useQuery({ queryKey: queryKeys.admin.assessments(filteredCourseId), queryFn: () => lmsApi.admin.assessments(filteredCourseId), enabled: Boolean(filteredCourseId), retry: false, refetchOnWindowFocus: false });
  const assessments = collection(assessmentQuery.data, "assessments").map((value) => toAssessment(value, filteredCourseId));
  const selectedCourse = courses.find((course) => course.id === draft?.courseId) ?? courses[0];
  const selectedModule = selectedCourse?.modules.find((module) => module.id === draft?.moduleId);
  const blankDraft = (): AssessmentDraft => { const course = activeCourses[0]; const module = course?.modules[0]; return { courseId: course?.id ?? "", title: "", description: "", moduleId: module?.id ?? "", lessonId: module?.lessons[0]?.id ?? "", shuffleQuestions: false, passingScore: 70, attempts: 0, status: "Draft", questions: [] }; };

  const openExisting = async (assessment: AssessmentRecord) => {
    const fallback = { ...blankDraft(), id: assessment.id, courseId: assessment.courseId, title: assessment.title, passingScore: assessment.passingScore, attempts: assessment.attempts, status: titleStatus(assessment.status) };
    setDraft(fallback); setLoadingEditor(true);
    try { setDraft(readAssessment(await lmsApi.admin.assessment(assessment.id), fallback)); }
    catch (failure) { toast(failure instanceof Error ? failure.message : "The assessment could not be loaded."); setDraft(null); }
    finally { setLoadingEditor(false); }
  };
  const updateQuestion = (localId: string, update: Partial<QuestionDraft>) => setDraft((current) => current ? { ...current, questions: current.questions.map((question) => question.localId === localId ? { ...question, ...update } : question) } : current);
  const changeQuestionType = (question: QuestionDraft, type: QuestionType) => updateQuestion(question.localId, { type, options: type === "WRITTEN_RESPONSE" ? [] : type === "TRUE_FALSE" ? [{ label: "True", isCorrect: true }, { label: "False", isCorrect: false }] : question.options.length ? question.options : [{ label: "", isCorrect: true }, { label: "", isCorrect: false }] });

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!draft || saving) return;
    if (!draft.courseId || !draft.title.trim()) { toast("Choose a course and add an assessment title."); return; }
    if (draft.status === "Published" && !draft.questions.length) { toast("Add at least one question before publishing."); return; }
    for (const [index, question] of draft.questions.entries()) {
      if (!question.prompt.trim()) { toast(`Add a prompt for question ${index + 1}.`); return; }
      if (question.type !== "WRITTEN_RESPONSE" && (question.options.length < 2 || question.options.some((option) => !option.label.trim()) || !question.options.some((option) => option.isCorrect))) { toast(`Question ${index + 1} needs at least two labelled options and one correct answer.`); return; }
    }
    setSaving(true);
    try {
      const metadata = { title: draft.title.trim(), description: draft.description.trim() || undefined, moduleId: draft.moduleId || undefined, lessonId: draft.lessonId || undefined, shuffleQuestions: draft.shuffleQuestions, passPercentage: draft.passingScore, attemptLimit: draft.attempts };
      const response = draft.id ? await lmsApi.admin.updateAssessment(draft.id, metadata) : await lmsApi.admin.createAssessment(draft.courseId, metadata);
      const assessmentId = draft.id ?? extractId(response); if (!assessmentId) throw new Error("The API did not return the assessment ID.");
      await lmsApi.admin.saveAssessmentContent(assessmentId, draft.questions.map((question, questionIndex) => ({ id: question.id, prompt: question.prompt.trim(), type: question.type, position: questionIndex + 1, points: question.points, options: question.options.map((option, optionIndex) => ({ id: option.id, label: option.label.trim(), isCorrect: option.isCorrect, position: optionIndex + 1 })) })));
      const existing = assessments.find((assessment) => assessment.id === assessmentId);
      if (!existing || titleStatus(existing.status) !== draft.status) await lmsApi.admin.setAssessmentStatus(assessmentId, draft.status.toUpperCase());
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.assessments(draft.courseId) }); setCourseFilter(draft.courseId); setDraft(null); toast(draft.id ? "Assessment and questions updated." : "Assessment and questions created.");
    } catch (failure) { toast(failure instanceof Error ? failure.message : "The assessment could not be saved."); }
    finally { setSaving(false); }
  };
  const duplicate = async (assessment: AssessmentRecord) => { setPendingId(assessment.id); try { await lmsApi.admin.duplicateAssessment(assessment.id); await queryClient.invalidateQueries({ queryKey: queryKeys.admin.assessments(assessment.courseId) }); toast("Assessment duplicated as a draft."); } catch (failure) { toast(failure instanceof Error ? failure.message : "The assessment could not be duplicated."); } finally { setPendingId(""); } };
  const archive = async (assessment: AssessmentRecord) => { setPendingId(assessment.id); try { await lmsApi.admin.setAssessmentStatus(assessment.id, "ARCHIVED"); await queryClient.invalidateQueries({ queryKey: queryKeys.admin.assessments(assessment.courseId) }); toast("Assessment archived."); } catch (failure) { toast(failure instanceof Error ? failure.message : "The assessment could not be archived."); } finally { setPendingId(""); } };

  return <View>
    <PageHeader description="Create scored assessments, author every question and option, then publish them to students." actionLabel="Create assessment" onAction={() => setDraft(blankDraft())} />
    <div className="mb-5 max-w-md"><label className={fieldLabel} htmlFor="assessment-course-filter">Course</label><CustomSelect id="assessment-course-filter" className={selectInput} value={filteredCourseId} onChange={(event) => setCourseFilter(event.target.value)}>{activeCourses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</CustomSelect></div>
    {assessmentQuery.isPending && filteredCourseId ? <div className="grid gap-3 rounded-[18px] border border-line p-5" role="status" aria-label="Loading assessments">{[1, 2, 3].map((item) => <span key={item} className="h-12 animate-pulse rounded-xl bg-surface-2" />)}</div> : assessmentQuery.isError ? <EmptyState icon="help" title="Assessments could not be loaded" description="Only this course's assessment request failed. Try it again without reloading the rest of the workspace." actionLabel="Try again" onAction={() => void assessmentQuery.refetch()} /> : <div className={tableWrap}><table className={`${table} ${assessments.length ? "" : "!min-w-0"}`}><thead><tr><th>Assessment</th><th>Course</th><th className={assessments.length ? undefined : "hidden sm:table-cell"}>Questions</th><th className={assessments.length ? undefined : "hidden md:table-cell"}>Passing score</th><th className={assessments.length ? undefined : "hidden lg:table-cell"}>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{assessments.length ? assessments.map((assessment) => <tr key={assessment.id}><td><b>{assessment.title}</b></td><td>{courses.find((course) => course.id === assessment.courseId)?.title ?? "Unassigned"}</td><td>{assessment.questions ? `${assessment.questions} questions` : <span className="text-sm text-muted">Open to view</span>}</td><td>{assessment.passingScore}%</td><td><span className="rounded-[99px] bg-surface-2 px-2.5 py-1 text-xs font-semibold">{assessment.status}</span></td><td><div className="flex flex-wrap justify-end gap-2"><button className={buttonGhostSmall} type="button" disabled={pendingId === assessment.id} onClick={() => void openExisting(assessment)}>Edit questions</button><button className={buttonGhostSmall} type="button" disabled={pendingId === assessment.id} onClick={() => void duplicate(assessment)}>Duplicate</button>{assessment.status !== "Archived" ? <button className={buttonGhostSmall} type="button" disabled={pendingId === assessment.id} onClick={() => void archive(assessment)}>{pendingId === assessment.id ? "Saving…" : "Archive"}</button> : null}</div></td></tr>) : <tr><td colSpan={6} className="!p-0"><EmptyState icon="inbox" title="No assessments for this course" description="Create an assessment, add its real questions and answer options, then publish it." actionLabel="Create assessment" onAction={() => setDraft(blankDraft())} className="border-0 bg-transparent" /></td></tr>}</tbody></table></div>}

    {draft ? <Modal size="drawer" busy={saving} title={draft.id ? `Edit ${draft.title}` : "Create an assessment"} subtitle="Assessment details and the complete question tree are saved together." onClose={() => { if (!saving) setDraft(null); }}><form className="grid gap-6" onSubmit={save} aria-busy={saving || loadingEditor}>
      {loadingEditor ? <div className="grid gap-3" role="status"><span className="h-12 animate-pulse rounded-xl bg-surface-2" /><span className="h-28 animate-pulse rounded-xl bg-surface-2" /></div> : <>
        <section className="grid gap-4"><div><label className={fieldLabel}>Assessment title</label><input className={`${textInput} w-full`} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required /></div><div><label className={fieldLabel}>Description</label><textarea className="min-h-20 w-full rounded-2xl border-[1.5px] border-line bg-surface p-4 outline-none focus:border-accent" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></div><div><label className={fieldLabel}>Course</label><CustomSelect className={selectInput} value={draft.courseId} disabled={Boolean(draft.id)} onChange={(event) => { const course = courses.find((item) => item.id === event.target.value); const module = course?.modules[0]; setDraft({ ...draft, courseId: event.target.value, moduleId: module?.id ?? "", lessonId: module?.lessons[0]?.id ?? "" }); }}>{activeCourses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</CustomSelect></div><div className="grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel}>Module</label><CustomSelect className={selectInput} value={draft.moduleId} onChange={(event) => { const module = selectedCourse?.modules.find((item) => item.id === event.target.value); setDraft({ ...draft, moduleId: event.target.value, lessonId: module?.lessons[0]?.id ?? "" }); }}><option value="">Course-wide assessment</option>{selectedCourse?.modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}</CustomSelect></div><div><label className={fieldLabel}>Lesson</label><CustomSelect className={selectInput} value={draft.lessonId} disabled={!draft.moduleId} onChange={(event) => setDraft({ ...draft, lessonId: event.target.value })}><option value="">No specific lesson</option>{selectedModule?.lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}</CustomSelect></div></div><div className="grid gap-4 sm:grid-cols-3"><div><label className={fieldLabel}>Passing score</label><input className={`${textInput} w-full`} type="number" min="0" max="100" value={draft.passingScore} onChange={(event) => setDraft({ ...draft, passingScore: Number(event.target.value) })} /></div><div><label className={fieldLabel}>Attempt limit</label><input className={`${textInput} w-full`} type="number" min="0" value={draft.attempts} onChange={(event) => setDraft({ ...draft, attempts: Number(event.target.value) })} /><p className="mt-1 text-xs text-muted">Zero means unlimited.</p></div><div><label className={fieldLabel}>Status</label><CustomSelect className={selectInput} value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as AssessmentDraft["status"] })}><option>Draft</option><option>Published</option><option>Archived</option></CustomSelect></div></div><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={draft.shuffleQuestions} onChange={(event) => setDraft({ ...draft, shuffleQuestions: event.target.checked })} />Shuffle question order for each attempt</label></section>

        <section className="grid gap-3 border-t border-line pt-5"><div className="flex items-center justify-between gap-3"><div><h3 className="font-[680]">Questions</h3><p className="text-sm text-muted">All questions and options save in one request.</p></div><button className={buttonGhostSmall} type="button" onClick={() => setDraft({ ...draft, questions: [...draft.questions, newQuestion()] })}><Icon name="plus" />Add question</button></div>{draft.questions.length ? draft.questions.map((question, questionIndex) => <article key={question.localId} className="grid gap-3 rounded-2xl border border-line p-4"><div className="flex items-center justify-between gap-3"><b>Question {questionIndex + 1}</b><button className="text-sm font-semibold text-accent-text" type="button" onClick={() => setDraft({ ...draft, questions: draft.questions.filter((item) => item.localId !== question.localId) })}>Remove</button></div><textarea className="min-h-20 w-full rounded-xl border border-line bg-background p-3 outline-none focus:border-accent" placeholder="Question prompt" value={question.prompt} onChange={(event) => updateQuestion(question.localId, { prompt: event.target.value })} /><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px]"><CustomSelect className={selectInput} value={question.type} onChange={(event) => changeQuestionType(question, event.target.value as QuestionType)}><option value="MULTIPLE_CHOICE">Multiple choice</option><option value="TRUE_FALSE">True / false</option><option value="WRITTEN_RESPONSE">Written response</option></CustomSelect><input className={`${textInput} w-full`} type="number" min="1" aria-label={`Points for question ${questionIndex + 1}`} value={question.points} onChange={(event) => updateQuestion(question.localId, { points: Math.max(1, Number(event.target.value) || 1) })} /></div>{question.type !== "WRITTEN_RESPONSE" ? <div className="grid gap-2">{question.options.map((option, optionIndex) => <div key={option.id ?? `${question.localId}-${optionIndex}`} className="flex items-center gap-2"><input className={`${textInput} min-w-0 flex-1`} value={option.label} readOnly={question.type === "TRUE_FALSE"} placeholder={`Option ${optionIndex + 1}`} onChange={(event) => updateQuestion(question.localId, { options: question.options.map((item, index) => index === optionIndex ? { ...item, label: event.target.value } : item) })} /><label className="flex shrink-0 items-center gap-1 text-xs font-semibold"><input type="radio" name={`correct-${question.localId}`} checked={option.isCorrect} onChange={() => updateQuestion(question.localId, { options: question.options.map((item, index) => ({ ...item, isCorrect: index === optionIndex })) })} />Correct</label>{question.type === "MULTIPLE_CHOICE" && question.options.length > 2 ? <button type="button" className="text-sm text-accent-text" onClick={() => updateQuestion(question.localId, { options: question.options.filter((_, index) => index !== optionIndex) })}>Remove</button> : null}</div>)}{question.type === "MULTIPLE_CHOICE" ? <button type="button" className="justify-self-start text-sm font-semibold text-accent-text" onClick={() => updateQuestion(question.localId, { options: [...question.options, { label: "", isCorrect: false }] })}><Icon name="plus" className="size-4" />Add option</button> : null}</div> : <p className="text-sm text-muted">A facilitator can grade the student’s written response.</p>}</article>) : <div className="rounded-xl border border-dashed border-line p-5 text-center text-sm text-muted">No questions yet. Add questions before publishing this assessment.</div>}</section>
        <button className={`${button} w-full`} type="submit" disabled={saving}>{saving ? "Saving assessment…" : draft.id ? "Save assessment and questions" : "Create assessment and questions"}</button>
      </>}
    </form></Modal> : null}
  </View>;
}
