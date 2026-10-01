import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../features/auth/useAuth";
import { useWorkspace } from "../features/workspace/useWorkspace";
import { useTheme } from "../hooks/useTheme";
import { TITLES } from "../data/lms";
import { getViewFromPath } from "../utils/routes";
import { useCurrentAccount } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export function WorkspaceLayout({
  initialTheme,
}: {
  initialTheme: "light" | "dark";
}) {
  const { role, logout } = useAuth();
  const currentAccount = useCurrentAccount(Boolean(role));
  const updateAccount = useAuthStore((state) => state.updateAccount);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme(initialTheme);
  const {
    announcements,
    announcementPanelOpen,
    toggleAnnouncementPanel,
    closeAnnouncementPanel,
    markAllAnnouncementsRead,
    courses,
    isLoading,
    isError,
    refreshWorkspace,
  } = useWorkspace();

  const view = getViewFromPath(location.pathname);
  const pageOwnsLoading = view === "people";
  const title = useMemo(() => {
    if (view === "course") {
      const courseId = location.pathname.split("/").at(-1);
      return courses.find((course) => course.id === courseId)?.title ?? TITLES.course;
    }
    if (view === "courseBuilder" && location.pathname !== "/admin/courses/new") {
      return "Edit course";
    }
    if (view === "home") return `Welcome back${currentAccount.data?.firstName ? `, ${currentAccount.data.firstName}` : ""}`;
    return view ? TITLES[view] : "HQ Learn";
  }, [courses, currentAccount.data?.firstName, location.pathname, view]);

  useEffect(() => {
    document.title = `${title} · HQ Learn`;
    window.scrollTo(0, 0);
  }, [location.pathname, title]);

  useEffect(() => {
    if (currentAccount.data) updateAccount(currentAccount.data);
  }, [currentAccount.data, updateAccount]);

  if (!role || !view) return null;

  return (
    <div className="min-h-screen overflow-x-hidden min-[821px]:pl-[248px]">
      <Sidebar
        role={role}
        view={view}
        onProfile={() => navigate(`/${role}/profile`)}
        onSignOut={() => {
          logout();
          navigate('/auth', { replace: true });
        }}
      />

      <main className="mx-auto w-full min-w-0 max-w-[1240px] px-[clamp(18px,3.2vw,48px)] pt-6 pb-[100px] min-[821px]:pb-[72px]">
        <TopBar
          title={title}
          theme={theme}
          announcements={announcements}
          panelOpen={announcementPanelOpen}
          onTogglePanel={toggleAnnouncementPanel}
          onClosePanel={closeAnnouncementPanel}
          onReadAll={markAllAnnouncementsRead}
          onOpenProfile={() => navigate(`/${role}/profile`)}
          onToggleTheme={toggleTheme}
        />
        {isLoading && !pageOwnsLoading ? <WorkspaceSkeleton /> : (
          <>
            {isError ? (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-line bg-surface px-4 py-3 text-sm text-muted" role="status">
                <span>Some workspace data could not be loaded. You can still use the sections that are available.</span>
                <button className="rounded-full border border-line px-3 py-1.5 font-semibold text-ink transition hover:bg-surface-2" type="button" onClick={refreshWorkspace}>Try again</button>
              </div>
            ) : null}
            <Outlet />
          </>
        )}
      </main>
    </div>
  );
}

function WorkspaceSkeleton() {
  return <div className="animate-pulse" aria-label="Loading workspace"><div className="mb-6 h-20 rounded-[18px] bg-surface-2" /><div className="grid gap-4 md:grid-cols-2"><div className="h-64 rounded-[18px] bg-surface-2" /><div className="h-64 rounded-[18px] bg-surface-2" /></div></div>;
}
