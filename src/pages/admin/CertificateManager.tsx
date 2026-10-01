import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { accountName, useAdminAccounts } from "../../api/adminAccounts";
import { asRecord, collection, unwrap } from "../../api/adapters";
import { queryKeys } from "../../api/endpoints";
import { lmsApi } from "../../api/lmsApi";
import { Icon } from "../../components/Icon";
import { CertificateArtwork } from "../../components/CertificateArtwork";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { EmptyState } from "../../components/ui/EmptyState";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { View } from "../../components/View";
import { useToast } from "../../contexts/ToastContext";
import { useWorkspace } from "../../features/workspace/useWorkspace";
import { button, buttonGhost, buttonGhostSmall, card, fieldLabel, selectInput, table, tableWrap, textInput } from "../../styles";
import { formatDate } from "../../utils/dateTime";
import { externalHttpUrl } from "../../utils/externalMedia";

type AdditionalRequirementType = "ASSESSMENT_PASSED" | "SUBMISSION_APPROVED";

function text(value: unknown, fallback = "") {
  return value == null || value === "" ? fallback : String(value);
}

function templateRecord(value: unknown) {
  const envelope = asRecord(unwrap(value));
  const record = asRecord(envelope.template ?? envelope.certificateTemplate ?? envelope);
  return {
    name: text(record.name, "Circle HQ Academy completion certificate"),
    designerTemplateId: text(record.designerTemplateId),
    previewUrl: text(record.previewUrl),
    version: Number(record.version ?? 1) || 1,
    signatoryName: text(record.signatoryName),
    signatoryTitle: text(record.signatoryTitle),
  };
}

function loadCanvasImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The template image could not be prepared for signing."));
    image.src = url;
  });
}

function canvasFile(canvas: HTMLCanvasElement, name: string) {
  return new Promise<File>((resolve, reject) => canvas.toBlob((blob) => {
    if (!blob) { reject(new Error("The signed template image could not be created.")); return; }
    resolve(new File([blob], name, { type: "image/png" }));
  }, "image/png"));
}

export function CertificateManager() {
  const { toast } = useToast();
  const { courses, students } = useWorkspace();
  const queryClient = useQueryClient();
  const studentAccounts = useAdminAccounts("STUDENT");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [savingCourseRule, setSavingCourseRule] = useState(false);
  const [savingRequirement, setSavingRequirement] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [pendingCertificateId, setPendingCertificateId] = useState("");
  const [issueAccountId, setIssueAccountId] = useState("");
  const [settingsPanel, setSettingsPanel] = useState<"template" | "eligibility" | null>(null);
  const [requirementType, setRequirementType] = useState<AdditionalRequirementType>("ASSESSMENT_PASSED");
  const [requirementTargetId, setRequirementTargetId] = useState("");
  const [requirementLabel, setRequirementLabel] = useState("");
  const [template, setTemplate] = useState(() => templateRecord(null));
  const templateInput = useRef<HTMLInputElement>(null);
  const signatureCanvas = useRef<HTMLCanvasElement>(null);
  const signing = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0];
  const courseId = selectedCourse?.id ?? "";
  const lessons = selectedCourse?.modules.flatMap((module) => module.lessons) ?? [];
  const assessments = selectedCourse?.assessments ?? [];

  const requirementsQuery = useQuery({
    queryKey: queryKeys.admin.completionRequirements(courseId),
    queryFn: () => lmsApi.admin.completionRequirements(courseId),
    enabled: Boolean(courseId),
    retry: false,
    refetchOnWindowFocus: false,
  });
  const templateQuery = useQuery({
    queryKey: queryKeys.admin.certificateTemplate(courseId),
    queryFn: () => lmsApi.admin.certificateTemplate(courseId),
    enabled: Boolean(courseId),
    retry: false,
    refetchOnWindowFocus: false,
  });
  const certificatesQuery = useQuery({
    queryKey: queryKeys.admin.certificates(courseId),
    queryFn: () => lmsApi.admin.certificates(courseId),
    enabled: Boolean(courseId),
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (templateQuery.data) setTemplate(templateRecord(templateQuery.data));
    else if (!templateQuery.isPending) setTemplate(templateRecord(null));
  }, [courseId, templateQuery.data, templateQuery.isPending]);

  const requirements = collection(requirementsQuery.data, "completionRequirements", "requirements").map((value, index) => {
    const outer = asRecord(value);
    const record = asRecord(outer.requirement ?? outer);
    return {
      id: text(record.id, `${record.type ?? "requirement"}-${index}`),
      rawType: text(record.type),
      type: text(record.type, "REQUIREMENT").replaceAll("_", " "),
      targetId: text(record.targetId ?? record.lessonId ?? record.assessmentId ?? record.submissionId),
      label: text(record.label, "Completion requirement"),
      required: record.required !== false,
    };
  });
  const configuredLessonIds = new Set(requirements.filter((requirement) => requirement.required && requirement.rawType === "LESSON_COMPLETED").map((requirement) => requirement.targetId));
  const missingLessons = lessons.filter((lesson) => !configuredLessonIds.has(lesson.id));
  const configuredLessonCount = lessons.length - missingLessons.length;
  const certificates = collection(certificatesQuery.data, "certificates").map((value) => {
    const outer = asRecord(value);
    const record = asRecord(outer.certificate ?? outer);
    const account = asRecord(outer.account ?? outer.student ?? record.account ?? record.student);
    return {
      id: text(record.id ?? record.certificateId),
      number: text(record.certificateNumber ?? record.number, "—"),
      student: `${text(account.firstName)} ${text(account.lastName)}`.trim() || text(record.studentName ?? record.name, "Student"),
      issuedAt: text(record.issuedAt ?? record.createdAt),
      revoked: Boolean(record.revokedAt) || text(record.status).toUpperCase() === "REVOKED",
      fileUrl: externalHttpUrl(text(record.fileUrl ?? record.url ?? record.downloadUrl ?? record.certificateUrl ?? record.pdfUrl)),
    };
  });

  const assignedIds = useMemo(() => new Set(students.filter((student) => student.courseIds.includes(courseId)).map((student) => student.id)), [courseId, students]);
  const candidates = (studentAccounts.data ?? []).filter((account) => text(account.status).toUpperCase() === "ACTIVE").sort((a, b) => Number(assignedIds.has(b.id)) - Number(assignedIds.has(a.id)));

  const selectCourse = (id: string) => {
    setSelectedCourseId(id);
    setSettingsPanel(null);
    setIssueAccountId("");
    setRequirementTargetId("");
    setRequirementLabel("");
  };

  const saveTemplate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!courseId) return;
    setSavingTemplate(true);
    try {
      let templateToSave = template;
      if (hasSignature && signatureCanvas.current) {
        const signedTemplate = document.createElement("canvas");
        signedTemplate.width = 1600;
        signedTemplate.height = 1132;
        const context = signedTemplate.getContext("2d");
        if (!context) throw new Error("The certificate signing canvas is unavailable.");
        context.fillStyle = "#f7f2e7";
        context.fillRect(0, 0, signedTemplate.width, signedTemplate.height);
        const previewUrl = externalHttpUrl(template.previewUrl);
        if (previewUrl) {
          const background = await loadCanvasImage(previewUrl);
          context.drawImage(background, 0, 0, signedTemplate.width, signedTemplate.height);
        } else {
          context.strokeStyle = "#d81616";
          context.lineWidth = 7;
          context.strokeRect(42, 42, 1516, 1048);
          context.strokeStyle = "#c7a35e";
          context.lineWidth = 3;
          context.strokeRect(62, 62, 1476, 1008);
        }
        context.drawImage(signatureCanvas.current, 0, 0, signatureCanvas.current.width, signatureCanvas.current.height, 555, 820, 490, 132);
        const signedFile = await canvasFile(signedTemplate, `${selectedCourse.id}-signed-certificate-template.png`);
        const signedUpload = await lmsApi.uploads.create(signedFile, "certificate-template");
        templateToSave = { ...template, previewUrl: signedUpload.url, designerTemplateId: signedUpload.publicId };
      }
      await lmsApi.admin.upsertCertificateTemplate(courseId, {
        name: templateToSave.name.trim(),
        version: templateToSave.version,
        ...(templateToSave.designerTemplateId.trim() ? { designerTemplateId: templateToSave.designerTemplateId.trim() } : {}),
        ...(externalHttpUrl(templateToSave.previewUrl) ? { previewUrl: externalHttpUrl(templateToSave.previewUrl) } : {}),
        ...(templateToSave.signatoryName.trim() ? { signatoryName: templateToSave.signatoryName.trim() } : {}),
        ...(templateToSave.signatoryTitle.trim() ? { signatoryTitle: templateToSave.signatoryTitle.trim() } : {}),
      });
      setTemplate(templateToSave);
      clearSignature();
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.certificateTemplate(courseId) });
      toast("Certificate template saved for this course.");
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "The certificate template could not be saved.");
    } finally {
      setSavingTemplate(false);
    }
  };

  const signaturePoint = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvas.current;
    if (!canvas) return { x: 0, y: 0 };
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * (canvas.width / bounds.width), y: (event.clientY - bounds.top) * (canvas.height / bounds.height) };
  };

  const startSignature = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvas.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const point = signaturePoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.strokeStyle = "#151515";
    context.lineWidth = 4;
    context.lineCap = "round";
    context.lineJoin = "round";
    signing.current = true;
  };

  const drawSignature = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!signing.current) return;
    const context = signatureCanvas.current?.getContext("2d");
    if (!context) return;
    event.preventDefault();
    const point = signaturePoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    setHasSignature(true);
  };

  const stopSignature = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    signing.current = false;
    if (signatureCanvas.current?.hasPointerCapture(event.pointerId)) signatureCanvas.current.releasePointerCapture(event.pointerId);
  };

  const clearSignature = () => {
    const canvas = signatureCanvas.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    signing.current = false;
    setHasSignature(false);
  };

  const uploadTemplate = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast("Choose an image file for the certificate template."); return; }
    setUploadingTemplate(true);
    try {
      const upload = await lmsApi.uploads.create(file, "certificate-template");
      setTemplate((current) => ({ ...current, previewUrl: upload.url, designerTemplateId: upload.publicId }));
      toast("Template image uploaded. Save the template to finish attaching it.");
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "The template image could not be uploaded.");
    } finally {
      setUploadingTemplate(false);
      if (templateInput.current) templateInput.current.value = "";
    }
  };

  const addRequirement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const targetRequired = requirementType === "ASSESSMENT_PASSED";
    if (!courseId || !requirementLabel.trim() || (targetRequired && !requirementTargetId)) return;
    setSavingRequirement(true);
    try {
      await lmsApi.admin.createCompletionRequirement(courseId, {
        type: requirementType,
        ...(requirementTargetId ? { targetId: requirementTargetId } : {}),
        label: requirementLabel.trim(),
        required: true,
        position: requirements.length + 1,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.completionRequirements(courseId) });
      setRequirementLabel("");
      setRequirementTargetId("");
      toast("Completion requirement added.");
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "The completion requirement could not be added.");
    } finally {
      setSavingRequirement(false);
    }
  };

  const requireAllLessons = async () => {
    if (!courseId) return;
    if (!lessons.length) {
      toast("Add lessons to this course before configuring course completion.");
      return;
    }
    if (!missingLessons.length) {
      toast("Every lesson is already required for course completion.");
      return;
    }
    setSavingCourseRule(true);
    try {
      await Promise.all(missingLessons.map((lesson, index) => lmsApi.admin.createCompletionRequirement(courseId, {
        type: "LESSON_COMPLETED",
        targetId: lesson.id,
        label: `Complete ${lesson.title}`,
        required: true,
        position: requirements.length + index + 1,
      })));
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.completionRequirements(courseId) });
      toast(missingLessons.length === 1 ? "The remaining lesson is now required for course completion." : `${missingLessons.length} missing lessons are now required for course completion.`);
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "The course completion rule could not be configured.");
    } finally {
      setSavingCourseRule(false);
    }
  };

  const issueCertificate = async () => {
    if (!courseId || !issueAccountId) return;
    setIssuing(true);
    try {
      await lmsApi.admin.issueCertificate(courseId, issueAccountId);
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.certificates(courseId) });
      setIssueAccountId("");
      toast("Certificate issued successfully.");
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "The certificate could not be issued. Confirm that every required condition is complete.");
    } finally {
      setIssuing(false);
    }
  };

  const revokeCertificate = async (certificateId: string) => {
    if (!certificateId) return;
    setPendingCertificateId(certificateId);
    try {
      await lmsApi.admin.revokeCertificate(certificateId);
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.certificates(courseId) });
      toast("Certificate revoked.");
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "The certificate could not be revoked.");
    } finally {
      setPendingCertificateId("");
    }
  };

  if (!selectedCourse) return <View><EmptyState icon="award" title="No courses available" description="Create a course before adding its certificate template and student eligibility rules." /></View>;

  const targetOptions = requirementType === "ASSESSMENT_PASSED"
    ? assessments.map((assessment) => ({ id: assessment.id, label: assessment.title }))
    : [];
  const requirementTargetRequired = requirementType === "ASSESSMENT_PASSED";

  return <View>
    <PageHeader description="Issue and manage course certificates." />
    <div className="mb-6 max-w-md"><label className={fieldLabel} htmlFor="certificate-course">Course</label><CustomSelect id="certificate-course" className={selectInput} value={courseId} onChange={(event) => selectCourse(event.target.value)}>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</CustomSelect></div>

    <section className={card}>
      <div><h2 className="text-xl font-[700]">Issue a certificate</h2><p className="mt-1 text-sm text-muted">Choose a student who has completed this course.</p></div>
      <div className="mt-5 grid gap-3 rounded-[16px] bg-surface-2 p-4 sm:grid-cols-[minmax(240px,380px)_auto] sm:items-end sm:justify-start">
        <div><label className={fieldLabel} htmlFor="certificate-student">Student</label><CustomSelect id="certificate-student" className={selectInput} value={issueAccountId} onChange={(event) => setIssueAccountId(event.target.value)}><option value="">Select a student</option>{candidates.map((account) => <option key={account.id} value={account.id}>{accountName(account)}{assignedIds.has(account.id) ? " · Enrolled" : ""}</option>)}</CustomSelect></div>
        <button className={`${button} min-h-12 whitespace-nowrap px-6`} type="button" disabled={!issueAccountId || issuing} onClick={() => void issueCertificate()}>{issuing ? <><Spinner />Issuing…</> : <><Icon name="award" />Issue certificate</>}</button>
      </div>

      {certificatesQuery.isPending ? <div className="mt-5"><BlockSkeleton rows={2} /></div> : certificatesQuery.isError ? <div className="mt-5"><LoadError message="Issued certificates could not be loaded." retry={() => void certificatesQuery.refetch()} /></div> : certificates.length ? <div className="mt-6"><h3 className="mb-3 font-[700]">Issued certificates</h3><div className={tableWrap}><table className={table}><thead><tr><th>Student</th><th>Certificate ID</th><th>Issued</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{certificates.map((certificate) => <tr key={certificate.id || certificate.number}><td><b>{certificate.student}</b></td><td className="font-mono text-xs">{certificate.number}</td><td>{certificate.issuedAt ? formatDate(certificate.issuedAt) : "—"}</td><td><span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold">{certificate.revoked ? "Revoked" : "Issued"}</span></td><td><div className="flex justify-end gap-2">{certificate.fileUrl ? <a className={buttonGhostSmall} href={certificate.fileUrl} target="_blank" rel="noopener noreferrer">View</a> : null}{!certificate.revoked ? <button className={buttonGhostSmall} type="button" disabled={pendingCertificateId === certificate.id} onClick={() => void revokeCertificate(certificate.id)}>{pendingCertificateId === certificate.id ? "Revoking…" : "Revoke"}</button> : null}</div></td></tr>)}</tbody></table></div></div> : <div className="mt-5 flex items-center gap-3 rounded-[16px] border border-dashed border-line px-4 py-3 text-sm text-muted"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2"><Icon name="award" className="size-4" /></span><span>No certificates have been issued for this course.</span></div>}
    </section>

    <section className={`${card} mt-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-[700]">Certificate setup</h2><p className="mt-1 text-sm text-muted">Change these only when the course certificate needs updating.</p></div></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="flex items-center justify-between gap-4 rounded-[16px] border border-line p-4"><div className="min-w-0"><b className="block">Design</b><span className="text-sm text-muted">{templateQuery.data ? template.name : "Not configured"}</span></div><button className={`${buttonGhostSmall} shrink-0`} type="button" onClick={() => setSettingsPanel("template")}>Edit</button></div>
        <div className="flex items-center justify-between gap-4 rounded-[16px] border border-line p-4"><div className="min-w-0"><b className="block">Student eligibility</b><span className="text-sm text-muted">{configuredLessonCount} of {lessons.length} lessons required</span></div><button className={`${buttonGhostSmall} shrink-0`} type="button" onClick={() => setSettingsPanel("eligibility")}>Manage</button></div>
      </div>
    </section>

    {settingsPanel === "template" ? <Modal title="Certificate design" subtitle={selectedCourse.title} size="wide" busy={savingTemplate || uploadingTemplate} onClose={() => setSettingsPanel(null)}>{templateQuery.isPending ? <BlockSkeleton rows={4} /> : <form className="grid gap-4" onSubmit={saveTemplate} aria-busy={savingTemplate || uploadingTemplate}>
      <CertificateArtwork className="mx-auto w-full max-w-2xl border border-line shadow-[0_24px_60px_-30px_rgb(0_0_0/.5)]" courseTitle={selectedCourse.title} backgroundUrl={externalHttpUrl(template.previewUrl)} signatoryName={template.signatoryName || "Authorized signatory"} signatoryTitle={template.signatoryTitle || "Academy Director"} />
      <input ref={templateInput} className="sr-only" type="file" accept="image/*" disabled={uploadingTemplate || savingTemplate} onChange={(event) => void uploadTemplate(event.target.files?.[0])} />
      <button className={buttonGhost} type="button" disabled={uploadingTemplate || savingTemplate} onClick={() => templateInput.current?.click()}><Icon name="upload" />{uploadingTemplate ? "Uploading image…" : "Upload template image"}</button>
      <div><label className={fieldLabel} htmlFor="template-name">Template name</label><input id="template-name" className={`${textInput} w-full`} value={template.name} onChange={(event) => setTemplate({ ...template, name: event.target.value })} required /></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><label className={fieldLabel} htmlFor="signatory-name">Signatory name</label><input id="signatory-name" className={`${textInput} w-full`} value={template.signatoryName} onChange={(event) => setTemplate({ ...template, signatoryName: event.target.value })} /></div><div><label className={fieldLabel} htmlFor="signatory-title">Signatory title</label><input id="signatory-title" className={`${textInput} w-full`} value={template.signatoryTitle} onChange={(event) => setTemplate({ ...template, signatoryTitle: event.target.value })} /></div></div>
      <div><div className="mb-2 flex items-end justify-between gap-3"><div><label className="block text-sm font-semibold" htmlFor="certificate-signature">Signature</label><p className="mt-1 text-sm text-muted">Sign with a mouse, pen, or finger. The signature is added to the saved template.</p></div><button className={buttonGhostSmall} type="button" disabled={!hasSignature || savingTemplate} onClick={clearSignature}>Clear</button></div><canvas ref={signatureCanvas} id="certificate-signature" width="900" height="240" className="h-40 w-full touch-none cursor-crosshair rounded-[14px] border-[1.5px] border-line bg-white shadow-inner" aria-label="Draw the certificate signature" onPointerDown={startSignature} onPointerMove={drawSignature} onPointerUp={stopSignature} onPointerCancel={stopSignature} onPointerLeave={(event) => { if (event.buttons === 0) stopSignature(event); }} /></div>
      <button className={button} type="submit" disabled={savingTemplate || uploadingTemplate}>{savingTemplate ? <><Spinner />Saving template…</> : <><Icon name="save" />Save template</>}</button>
    </form>}</Modal> : null}

    {settingsPanel === "eligibility" ? <Modal title="Student eligibility" subtitle={selectedCourse.title} size="drawer" busy={savingCourseRule || savingRequirement} onClose={() => setSettingsPanel(null)}>
      <div className="rounded-[18px] border border-line bg-surface-2 p-4"><div className="flex flex-wrap items-start justify-between gap-4"><div><b className="block">Complete every lesson</b><p className="mt-1 text-sm text-muted">{configuredLessonCount} of {lessons.length} lessons are currently required.</p></div><button className={buttonGhost} type="button" disabled={savingCourseRule || !lessons.length || !missingLessons.length} onClick={() => void requireAllLessons()}>{savingCourseRule ? <><Spinner />Updating…</> : missingLessons.length ? `Add ${missingLessons.length} missing ${missingLessons.length === 1 ? "lesson" : "lessons"}` : <><Icon name="check" />All lessons required</>}</button></div>{!lessons.length ? <p className="mt-3 text-sm font-semibold text-accent-text">Add lessons before enabling certificates.</p> : null}</div>
      <div className="mt-5">{requirementsQuery.isPending ? <BlockSkeleton rows={3} /> : requirementsQuery.isError ? <LoadError message="Eligibility rules could not be loaded." retry={() => void requirementsQuery.refetch()} /> : requirements.length ? <ol className="grid gap-2">{requirements.map((requirement, index) => <li key={requirement.id} className="flex items-start gap-3 rounded-xl border border-line p-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-bold">{index + 1}</span><span><b className="block">{requirement.label}</b><span className="text-xs text-muted">{requirement.type}{requirement.required ? " · Required" : " · Optional"}</span></span></li>)}</ol> : <p className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">No student eligibility rules yet.</p>}</div>
      <form className="mt-6 grid gap-4 border-t border-line pt-5" onSubmit={addRequirement} aria-busy={savingRequirement}>
        <div><h3 className="font-[700]">Add another requirement</h3><p className="mt-1 text-sm text-muted">Optionally require an assessment or an approved course submission.</p></div>
        <div><label className={fieldLabel} htmlFor="requirement-type">What must the student do?</label><CustomSelect id="requirement-type" className={selectInput} value={requirementType} onChange={(event) => { setRequirementType(event.target.value as AdditionalRequirementType); setRequirementTargetId(""); }}><option value="ASSESSMENT_PASSED">Pass an assessment</option><option value="SUBMISSION_APPROVED">Get a project or assignment approved</option></CustomSelect></div>
        {requirementType === "ASSESSMENT_PASSED" ? <div><label className={fieldLabel} htmlFor="requirement-target">Which assessment must they pass?</label><CustomSelect id="requirement-target" className={selectInput} value={requirementTargetId} onChange={(event) => { const nextId = event.target.value; setRequirementTargetId(nextId); const selectedAssessment = targetOptions.find((option) => option.id === nextId); if (selectedAssessment && !requirementLabel.trim()) setRequirementLabel(`Pass ${selectedAssessment.label}`); }} required disabled={!targetOptions.length}><option value="">{targetOptions.length ? "Select an assessment" : "No assessments available for this course"}</option>{targetOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</CustomSelect>{!targetOptions.length ? <p className="mt-2 text-sm text-muted">Create an assessment for this course before adding this requirement.</p> : null}</div> : <div className="rounded-[14px] bg-surface-2 px-4 py-3 text-sm"><b className="block">Approved course submission</b><span className="text-muted">This is satisfied when the student's project or assignment submission is approved. No internal ID is needed.</span></div>}
        <div><label className={fieldLabel} htmlFor="requirement-label">How should this appear to students?</label><input id="requirement-label" className={`${textInput} w-full`} value={requirementLabel} onChange={(event) => setRequirementLabel(event.target.value)} placeholder={requirementType === "ASSESSMENT_PASSED" ? "Pass the final assessment" : "Get the final project approved"} required /></div>
        <button className={button} type="submit" disabled={savingRequirement || !requirementLabel.trim() || (requirementTargetRequired && !requirementTargetId)}>{savingRequirement ? <><Spinner />Adding…</> : <><Icon name="plus" />Add requirement</>}</button>
      </form>
    </Modal> : null}
  </View>;
}

function Spinner() {
  return <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />;
}

function BlockSkeleton({ rows }: { rows: number }) {
  return <div className="grid gap-3" role="status" aria-label="Loading certificate data">{Array.from({ length: rows }, (_, index) => <span key={index} className="h-12 animate-pulse rounded-xl bg-surface-2" />)}</div>;
}

function LoadError({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="grid justify-items-start gap-3 rounded-xl border border-line p-4"><p className="text-sm">{message}</p><button className={buttonGhostSmall} type="button" onClick={retry}>Try again</button></div>;
}
