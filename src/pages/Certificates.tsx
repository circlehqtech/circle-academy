import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { asRecord, collection, unwrap } from "../api/adapters";
import { queryKeys } from "../api/endpoints";
import { lmsApi } from "../api/lmsApi";
import { Icon } from "../components/Icon";
import { CertificateArtwork } from "../components/CertificateArtwork";
import { EmptyState } from "../components/ui/EmptyState";
import { View } from "../components/View";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../features/auth/useAuth";
import { useWorkspace } from "../features/workspace/useWorkspace";
import { button, buttonGhostSmall, card } from "../styles";
import { externalHttpUrl } from "../utils/externalMedia";

function text(value: unknown, fallback = "") {
  return value == null || value === "" ? fallback : String(value);
}

function percentage(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 0;
}

export function Certificates() {
  const { toast } = useToast();
  const { account } = useAuth();
  const { courses } = useWorkspace();
  const availableCourses = courses.filter((course) => course.status !== "Archived");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const selectedCourse = availableCourses.find((course) => course.id === selectedCourseId) ?? availableCourses[0];
  const courseId = selectedCourse?.id ?? "";

  const certificateQuery = useQuery({
    queryKey: queryKeys.student.certificate(courseId),
    enabled: Boolean(courseId),
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const [completionResult, certificateResult] = await Promise.allSettled([
        lmsApi.student.completion(courseId),
        lmsApi.student.certificate(courseId),
      ]);
      if (completionResult.status === "rejected") throw completionResult.reason;
      return { completion: completionResult.value, certificate: certificateResult.status === "fulfilled" ? certificateResult.value : null };
    },
  });

  const data = useMemo(() => {
    const completionEnvelope = asRecord(unwrap(certificateQuery.data?.completion));
    const completion = asRecord(completionEnvelope.completion ?? completionEnvelope);
    const progress = asRecord(completion.progress);
    const certificateEnvelope = asRecord(unwrap(certificateQuery.data?.certificate));
    const certificate = asRecord(certificateEnvelope.certificate ?? certificateEnvelope);
    const certificateTemplate = asRecord(certificate.template ?? certificate.certificateTemplate ?? certificateEnvelope.template);
    const requirements = collection(completion, "requirements", "completionRequirements").map((value, index) => {
      const outer = asRecord(value);
      const record = asRecord(outer.requirement ?? outer);
      const satisfied = outer.complete === true || outer.completed === true || outer.satisfied === true || record.complete === true || record.completed === true || record.satisfied === true || text(outer.status ?? record.status).toUpperCase() === "COMPLETED";
      return { id: text(record.id, `requirement-${index}`), label: text(record.label, text(record.type, "Completion requirement").replaceAll("_", " ")), required: record.required !== false, satisfied };
    });
    const percent = percentage(completion.percentage ?? completion.percent ?? progress.percentage ?? progress.percent ?? selectedCourse?.progress);
    const backendDeniedEligibility = completion.eligible === false || completion.isEligible === false;
    const allRequiredConditionsSatisfied = requirements.every((item) => !item.required || item.satisfied);
    const eligible = percent === 100 && allRequiredConditionsSatisfied && !backendDeniedEligibility;
    const certificateId = text(certificate.id ?? certificate.certificateId);
    return {
      percent,
      eligible,
      requirements,
      certificate: certificateId || certificate.certificateNumber ? {
        id: certificateId,
        number: text(certificate.certificateNumber ?? certificate.number),
        issuedAt: text(certificate.issuedAt ?? certificate.createdAt),
        revoked: Boolean(certificate.revokedAt) || text(certificate.status).toUpperCase() === "REVOKED",
        fileUrl: externalHttpUrl(text(certificate.fileUrl ?? certificate.url ?? certificate.downloadUrl ?? certificate.certificateUrl ?? certificate.pdfUrl)),
        backgroundUrl: externalHttpUrl(text(certificateTemplate.previewUrl)),
        signatoryName: text(certificateTemplate.signatoryName ?? certificate.signatoryName, "Authorized signatory"),
        signatoryTitle: text(certificateTemplate.signatoryTitle ?? certificate.signatoryTitle, "Academy Director"),
      } : null,
    };
  }, [certificateQuery.data, selectedCourse?.progress]);

  if (!selectedCourse) return <View><EmptyState icon="award" title="No enrolled courses" description="Certificates become available here after you enroll in and complete a published course." /></View>;

  const studentName = `${account?.firstName ?? ""} ${account?.lastName ?? ""}`.trim() || "Student";
  const ready = data.eligible && Boolean(data.certificate) && !data.certificate?.revoked;
  const openCertificate = () => {
    if (!data.certificate?.fileUrl) { toast("The certificate record exists, but no downloadable file URL was returned."); return; }
    window.open(data.certificate.fileUrl, "_blank", "noopener,noreferrer");
  };

  return <View>
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside>
        <h2 className="mb-3 text-lg font-[700]">Your courses</h2>
        <div className="grid gap-2">{availableCourses.map((course) => <button key={course.id} className="rounded-[16px] border border-line p-4 text-left transition-colors hover:bg-surface aria-pressed:border-foreground aria-pressed:bg-surface" type="button" aria-pressed={course.id === selectedCourse.id} onClick={() => setSelectedCourseId(course.id)}><b className="block">{course.title}</b><span className="mt-1 flex items-center gap-1.5 text-sm text-muted"><Icon name={course.progress >= 100 ? "check" : "chart"} className="size-4" />{Math.round(course.progress)}% complete</span></button>)}</div>
      </aside>

      <section className="min-w-0">
        {certificateQuery.isPending ? <CertificateSkeleton /> : certificateQuery.isError ? <div className={`${card} grid justify-items-start gap-3`} role="alert"><Icon name="award" className="size-7 text-muted" /><div><b>Certificate status could not be loaded</b><p className="mt-1 text-sm text-muted">{certificateQuery.error.message}</p></div><button className={buttonGhostSmall} type="button" onClick={() => void certificateQuery.refetch()}>Try again</button></div> : <>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><span className="text-sm font-semibold text-accent-text">{ready ? "Certificate issued" : data.eligible ? "Completion verified" : "In progress"}</span><h2 className="mt-1 text-2xl font-[720]">{selectedCourse.title}</h2><p className="mt-1 text-sm text-muted">{ready ? "Your certificate is ready to view and download." : data.eligible ? "You have completed the course. An administrator still needs to issue the certificate." : "Complete the remaining requirements to unlock your certificate."}</p></div><span className="rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold">{Math.round(data.percent)}%</span></div>

          <div className="relative max-w-[820px] [container-type:inline-size]">
            <CertificateArtwork className={`shadow-[0_26px_60px_-28px_rgb(0_0_0/0.5)] ${ready ? "" : "saturate-50"}`} courseTitle={selectedCourse.title} recipientName={studentName} issuedAt={data.certificate?.issuedAt} certificateNumber={data.certificate?.number} backgroundUrl={data.certificate?.backgroundUrl} signatoryName={data.certificate?.signatoryName} signatoryTitle={data.certificate?.signatoryTitle} />
            {!ready ? <div className="absolute inset-0 grid place-items-center p-5 text-center"><div className="max-w-sm rounded-[18px] bg-background px-6 py-5 text-foreground shadow-[0_20px_50px_-20px_rgb(0_0_0/0.5)]"><Icon name={data.eligible ? "award" : "lock"} className="mx-auto mb-2 size-7" /><b className="block">{data.eligible ? "Awaiting certificate issue" : `${Math.round(data.percent)}% complete`}</b><p className="mt-1 text-sm text-muted">{data.eligible ? "Your learning remains available while an administrator issues the certificate." : "Finish every required condition to become eligible."}</p></div></div> : null}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3"><button className={button} type="button" disabled={!ready || !data.certificate?.fileUrl} onClick={openCertificate}><Icon name="download" />Download certificate</button>{data.certificate?.revoked ? <span className="text-sm font-semibold text-accent-text">This certificate has been revoked.</span> : ready && !data.certificate?.fileUrl ? <span className="text-sm text-muted">Certificate issued, but no downloadable URL was returned.</span> : null}</div>

          <section className={`${card} mt-6`}><h3 className="text-lg font-[700]">Completion checklist</h3><p className="mt-1 text-sm text-muted">This status comes directly from the course completion endpoint.</p>{data.requirements.length ? <ul className="mt-4 grid gap-2">{data.requirements.map((requirement) => <li key={requirement.id} className="flex items-start gap-3 rounded-xl border border-line p-3"><span className={`grid size-7 shrink-0 place-items-center rounded-full ${requirement.satisfied ? "bg-reward text-white" : "bg-surface-2"}`}><Icon name={requirement.satisfied ? "check" : "lock"} className="size-4" /></span><span><b className="block">{requirement.label}</b><span className="text-xs text-muted">{requirement.satisfied ? "Completed" : requirement.required ? "Required" : "Optional"}</span></span></li>)}</ul> : <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-sm text-muted">No individual requirement details were returned. Overall completion is {Math.round(data.percent)}%.</p>}</section>
        </>}
      </section>
    </div>
  </View>;
}

function CertificateSkeleton() {
  return <div className="animate-pulse" role="status" aria-label="Loading certificate"><div className="mb-5 h-20 rounded-[18px] bg-surface-2" /><div className="aspect-[1.414/1] max-w-[820px] rounded-xl bg-surface-2" /><div className="mt-5 h-12 w-48 rounded-full bg-surface-2" /></div>;
}
