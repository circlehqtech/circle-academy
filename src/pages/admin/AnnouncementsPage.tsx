import { useDeferredValue, useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { asRecord, collection, extractId, unwrap } from "../../api/adapters";
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
import { button, buttonGhostSmall, fieldLabel, selectInput, table, tableWrap, textInput, textarea } from "../../styles";
import { formatDateTime } from "../../utils/dateTime";

type AnnouncementStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type AnnouncementAudience = "ALL" | "STUDENTS" | "FACILITATORS";

interface AdminAnnouncement {
  id: string;
  title: string;
  body: string;
  status: AnnouncementStatus;
  audience: AnnouncementAudience;
  courseId: string;
  courseTitle: string;
  createdAt: string;
}

interface AnnouncementDraft {
  title: string;
  body: string;
  audience: AnnouncementAudience;
  courseId: string;
}

const statusLabels: Record<AnnouncementStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const audienceLabels: Record<AnnouncementAudience, string> = {
  ALL: "Everyone",
  STUDENTS: "Students",
  FACILITATORS: "Facilitators",
};

function announcementStatus(value: unknown): AnnouncementStatus {
  const normalized = String(value ?? "DRAFT").toUpperCase();
  return normalized === "PUBLISHED" || normalized === "ARCHIVED" ? normalized : "DRAFT";
}

function announcementAudience(value: unknown): AnnouncementAudience {
  const normalized = String(value ?? "ALL").toUpperCase();
  return normalized === "STUDENTS" || normalized === "FACILITATORS" ? normalized : "ALL";
}

function readAnnouncement(value: unknown, courseNames: Map<string, string>): AdminAnnouncement {
  const outer = asRecord(unwrap(value));
  const record = asRecord(outer.announcement ?? outer);
  const course = asRecord(record.course);
  const courseId = String(record.courseId ?? course.id ?? "");
  return {
    id: extractId(record),
    title: String(record.title ?? "Untitled announcement"),
    body: String(record.body ?? record.message ?? ""),
    status: announcementStatus(record.status),
    audience: announcementAudience(record.audience),
    courseId,
    courseTitle: String(course.title ?? courseNames.get(courseId) ?? "Course"),
    createdAt: formatDateTime(record.publishedAt ?? record.createdAt ?? record.updatedAt),
  };
}

function statusTone(status: AnnouncementStatus) {
  if (status === "PUBLISHED") return "bg-[color-mix(in_srgb,var(--reward)_16%,var(--surface-2))] text-foreground";
  if (status === "ARCHIVED") return "bg-surface-2 text-muted";
  return "bg-[color-mix(in_srgb,var(--hq-amber)_24%,var(--surface-2))] text-foreground";
}

export function AnnouncementsPage() {
  const { courses } = useWorkspace();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const activeCourses = useMemo(() => courses.filter((course) => course.status !== "Archived"), [courses]);
  const courseNames = useMemo(() => new Map(courses.map((course) => [course.id, course.title])), [courses]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [status, setStatus] = useState<AnnouncementStatus>("DRAFT");
  const [audience, setAudience] = useState<AnnouncementAudience>("ALL");
  const [courseId, setCourseId] = useState("");
  const [draft, setDraft] = useState<AnnouncementDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState("");
  const selectedCourseId = activeCourses.some((course) => course.id === courseId) ? courseId : activeCourses[0]?.id ?? "";

  const filters = useMemo(() => ({
    search: deferredSearch,
    status,
    audience,
    courseId: selectedCourseId,
  }), [audience, deferredSearch, selectedCourseId, status]);

  const announcementsQuery = useQuery({
    queryKey: [...queryKeys.announcements.admin, filters],
    queryFn: () => lmsApi.admin.announcements(filters),
    enabled: Boolean(selectedCourseId),
    retry: false,
  });

  const announcements = useMemo(
    () => collection(announcementsQuery.data, "announcements").map((item) => readAnnouncement(item, courseNames)),
    [announcementsQuery.data, courseNames],
  );

  const openCreate = () => {
    setDraft({ title: "", body: "", audience, courseId: selectedCourseId });
  };

  const createAnnouncement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    setSaving(true);
    try {
      await lmsApi.admin.createAnnouncement({
        title: draft.title.trim(),
        body: draft.body.trim(),
        audience: draft.audience,
        courseId: draft.courseId,
      });
      setCourseId(draft.courseId);
      setAudience(draft.audience);
      setStatus("DRAFT");
      setSearch("");
      setDraft(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.announcements.admin }),
        queryClient.invalidateQueries({ queryKey: ["workspace"] }),
      ]);
      toast("Announcement created as a draft.");
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "The announcement could not be created.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (announcement: AdminAnnouncement, nextStatus: AnnouncementStatus) => {
    setPendingId(announcement.id);
    try {
      await lmsApi.admin.setAnnouncementStatus(announcement.id, nextStatus);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.announcements.admin }),
        queryClient.invalidateQueries({ queryKey: ["workspace"] }),
      ]);
      toast(`Announcement moved to ${statusLabels[nextStatus].toLowerCase()}.`);
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "The announcement status could not be updated.");
    } finally {
      setPendingId("");
    }
  };

  return (
    <View>
      <PageHeader
        description="Write course updates, choose who should receive them, and control when they appear in the announcement feed."
        actionLabel="Create announcement"
        actionIcon={<Icon name="bell" />}
        onAction={activeCourses.length ? openCreate : undefined}
      />

      {!activeCourses.length ? (
        <EmptyState icon="book" title="Create a course first" description="Every announcement is attached to a course, so you need an active course before you can publish an update." />
      ) : (
        <>
          <section className="mb-6 grid gap-4 rounded-[18px] border border-line bg-surface p-4 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_minmax(180px,1fr)_minmax(180px,1fr)_minmax(220px,1.2fr)]" aria-label="Announcement filters">
            <div>
              <label className={fieldLabel} htmlFor="announcement-search">Search</label>
              <div className="relative">
                <Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
                <input id="announcement-search" className={`${textInput} w-full pl-10`} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or message" />
              </div>
            </div>
            <div>
              <label className={fieldLabel} htmlFor="announcement-status">Status</label>
              <CustomSelect id="announcement-status" className={selectInput} value={status} onChange={(event) => setStatus(event.target.value as AnnouncementStatus)}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </CustomSelect>
            </div>
            <div>
              <label className={fieldLabel} htmlFor="announcement-audience">Audience</label>
              <CustomSelect id="announcement-audience" className={selectInput} value={audience} onChange={(event) => setAudience(event.target.value as AnnouncementAudience)}>
                <option value="ALL">Everyone</option>
                <option value="STUDENTS">Students</option>
                <option value="FACILITATORS">Facilitators</option>
              </CustomSelect>
            </div>
            <div>
              <label className={fieldLabel} htmlFor="announcement-course">Course</label>
              <CustomSelect id="announcement-course" className={selectInput} value={selectedCourseId} onChange={(event) => setCourseId(event.target.value)}>
                {activeCourses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </CustomSelect>
            </div>
          </section>

          {announcementsQuery.isPending ? (
            <div className="grid gap-3 rounded-[18px] border border-line p-5" role="status" aria-label="Loading announcements">
              {[1, 2, 3].map((item) => <span key={item} className="h-16 animate-pulse rounded-xl bg-surface-2" />)}
            </div>
          ) : announcementsQuery.isError ? (
            <EmptyState icon="help" title="Announcements could not be loaded" description="The filtered announcement request failed. Try again without reloading the rest of the workspace." actionLabel="Try again" onAction={() => void announcementsQuery.refetch()} />
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
                {announcements.length ? announcements.map((announcement) => (
                  <article key={`mobile-${announcement.id || announcement.title}`} className="rounded-[18px] border border-line bg-surface p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-[680] leading-tight">{announcement.title}</h2>
                        <p className="mt-2 text-sm text-muted">{announcement.body}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(announcement.status)}`}>{statusLabels[announcement.status]}</span>
                    </div>
                    <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 border-t border-line pt-3 text-sm">
                      <dt className="text-muted">Audience</dt><dd className="font-semibold">{audienceLabels[announcement.audience]}</dd>
                      <dt className="text-muted">Course</dt><dd className="font-semibold">{announcement.courseTitle}</dd>
                      <dt className="text-muted">Created</dt><dd className="font-semibold">{announcement.createdAt}</dd>
                    </dl>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {announcement.status !== "PUBLISHED" ? <button className={buttonGhostSmall} type="button" disabled={!announcement.id || pendingId === announcement.id} onClick={() => void updateStatus(announcement, "PUBLISHED")}>Publish</button> : null}
                      {announcement.status !== "DRAFT" ? <button className={buttonGhostSmall} type="button" disabled={!announcement.id || pendingId === announcement.id} onClick={() => void updateStatus(announcement, "DRAFT")}>Move to draft</button> : null}
                      {announcement.status !== "ARCHIVED" ? <button className={buttonGhostSmall} type="button" disabled={!announcement.id || pendingId === announcement.id} onClick={() => void updateStatus(announcement, "ARCHIVED")}>{pendingId === announcement.id ? "Saving…" : "Archive"}</button> : null}
                    </div>
                  </article>
                )) : <EmptyState icon="bell" title="No matching announcements" description="Try another status, audience, course, or search term—or create a new announcement for this course." actionLabel="Create announcement" onAction={openCreate} />}
              </div>

              <div className={`${tableWrap} hidden md:block`}>
              <table className={`${table} ${announcements.length ? "" : "!min-w-0"}`}>
                <thead>
                  <tr><th>Announcement</th><th>Audience</th><th className="hidden md:table-cell">Course</th><th>Status</th><th className="hidden lg:table-cell">Created</th><th><span className="sr-only">Actions</span></th></tr>
                </thead>
                <tbody>
                  {announcements.length ? announcements.map((announcement) => (
                    <tr key={announcement.id || `${announcement.title}-${announcement.createdAt}`}>
                      <td className="max-w-[440px]"><b className="block">{announcement.title}</b><span className="mt-1 block line-clamp-2 text-sm text-muted">{announcement.body}</span></td>
                      <td>{audienceLabels[announcement.audience]}</td>
                      <td className="hidden md:table-cell">{announcement.courseTitle}</td>
                      <td><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(announcement.status)}`}>{statusLabels[announcement.status]}</span></td>
                      <td className="hidden text-sm text-muted lg:table-cell">{announcement.createdAt}</td>
                      <td>
                        <div className="flex flex-wrap justify-end gap-2">
                          {announcement.status !== "PUBLISHED" ? <button className={buttonGhostSmall} type="button" disabled={!announcement.id || pendingId === announcement.id} onClick={() => void updateStatus(announcement, "PUBLISHED")}>Publish</button> : null}
                          {announcement.status !== "DRAFT" ? <button className={buttonGhostSmall} type="button" disabled={!announcement.id || pendingId === announcement.id} onClick={() => void updateStatus(announcement, "DRAFT")}>Move to draft</button> : null}
                          {announcement.status !== "ARCHIVED" ? <button className={buttonGhostSmall} type="button" disabled={!announcement.id || pendingId === announcement.id} onClick={() => void updateStatus(announcement, "ARCHIVED")}>{pendingId === announcement.id ? "Saving…" : "Archive"}</button> : null}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="!p-0"><EmptyState icon="bell" title="No matching announcements" description="Try another status, audience, course, or search term—or create a new announcement for this course." actionLabel="Create announcement" onAction={openCreate} className="border-0 bg-transparent" /></td></tr>
                  )}
                </tbody>
              </table>
              </div>
            </>
          )}
        </>
      )}

      {draft ? (
        <Modal title="Create announcement" subtitle="New announcements begin as drafts so you can review them before publishing." busy={saving} onClose={() => setDraft(null)}>
          <form className="grid gap-5" onSubmit={createAnnouncement} aria-busy={saving}>
            <div>
              <label className={fieldLabel} htmlFor="new-announcement-title">Title</label>
              <input id="new-announcement-title" className={`${textInput} w-full`} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} maxLength={160} placeholder="What learners need to know" required />
            </div>
            <div>
              <label className={fieldLabel} htmlFor="new-announcement-body">Message</label>
              <textarea id="new-announcement-body" className={`${textarea} min-h-40`} value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} placeholder="Share the update, timing, and any action learners should take." required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={fieldLabel} htmlFor="new-announcement-audience">Audience</label>
                <CustomSelect id="new-announcement-audience" className={selectInput} value={draft.audience} onChange={(event) => setDraft({ ...draft, audience: event.target.value as AnnouncementAudience })}>
                  <option value="ALL">Everyone</option>
                  <option value="STUDENTS">Students</option>
                  <option value="FACILITATORS">Facilitators</option>
                </CustomSelect>
              </div>
              <div>
                <label className={fieldLabel} htmlFor="new-announcement-course">Course</label>
                <CustomSelect id="new-announcement-course" className={selectInput} value={draft.courseId} onChange={(event) => setDraft({ ...draft, courseId: event.target.value })} required>
                  {activeCourses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                </CustomSelect>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
              <button className={buttonGhostSmall} type="button" disabled={saving} onClick={() => setDraft(null)}>Cancel</button>
              <button className={button} type="submit" disabled={saving || !draft.courseId}>{saving ? "Creating…" : "Create draft"}</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </View>
  );
}
