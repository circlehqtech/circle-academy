import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { lmsApi } from "../../api/lmsApi";
import { asRecord, collection, extractId, unwrap } from "../../api/adapters";
import { EmptyState } from "../../components/ui/EmptyState";
import { Icon } from "../../components/Icon";
import { useToast } from "../../contexts/ToastContext";
import { button, buttonGhostSmall, card } from "../../styles";
import type { AssessmentRecord } from "../../types/workspace";

type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "WRITTEN_RESPONSE";
type StudentOption = { id: string; label: string };
type StudentQuestion = { id: string; prompt: string; type: QuestionType; points: number; options: StudentOption[] };
type AssessmentDetail = { id: string; title: string; description: string; passPercentage: number; attemptLimit: number; questions: StudentQuestion[] };
type Answer = { optionId?: string; answerText?: string };

const text = (value: unknown, fallback = "") => typeof value === "string" ? value : value == null ? fallback : String(value);
const number = (value: unknown, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function studentAssessment(value: unknown): AssessmentDetail {
  const outer = asRecord(unwrap(value));
  const record = asRecord(outer.assessment ?? outer);
  const questions = collection(record.questions ?? outer.questions, "questions").map((questionValue) => {
    const questionOuter = asRecord(questionValue);
    const question = asRecord(questionOuter.question ?? questionOuter);
    const rawType = text(question.type, "MULTIPLE_CHOICE");
    const type: QuestionType = rawType === "WRITTEN" ? "WRITTEN_RESPONSE" : rawType === "TRUE_FALSE" || rawType === "WRITTEN_RESPONSE" ? rawType : "MULTIPLE_CHOICE";
    // Deliberately copy only public option fields. Never spread the API
    // object here because admin responses include `isCorrect`.
    const options = collection(question.options ?? questionOuter.options, "options").map((optionValue) => {
      const optionOuter = asRecord(optionValue);
      const option = asRecord(optionOuter.option ?? optionOuter);
      return { id: text(option.id ?? option.optionId), label: text(option.label ?? option.text) };
    }).filter((option) => option.id && option.label);
    return { id: text(question.id ?? question.questionId), prompt: text(question.prompt), type, points: number(question.points, 1), options };
  }).filter((question) => question.id && question.prompt);
  return {
    id: text(record.id ?? record.assessmentId),
    title: text(record.title, "Assessment"),
    description: text(record.description),
    passPercentage: number(record.passPercentage, 70),
    attemptLimit: number(record.attemptLimit),
    questions,
  };
}

export function CourseQuizPanel({ assessments }: { assessments: AssessmentRecord[] }) {
  const { toast } = useToast();
  const [assessmentId, setAssessmentId] = useState("");
  const [attemptId, setAttemptId] = useState("");
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // The learning endpoint already returns only the assessments published for
  // this enrolled student, so do not issue another list request or re-filter
  // valid summaries whose response omits a status field.
  const availableAssessments = assessments.filter((item) => item.id);
  const detailQuery = useQuery({
    queryKey: ["student", "assessment", assessmentId],
    queryFn: () => lmsApi.student.assessment(assessmentId!),
    enabled: Boolean(assessmentId),
    retry: false,
    refetchOnWindowFocus: false,
  });
  const detail = useMemo(() => detailQuery.data ? studentAssessment(detailQuery.data) : null, [detailQuery.data]);

  const openAssessment = (id: string) => {
    setAttemptId("");
    setAnswers({});
    setResult(null);
    setAssessmentId(id);
  };
  const startAttempt = async () => {
    if (!detail) return;
    setSubmitting(true);
    try {
      const response = await lmsApi.student.startAttempt(detail.id);
      const id = extractId(response);
      if (!id) throw new Error("The API did not return the attempt ID.");
      setAttemptId(id);
      setAnswers({});
      setResult(null);
      toast("Quiz attempt started.");
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "The attempt could not be started.");
    } finally { setSubmitting(false); }
  };
  const submitAttempt = async () => {
    if (!detail || !attemptId) return;
    const unanswered = detail.questions.find((question) => question.type === "WRITTEN_RESPONSE" ? !answers[question.id]?.answerText?.trim() : !answers[question.id]?.optionId);
    if (unanswered) { toast("Answer every question before submitting."); return; }
    setSubmitting(true);
    try {
      const responses = detail.questions.map((question) => question.type === "WRITTEN_RESPONSE"
        ? { questionId: question.id, answerText: answers[question.id]?.answerText?.trim() }
        : { questionId: question.id, optionId: answers[question.id]?.optionId });
      await lmsApi.student.submitAttempt(attemptId, responses);
      setResult(await lmsApi.student.attemptResult(attemptId));
      toast("Quiz submitted.");
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "The assessment could not be submitted.");
    } finally { setSubmitting(false); }
  };

  if (assessmentId) {
    return <div>
      <button className="mb-5 inline-flex items-center gap-1.5 font-semibold text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2" type="button" onClick={() => { setAssessmentId(""); setAttemptId(""); setAnswers({}); setResult(null); }}><Icon name="back" />Back to quizzes</button>
      {detailQuery.isPending ? <AssessmentSkeleton /> : detailQuery.isError || !detail ? <EmptyState icon="help" title="Quiz could not be loaded" description="Try opening it again from the quiz list." actionLabel="Back to quizzes" onAction={() => setAssessmentId("")} /> : result ? <AttemptResult result={result} assessment={detail} onRetry={() => { setAttemptId(""); setAnswers({}); setResult(null); }} /> : !attemptId ? <section className={`${card} mx-auto max-w-3xl p-6 sm:p-8`}><p className="text-sm font-semibold text-accent-text">READY TO BEGIN</p><h2 className="mt-2 text-3xl font-[740]">{detail.title}</h2>{detail.description ? <p className="mt-3 text-muted">{detail.description}</p> : null}<div className="mt-6 grid grid-cols-3 gap-3 border-y border-line py-4 text-center"><div><b className="block text-xl">{detail.questions.length}</b><span className="text-xs text-muted">Questions</span></div><div><b className="block text-xl">{detail.passPercentage}%</b><span className="text-xs text-muted">Pass mark</span></div><div><b className="block text-xl">{detail.attemptLimit || "∞"}</b><span className="text-xs text-muted">Attempts</span></div></div><button className={`${button} mt-6 w-full`} type="button" disabled={submitting || !detail.questions.length} onClick={() => void startAttempt()}>{submitting ? "Starting…" : "Start quiz"}</button></section> : <AssessmentPlayer assessment={detail} answers={answers} submitting={submitting} onAnswer={(questionId, answer) => setAnswers((current) => ({ ...current, [questionId]: answer }))} onSubmit={() => void submitAttempt()} />}
    </div>;
  }

  return <div>
    <div className="mb-5"><p className="text-sm font-semibold text-accent-text">COURSE QUIZZES</p><h2 className="mt-1 text-2xl font-[700]">Check your understanding</h2><p className="mt-1 text-sm text-muted">Complete the published quizzes for this course and review your results.</p></div>
    {availableAssessments.length ? <div className="grid gap-4 md:grid-cols-2">{availableAssessments.map((assessment) => <article key={assessment.id} className={`${card} flex flex-col p-5`}><div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-full bg-surface-2"><Icon name="pen" className="size-4 text-accent-text" /></span><span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold">{assessment.questions} questions</span></div><h3 className="mt-4 text-xl font-[680]">{assessment.title}</h3><p className="mt-1 flex-1 text-sm text-muted">{assessment.description || `Pass with ${assessment.passingScore}%.`}</p><div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4"><span className="text-xs text-muted">{assessment.attempts ? `${assessment.attempts} attempts` : "Unlimited attempts"}</span><button className={buttonGhostSmall} type="button" onClick={() => openAssessment(assessment.id)}>Open quiz</button></div></article>)}</div> : <EmptyState icon="pen" title="No published quizzes" description="This course does not have a quiz available yet." />}
  </div>;
}

function AssessmentPlayer({ assessment, answers, submitting, onAnswer, onSubmit }: { assessment: AssessmentDetail; answers: Record<string, Answer>; submitting: boolean; onAnswer: (questionId: string, answer: Answer) => void; onSubmit: () => void }) {
  const answered = assessment.questions.filter((question) => question.type === "WRITTEN_RESPONSE" ? answers[question.id]?.answerText?.trim() : answers[question.id]?.optionId).length;
  return <div className="mx-auto max-w-3xl"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-accent-text">QUIZ IN PROGRESS</p><h2 className="mt-1 text-2xl font-[720]">{assessment.title}</h2></div><span className="text-sm font-semibold">{answered} of {assessment.questions.length} answered</span></div><div className="grid gap-4">{assessment.questions.map((question, index) => <fieldset key={question.id} className={`${card} p-5`}><legend className="sr-only">Question {index + 1}</legend><div className="flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-sm font-bold text-background">{index + 1}</span><div className="min-w-0 flex-1"><p className="font-[650]">{question.prompt}</p><p className="mt-1 text-xs text-muted">{question.points} {question.points === 1 ? "point" : "points"}</p>{question.type === "WRITTEN_RESPONSE" ? <textarea className="mt-4 min-h-32 w-full resize-y rounded-2xl border-[1.5px] border-line bg-background p-4 outline-none focus:border-accent" aria-label={`Answer to question ${index + 1}`} placeholder="Write your answer…" value={answers[question.id]?.answerText ?? ""} onChange={(event) => onAnswer(question.id, { answerText: event.target.value })} /> : <div className="mt-4 grid gap-2">{question.options.map((option) => <label key={option.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 transition-colors has-[:checked]:border-foreground has-[:checked]:bg-surface-2"><input className="mt-1 size-4 accent-[var(--accent)]" type="radio" name={`question-${question.id}`} checked={answers[question.id]?.optionId === option.id} onChange={() => onAnswer(question.id, { optionId: option.id })} /><span>{option.label}</span></label>)}</div>}</div></div></fieldset>)}</div><button className={`${button} mt-6 w-full`} type="button" disabled={submitting || answered !== assessment.questions.length} onClick={onSubmit}>{submitting ? "Submitting…" : "Submit quiz"}</button></div>;
}

function AttemptResult({ result, assessment, onRetry }: { result: unknown; assessment: AssessmentDetail; onRetry: () => void }) {
  const outer = asRecord(unwrap(result));
  const record = asRecord(outer.result ?? outer.attempt ?? outer);
  const percentage = number(record.percentage ?? record.scorePercentage ?? record.score);
  const passed = record.passed === true || text(record.status).toUpperCase() === "PASSED";
  const pending = text(record.status).toUpperCase().includes("PENDING") || record.requiresReview === true;
  return <section className={`${card} mx-auto max-w-2xl p-7 text-center`}><span className={`mx-auto grid size-16 place-items-center rounded-full ${pending ? "bg-surface-2" : passed ? "bg-reward" : "bg-[color-mix(in_srgb,var(--accent)_12%,var(--surface))]"}`}><Icon name={pending ? "inbox" : passed ? "check" : "back"} className="size-7" /></span><h2 className="mt-4 text-2xl font-[720]">{pending ? "Submitted for facilitator review" : passed ? "Quiz passed" : "Quiz completed"}</h2><p className="mx-auto mt-2 max-w-[52ch] text-muted">{pending ? "Written responses still need to be graded. Your final score will appear after review." : `You scored ${percentage}% on ${assessment.title}.`}</p>{!pending ? <div className="mx-auto mt-5 max-w-xs border-y border-line py-4"><b className="block text-4xl font-[760]">{percentage}%</b><span className="text-sm text-muted">Pass mark: {assessment.passPercentage}%</span></div> : null}<div className="mt-6 flex flex-wrap justify-center gap-2"><button className={buttonGhostSmall} type="button" onClick={onRetry}><Icon name="back" />Start another attempt</button></div></section>;
}

function AssessmentSkeleton() {
  return <div className="grid animate-pulse gap-4 md:grid-cols-2" aria-label="Loading assessments"><div className="h-48 rounded-[18px] bg-surface-2" /><div className="h-48 rounded-[18px] bg-surface-2" /></div>;
}
