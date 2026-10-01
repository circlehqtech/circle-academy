import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { accountIsDisabled, accountStatusLabel } from "../../api/adminAccounts";
import { useAdminStudentDetails } from "../../api/adminStudentDetails";
import { asRecord, collection, unwrap } from "../../api/adapters";
import { queryKeys } from "../../api/endpoints";
import { lmsApi } from "../../api/lmsApi";
import { Icon, type IconName } from "../../components/Icon";
import { View } from "../../components/View";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../contexts/ToastContext";
import { button, buttonGhostSmall, card, progressBar, table, tableWrap } from "../../styles";
import { formatDateTime } from "../../utils/dateTime";

type ConfirmAction = "disable" | "enable" | "delete";

function text(value: unknown, fallback = "") {
  return value == null || value === "" ? fallback : String(value);
}

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function pageItems(value: unknown, ...keys: string[]) {
  return collection(value, ...keys);
}

export function StudentProfilePage() {
  const { studentId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const details = useAdminStudentDetails(studentId);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const overview = asRecord(unwrap(details.overview.data));
  const studentRecord = asRecord(overview.student ?? overview.profile ?? overview);
  const accountRecord = asRecord(studentRecord.account ?? overview.account ?? studentRecord);
  const identity = { ...studentRecord, ...accountRecord };
  const summary = asRecord(overview.summary ?? overview.counts ?? overview.progressSummary);
  const accountId = text(identity.accountId ?? identity.id, studentId);
  const name = text(identity.name, `${text(identity.firstName)} ${text(identity.lastName)}`.trim() || "Student");
  const email = text(identity.email);
  const status = text(identity.status, "ACTIVE");
  const disabled = accountIsDisabled({ status });
  const cohort = asRecord(studentRecord.cohort ?? overview.cohort);

  const courses = useMemo(() => pageItems(details.courses.data, "courses", "enrollments").map((value) => {
    const record = asRecord(value);
    const course = asRecord(record.course ?? value);
    const progress = asRecord(record.progress ?? record.progressSummary);
    return {
      id: text(course.id ?? record.courseId),
      title: text(course.title ?? course.name ?? record.courseTitle, "Untitled course"),
      code: text(course.code ?? course.slug),
      status: text(record.status ?? course.status, "ACTIVE").replaceAll("_", " "),
      progress: number(record.progressPercentage ?? progress.percentage ?? record.progress),
      completed: number(progress.completedLessons ?? record.completedLessons),
      total: number(progress.totalLessons ?? record.totalLessons),
    };
  }), [details.courses.data]);

  const assessments = useMemo(() => pageItems(details.assessments.data, "assessments", "attempts").map((value) => {
    const record = asRecord(value);
    const assessment = asRecord(record.assessment ?? value);
    const attempt = asRecord(record.latestAttempt ?? record.attempt);
    const score = record.scorePercentage ?? attempt.scorePercentage ?? attempt.score;
    return {
      id: text(assessment.id ?? record.assessmentId ?? record.id),
      title: text(assessment.title ?? record.title, "Assessment"),
      course: text(asRecord(record.course).title ?? record.courseTitle, "Course"),
      score: score == null ? "—" : `${number(score)}%`,
      status: text(record.reviewState ?? attempt.status ?? record.status, "NOT_STARTED").replaceAll("_", " "),
    };
  }), [details.assessments.data]);

  const submissions = useMemo(() => pageItems(details.submissions.data, "submissions").map((value) => {
    const outer = asRecord(value);
    const record = asRecord(outer.submission ?? value);
    return {
      id: text(record.id ?? outer.id),
      title: text(record.title ?? asRecord(record.project).title, "Submission"),
      course: text(asRecord(record.course).title ?? outer.courseTitle ?? record.courseTitle, "Course"),
      type: text(asRecord(record.project).type ?? record.type ?? record.kind, "Assignment").replaceAll("_", " "),
      status: text(record.status, "DRAFT").replaceAll("_", " "),
      submitted: formatDateTime(record.submittedAt ?? record.updatedAt),
    };
  }), [details.submissions.data]);

  const liveClasses = useMemo(() => pageItems(details.liveClasses.data, "liveClasses", "classes").map((value) => {
    const record = asRecord(value);
    const liveClass = asRecord(record.liveClass ?? value);
    return {
      id: text(liveClass.id ?? record.id),
      title: text(liveClass.title, "Live class"),
      course: text(asRecord(liveClass.course).title ?? record.courseTitle, "Course"),
      date: formatDateTime(liveClass.startsAt ?? record.startsAt),
      attendance: text(asRecord(record.attendance).status ?? record.attendanceStatus, "Not recorded").replaceAll("_", " "),
    };
  }), [details.liveClasses.data]);

  const certificates = useMemo(() => pageItems(details.certificates.data, "certificates").map((value) => {
    const record = asRecord(value);
    const certificate = asRecord(record.certificate ?? value);
    return {
      id: text(certificate.id ?? record.id),
      course: text(asRecord(certificate.course).title ?? record.courseTitle, "Course"),
      number: text(certificate.certificateNumber ?? certificate.number, "—"),
      status: text(certificate.status, certificate.revokedAt ? "REVOKED" : "ISSUED").replaceAll("_", " "),
      issued: formatDateTime(certificate.issuedAt ?? certificate.createdAt),
    };
  }), [details.certificates.data]);

  const activity = useMemo(() => pageItems(details.activity.data, "activity", "events").map((value) => {
    const record = asRecord(value);
    return {
      id: text(record.id, `${text(record.type)}-${text(record.createdAt)}`),
      title: text(record.title ?? record.label, text(record.type, "Activity").replaceAll("_", " ")),
      description: text(record.description ?? record.message),
      date: formatDateTime(record.createdAt ?? record.occurredAt),
    };
  }), [details.activity.data]);

  const runAccountAction = async () => {
    if (!accountId || !confirmAction || isUpdating) return;
    setIsUpdating(true);
    try {
      if (confirmAction === "delete") {
        await lmsApi.admin.deleteAccount(accountId);
        await queryClient.invalidateQueries({ queryKey: queryKeys.admin.accounts("STUDENT") });
        toast(`${name}'s account was deleted.`);
        navigate("/admin/people", { replace: true });
        return;
      }
      const nextStatus = confirmAction === "enable" ? "ACTIVE" : "SUSPENDED";
      await lmsApi.admin.setAccountStatus(accountId, nextStatus);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.student(studentId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.accounts("STUDENT") }),
      ]);
      toast(`${name}'s account is now ${confirmAction === "enable" ? "enabled" : "disabled"}.`);
      setConfirmAction(null);
    } catch (error) {
      toast(error instanceof Error ? error.message : "The account could not be updated.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (details.overview.isPending) return <StudentProfileSkeleton />;

  if (details.overview.error) {
    return <View><ProfileState icon="user" title="We could not load this student" description={details.overview.error.message} actionLabel="Try again" onAction={() => void details.overview.refetch()} onBack={() => navigate("/admin/people")} /></View>;
  }

  if (!accountId || (!email && name === "Student")) {
    return <View><ProfileState icon="search" title="Student not found" description="This account may have been deleted, or the link is no longer valid." actionLabel="Back to people" onAction={() => navigate("/admin/people")} /></View>;
  }

  return (
    <View>
      <button className={`${buttonGhostSmall} mb-6`} type="button" onClick={() => navigate("/admin/people")}><Icon name="back" />Back to people</button>

      <header className="mb-7 overflow-hidden rounded-[22px] border border-line bg-surface">
        <div className="h-24 bg-[linear-gradient(110deg,var(--hq-red-ink),var(--hq-red))]" />
        <div className="flex flex-wrap items-end justify-between gap-5 px-5 pb-6 sm:px-7">
          <div className="flex min-w-0 items-end gap-4">
            <span className="-mt-10 grid size-24 shrink-0 place-items-center rounded-full border-4 border-surface bg-hq-amber text-2xl font-extrabold text-hq-ink">{initials(name)}</span>
            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2"><h2 className="text-3xl font-[760] tracking-[-0.03em]">{name}</h2><StatusBadge disabled={disabled}>{accountStatusLabel({ status })}</StatusBadge></div>
              <p className="mt-1 break-all text-sm text-muted">{email || "No email address"}</p>
            </div>
          </div>
          <button className={disabled ? button : buttonGhostSmall} type="button" onClick={() => setConfirmAction(disabled ? "enable" : "disable")}><Icon name={disabled ? "check" : "lock"} />{disabled ? "Enable account" : "Disable account"}</button>
        </div>
      </header>

      <section className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Student summary">
        <Metric value={number(summary.enrolledCourses ?? summary.courseCount, courses.length)} label="Enrolled courses" />
        <Metric value={`${number(summary.averageProgress ?? summary.progressPercentage)}%`} label="Average progress" />
        <Metric value={number(summary.pendingWork ?? summary.pendingSubmissions, submissions.filter((item) => !["APPROVED", "REJECTED"].includes(item.status)).length)} label="Pending work" />
        <Metric value={number(summary.certificatesIssued ?? summary.certificateCount, certificates.filter((item) => item.status === "ISSUED").length)} label="Certificates" />
      </section>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)]">
        <div className="grid content-start gap-7">
          <DataSection title="Courses and progress" description="Active and historical enrolments for this learner." icon="book" query={details.courses} empty={courses.length === 0} emptyTitle="No course enrolments" emptyDescription="This student has not been enrolled in a course yet.">
            <div className="grid gap-3 sm:grid-cols-2">{courses.map((course) => <article key={course.id || course.title} className="rounded-2xl bg-surface-2 p-4"><div className="mb-3 flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-xl bg-hq-red-ink font-bold text-hq-bone">{course.title.slice(0, 2).toUpperCase()}</span><span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold capitalize">{course.status.toLowerCase()}</span></div><b className="block">{course.title}</b><p className="mt-1 text-xs text-muted">{course.code || "No course code"}{course.total ? ` · ${course.completed}/${course.total} lessons` : ""}</p><div className="mt-4 flex items-center gap-3"><span className="w-10 text-sm font-semibold">{course.progress}%</span><span className={`${progressBar} flex-1`} style={{ "--p": course.progress } as React.CSSProperties}><i /></span></div></article>)}</div>
          </DataSection>

          <DataTableSection title="Submissions" description="Assignments and projects submitted by this student." icon="inbox" query={details.submissions} empty={submissions.length === 0} emptyTitle="No submissions yet" emptyDescription="Submitted assignments and projects will appear here." headers={["Work", "Course", "Type", "Status", "Submitted"]}>
            {submissions.map((item) => <tr key={item.id || `${item.title}-${item.submitted}`}><td><b>{item.title}</b></td><td>{item.course}</td><td className="capitalize">{item.type.toLowerCase()}</td><td><RecordBadge>{item.status}</RecordBadge></td><td>{item.submitted}</td></tr>)}
          </DataTableSection>

          <DataTableSection title="Assessments" description="Attempts, scores, pass state, and review status." icon="chart" query={details.assessments} empty={assessments.length === 0} emptyTitle="No assessment attempts" emptyDescription="Assessment attempts will appear after the student starts a test." headers={["Assessment", "Course", "Score", "State"]}>
            {assessments.map((item) => <tr key={item.id || item.title}><td><b>{item.title}</b></td><td>{item.course}</td><td>{item.score}</td><td><RecordBadge>{item.status}</RecordBadge></td></tr>)}
          </DataTableSection>

          <DataTableSection title="Live classes" description="Scheduled classes and recorded attendance." icon="video" query={details.liveClasses} empty={liveClasses.length === 0} emptyTitle="No live classes" emptyDescription="Scheduled course classes will appear here." headers={["Class", "Course", "Schedule", "Attendance"]}>
            {liveClasses.map((item) => <tr key={item.id || `${item.title}-${item.date}`}><td><b>{item.title}</b></td><td>{item.course}</td><td>{item.date}</td><td><RecordBadge>{item.attendance}</RecordBadge></td></tr>)}
          </DataTableSection>

          <DataTableSection title="Certificates" description="Issued and revoked course certificates." icon="award" query={details.certificates} empty={certificates.length === 0} emptyTitle="No certificates" emptyDescription="Eligible certificates will appear after course completion." headers={["Course", "Certificate ID", "Status", "Issued"]}>
            {certificates.map((item) => <tr key={item.id || item.number}><td><b>{item.course}</b></td><td className="font-mono text-xs">{item.number}</td><td><RecordBadge>{item.status}</RecordBadge></td><td>{item.issued}</td></tr>)}
          </DataTableSection>
        </div>

        <aside className="grid content-start gap-7">
          <section className={card}>
            <SectionHeading title="Account details" description="Identity and platform information." />
            <dl className="grid gap-4 text-sm">
              <Detail icon="user" label="Full name" value={name} />
              <Detail icon="mail" label="Email address" value={email || "Not provided"} />
              <Detail icon="user" label="Phone number" value={text(identity.phoneNumber, "Not provided")} />
              <Detail icon="users" label="Cohort" value={text(cohort.name ?? identity.cohortName, "Self-paced")} />
              <Detail icon="shield" label="Role" value="Student" />
              <Detail icon="folder" label="Account ID" value={accountId} mono />
              <Detail icon="video" label="Last active" value={formatDateTime(identity.lastActiveAt ?? overview.lastActiveAt)} />
            </dl>
          </section>

          <section className={`${card} ${disabled ? "border-accent/40" : ""}`}>
            <SectionHeading title="Access control" description={disabled ? "This student is blocked from the learning platform." : "This student currently has full learner access."} />
            <div className={`mb-4 rounded-xl p-3 text-sm ${disabled ? "bg-hq-red/10 text-accent-text" : "bg-surface-2"}`}><b>{disabled ? "Access disabled" : "Access enabled"}</b><p className="mt-1 text-muted">{disabled ? "Enable the account to restore sign-in and course access." : "Disabling prevents sign-in and authenticated actions until re-enabled."}</p></div>
            <button className={`${disabled ? button : buttonGhostSmall} w-full`} type="button" onClick={() => setConfirmAction(disabled ? "enable" : "disable")}><Icon name={disabled ? "check" : "lock"} />{disabled ? "Enable student" : "Disable student"}</button>
            <div className="mt-6 border-t border-line pt-5"><b className="text-sm text-accent-text">Danger zone</b><p className="mt-1 mb-3 text-sm text-muted">Permanently remove this account. This cannot be undone.</p><button className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent px-4 py-2.5 text-sm font-semibold text-accent-text transition-colors hover:bg-hq-red/10 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={() => setConfirmAction("delete")}><Icon name="trash" />Delete student</button></div>
          </section>

          <DataSection title="Activity" description="Recent account, learning, review, and certificate events." icon="chart" query={details.activity} empty={activity.length === 0} emptyTitle="No recorded activity" emptyDescription="Account and learning events will appear here.">
            <ol className="grid gap-4">{activity.slice(0, 12).map((item) => <li key={item.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3"><span className="mt-1 size-2 rounded-full bg-accent" /><div><b className="block text-sm capitalize">{item.title.toLowerCase()}</b>{item.description ? <p className="mt-1 text-sm text-muted">{item.description}</p> : null}<time className="mt-1 block text-xs text-muted">{item.date}</time></div></li>)}</ol>
          </DataSection>
        </aside>
      </div>

      {confirmAction ? <ConfirmAccountAction action={confirmAction} name={name} pending={isUpdating} onCancel={() => { if (!isUpdating) setConfirmAction(null); }} onConfirm={() => void runAccountAction()} /> : null}
    </View>
  );
}

type QueryState = { isPending: boolean; error: Error | null; refetch: () => Promise<unknown> };

function DataSection({ title, description, icon, query, empty, emptyTitle, emptyDescription, children }: { title: string; description: string; icon: IconName; query: QueryState; empty: boolean; emptyTitle: string; emptyDescription: string; children: React.ReactNode }) {
  return <section className={card}><SectionHeading title={title} description={description} />{query.isPending ? <SectionLoading /> : query.error ? <SectionError message={query.error.message} onRetry={() => void query.refetch()} /> : empty ? <InlineEmpty icon={icon} title={emptyTitle} description={emptyDescription} /> : children}</section>;
}

function DataTableSection({ title, description, icon, query, empty, emptyTitle, emptyDescription, headers, children }: { title: string; description: string; icon: IconName; query: QueryState; empty: boolean; emptyTitle: string; emptyDescription: string; headers: string[]; children: React.ReactNode }) {
  return <section><SectionHeading title={title} description={description} />{query.isPending ? <SectionLoading bordered /> : query.error ? <SectionError message={query.error.message} onRetry={() => void query.refetch()} bordered /> : <div className={tableWrap}><table className={`${table} ${empty ? "!min-w-0" : ""}`}><thead><tr>{headers.map((header, index) => <th key={header} className={empty && index > 1 ? "hidden sm:table-cell" : undefined}>{header}</th>)}</tr></thead><tbody>{empty ? <tr><td colSpan={headers.length}><InlineEmpty icon={icon} title={emptyTitle} description={emptyDescription} /></td></tr> : children}</tbody></table></div>}</section>;
}

function StudentProfileSkeleton() {
  return <View><div className="animate-pulse" aria-label="Loading student profile"><div className="mb-6 h-10 w-36 rounded-full bg-surface-2" /><div className="mb-7 overflow-hidden rounded-[22px] border border-line"><div className="h-24 bg-surface-2" /><div className="flex items-end gap-4 p-6"><span className="-mt-14 size-24 rounded-full border-4 border-background bg-surface-2" /><div className="grid flex-1 gap-3"><span className="h-7 w-52 rounded bg-surface-2" /><span className="h-4 w-64 max-w-full rounded bg-surface-2" /></div></div></div><div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 rounded-[18px] bg-surface-2" />)}</div><div className="grid gap-7 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)]"><div className="h-96 rounded-[18px] bg-surface-2" /><div className="h-[460px] rounded-[18px] bg-surface-2" /></div></div></View>;
}

function SectionLoading({ bordered = false }: { bordered?: boolean }) {
  return <div className={`grid min-h-40 animate-pulse gap-3 p-5 ${bordered ? "rounded-[18px] border border-line" : ""}`} aria-label="Loading section"><span className="h-4 w-2/3 rounded bg-surface-2" /><span className="h-4 w-full rounded bg-surface-2" /><span className="h-4 w-4/5 rounded bg-surface-2" /></div>;
}

function SectionError({ message, onRetry, bordered = false }: { message: string; onRetry: () => void; bordered?: boolean }) {
  return <div className={`grid min-h-40 place-items-center p-6 text-center ${bordered ? "rounded-[18px] border border-dashed border-line" : ""}`} role="alert"><div className="grid max-w-sm justify-items-center gap-3"><Icon name="help" className="size-6 text-accent-text" /><div><b>This section could not be loaded</b><p className="mt-1 text-sm text-muted">{message}</p></div><button className={buttonGhostSmall} type="button" onClick={onRetry}>Try again</button></div></div>;
}

function Metric({ value, label }: { value: number | string; label: string }) {
  return <div className="rounded-[18px] border border-line bg-surface p-4 sm:p-5"><b className="block text-3xl font-[760] tracking-[-0.03em]">{value}</b><span className="mt-1 block text-sm text-muted">{label}</span></div>;
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return <div className="mb-5"><h3 className="text-lg font-[680]">{title}</h3><p className="mt-1 text-sm text-muted">{description}</p></div>;
}

function Detail({ icon, label, value, mono = false }: { icon: IconName; label: string; value: string; mono?: boolean }) {
  return <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3"><span className="grid size-9 place-items-center rounded-xl bg-surface-2 text-muted"><Icon name={icon} className="size-4" /></span><div className="min-w-0"><dt className="text-xs text-muted">{label}</dt><dd className={`mt-0.5 break-words font-semibold ${mono ? "font-mono text-xs" : ""}`}>{value}</dd></div></div>;
}

function InlineEmpty({ icon, title, description }: { icon: IconName; title: string; description: string }) {
  return <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-line p-6 text-center"><div className="grid justify-items-center gap-2"><span className="grid size-11 place-items-center rounded-full bg-surface-2"><Icon name={icon} className="size-5 text-muted" /></span><b>{title}</b><p className="max-w-sm text-sm text-muted">{description}</p></div></div>;
}

function StatusBadge({ children, disabled }: { children: string; disabled: boolean }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${disabled ? "bg-hq-red/10 text-accent-text" : "bg-surface-2"}`}><i className={`size-1.5 rounded-full ${disabled ? "bg-accent" : "bg-reward"}`} />{children}</span>;
}

function RecordBadge({ children }: { children: string }) {
  return <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold capitalize">{children.toLowerCase()}</span>;
}

function ProfileState({ icon, title, description, actionLabel, onAction, onBack }: { icon: "user" | "search"; title: string; description: string; actionLabel: string; onAction: () => void; onBack?: () => void }) {
  return <div className="grid min-h-[55vh] place-items-center"><div className="grid max-w-md justify-items-center gap-4 text-center"><span className="grid size-16 place-items-center rounded-full bg-surface-2"><Icon name={icon} className="size-7 text-muted" /></span><div><h2 className="text-2xl font-[720]">{title}</h2><p className="mt-2 text-muted">{description}</p></div><div className="flex flex-wrap justify-center gap-2">{onBack ? <button className={buttonGhostSmall} type="button" onClick={onBack}><Icon name="back" />Back</button> : null}<button className={button} type="button" onClick={onAction}>{actionLabel}</button></div></div></div>;
}

function ConfirmAccountAction({ action, name, pending, onCancel, onConfirm }: { action: ConfirmAction; name: string; pending: boolean; onCancel: () => void; onConfirm: () => void }) {
  const deleting = action === "delete";
  const enabling = action === "enable";
  const title = deleting ? `Delete ${name}?` : enabling ? `Enable ${name}?` : `Disable ${name}?`;
  const subtitle = deleting ? "This permanently removes the account and cannot be undone." : enabling ? "The student will be able to sign in and use the learning platform again." : "The student will be blocked from signing in and performing authenticated actions until enabled.";
  return <Modal title={title} subtitle={subtitle} onClose={onCancel}><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button className={buttonGhostSmall} type="button" disabled={pending} onClick={onCancel}>Cancel</button><button className={deleting ? "inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-[11px] font-semibold text-white disabled:opacity-50" : button} type="button" disabled={pending} onClick={onConfirm}>{pending ? <><span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />Working…</> : <><Icon name={deleting ? "trash" : enabling ? "check" : "lock"} />{deleting ? "Delete permanently" : enabling ? "Enable student" : "Disable student"}</>}</button></div></Modal>;
}
