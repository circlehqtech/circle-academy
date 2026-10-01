import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { lmsApi } from "../../api/lmsApi";
import { asRecord, collection } from "../../api/adapters";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { EmptyState } from "../../components/ui/EmptyState";
import { Icon } from "../../components/Icon";
import { View } from "../../components/View";
import { useToast } from "../../contexts/ToastContext";
import { useWorkspace } from "../../features/workspace/useWorkspace";
import { button, card, fieldLabel, selectInput, textInput } from "../../styles";
import { formatDateTime } from "../../utils/dateTime";

type WrittenResponse = { questionId: string; prompt: string; answerText: string; points: number; awardedPoints: number };
type AttemptRow = { id: string; assessment: string; student: string; status: string; score: number | null; submittedAt: string; writtenResponses: WrittenResponse[] };

const text = (value: unknown, fallback = "") => typeof value === "string" ? value : value == null ? fallback : String(value);
const number = (value: unknown, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function attemptRow(value: unknown): AttemptRow {
  const outer = asRecord(value);
  const attempt = asRecord(outer.attempt ?? outer);
  const assessment = asRecord(attempt.assessment ?? outer.assessment);
  const student = asRecord(attempt.student ?? attempt.account ?? outer.student ?? outer.account);
  const responses = collection(attempt.responses ?? outer.responses).map((responseValue) => {
    const response = asRecord(responseValue);
    const question = asRecord(response.question);
    const type = text(response.questionType ?? question.type).toUpperCase();
    if (type !== "WRITTEN_RESPONSE" && !response.answerText) return null;
    return {
      questionId: text(response.questionId ?? question.id),
      prompt: text(response.prompt ?? question.prompt, "Written response"),
      answerText: text(response.answerText),
      points: number(response.points ?? question.points, 1),
      awardedPoints: number(response.awardedPoints),
    };
  }).filter((item): item is WrittenResponse => Boolean(item?.questionId));
  const firstName = text(student.firstName);
  const lastName = text(student.lastName);
  return {
    id: text(attempt.id ?? attempt.attemptId ?? outer.attemptId),
    assessment: text(assessment.title ?? attempt.assessmentTitle, "Assessment"),
    student: text(student.name, `${firstName} ${lastName}`.trim() || "Student"),
    status: text(attempt.status, "SUBMITTED"),
    score: attempt.percentage == null && attempt.scorePercentage == null && attempt.score == null ? null : number(attempt.percentage ?? attempt.scorePercentage ?? attempt.score),
    submittedAt: text(attempt.submittedAt ?? attempt.updatedAt, "—"),
    writtenResponses: responses,
  };
}

export function FacilitatorAssessmentResultsPage() {
  const { courses } = useWorkspace();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [selectedId, setSelectedId] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const selectedCourseId = courses.some((course) => course.id === courseId) ? courseId : courses[0]?.id ?? "";
  const resultsQuery = useQuery({
    queryKey: ["facilitator", "assessment-results", selectedCourseId],
    queryFn: () => lmsApi.facilitator.assessmentResults(selectedCourseId),
    enabled: Boolean(selectedCourseId),
    retry: false,
    refetchOnWindowFocus: false,
  });
  const attempts = useMemo(() => collection(resultsQuery.data, "attempts", "assessmentResults", "results").map(attemptRow).filter((item) => item.id), [resultsQuery.data]);
  const selected = attempts.find((item) => item.id === selectedId) ?? attempts[0];
  const needsReview = attempts.filter((item) => item.writtenResponses.length && item.status.toUpperCase() !== "GRADED").length;

  const choose = (attempt: AttemptRow) => {
    setSelectedId(attempt.id);
    setScores(Object.fromEntries(attempt.writtenResponses.map((response) => [response.questionId, response.awardedPoints])));
  };
  const saveReview = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await lmsApi.facilitator.reviewAttempt(selected.id, {
        responses: selected.writtenResponses.map((response) => ({
          questionId: response.questionId,
          awardedPoints: Math.min(response.points, Math.max(0, number(scores[response.questionId], response.awardedPoints))),
        })),
      });
      await queryClient.invalidateQueries({ queryKey: ["facilitator", "assessment-results", selectedCourseId] });
      toast("Written responses graded.");
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "The attempt review could not be saved.");
    } finally { setSaving(false); }
  };

  return <View>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div className="w-full max-w-md"><label className={fieldLabel} htmlFor="facilitator-results-course">Course</label><CustomSelect id="facilitator-results-course" className={selectInput} value={selectedCourseId} onChange={(event) => { setCourseId(event.target.value); setSelectedId(""); }}>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</CustomSelect></div><div className="rounded-full bg-surface-2 px-4 py-2 text-sm font-semibold">{needsReview} awaiting written review</div></div>
    {!courses.length ? <EmptyState icon="book" title="No assigned courses" description="Assessment attempts appear after a course is assigned to you." /> : resultsQuery.isPending ? <div className="grid animate-pulse gap-3"><div className="h-16 rounded-xl bg-surface-2" /><div className="h-16 rounded-xl bg-surface-2" /></div> : resultsQuery.isError ? <EmptyState icon="help" title="Assessment results could not be loaded" description="Only the selected course request failed." actionLabel="Try again" onAction={() => void resultsQuery.refetch()} /> : !attempts.length ? <EmptyState icon="chart" title="No assessment attempts yet" description="Student attempts will appear here after they submit a published assessment." /> : <div className="grid gap-7 min-[1021px]:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]">
      <aside className="grid content-start gap-2">{attempts.map((attempt) => <button key={attempt.id} type="button" aria-pressed={selected?.id === attempt.id} className="rounded-2xl border border-line p-4 text-left transition-colors hover:bg-surface aria-pressed:border-foreground aria-pressed:bg-surface" onClick={() => choose(attempt)}><div className="flex items-start justify-between gap-3"><div><b className="block">{attempt.student}</b><span className="mt-1 block text-sm text-muted">{attempt.assessment}</span></div><span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold">{attempt.score == null ? "Pending" : `${attempt.score}%`}</span></div><span className="mt-3 block text-xs text-muted">{attempt.writtenResponses.length ? `${attempt.writtenResponses.length} written responses` : "Automatically graded"} · {attempt.submittedAt === "—" ? "Submitted" : formatDateTime(attempt.submittedAt)}</span></button>)}</aside>
      {selected ? <section><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-accent-text">{selected.student.toUpperCase()}</p><h2 className="mt-1 text-2xl font-[720]">{selected.assessment}</h2></div>{selected.score != null ? <span className="text-3xl font-[760]">{selected.score}%</span> : null}</div>{selected.writtenResponses.length ? <div className="mt-5 grid gap-4">{selected.writtenResponses.map((response, index) => <article key={response.questionId} className={`${card} p-5`}><p className="text-xs font-bold uppercase tracking-wide text-muted">Written response {index + 1}</p><h3 className="mt-2 font-[650]">{response.prompt}</h3><div className="mt-3 rounded-2xl bg-surface-2 p-4 whitespace-pre-wrap">{response.answerText || "No answer supplied."}</div><div className="mt-4 max-w-48"><label className={fieldLabel} htmlFor={`score-${response.questionId}`}>Points awarded</label><div className="flex items-center gap-2"><input id={`score-${response.questionId}`} className={`${textInput} min-w-0 flex-1`} type="number" min="0" max={response.points} step="0.5" value={scores[response.questionId] ?? response.awardedPoints} onChange={(event) => setScores((current) => ({ ...current, [response.questionId]: number(event.target.value) }))} /><span className="text-sm text-muted">/ {response.points}</span></div></div></article>)}<button className={`${button} justify-self-start`} type="button" disabled={saving} onClick={() => void saveReview()}><Icon name="check" />{saving ? "Saving…" : "Save grading"}</button></div> : <div className={`${card} mt-5 p-6 text-center`}><Icon name="check" className="mx-auto size-8 text-accent-text" /><h3 className="mt-3 text-lg font-[680]">Automatically graded</h3><p className="mt-1 text-sm text-muted">This attempt has no written responses requiring facilitator input.</p></div>}</section> : null}
    </div>}
  </View>;
}
