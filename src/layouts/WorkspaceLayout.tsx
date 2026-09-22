import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../features/auth/useAuth";
import { useWorkspace } from "../features/workspace/useWorkspace";
import { useTheme } from "../hooks/useTheme";
import { TITLES } from "../data/lms";
import { getViewFromPath } from "../utils/routes";
import { ROLE_HOME } from "../routes/routeConfig";

export function WorkspaceLayout({
  initialTheme,
}: {
  initialTheme: "light" | "dark";
}) {
  const { role, switchRole, logout } = useAuth();
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
  } = useWorkspace();

  const view = getViewFromPath(location.pathname);
  const title = useMemo(() => {
    if (view === "course") {
      const courseId = location.pathname.split("/").at(-1);
      return courses.find((course) => course.id === courseId)?.title ?? TITLES.course;
    }
    if (view === "courseBuilder" && location.pathname !== "/admin/courses/new") {
      return "Edit course";
    }
    return view ? TITLES[view] : "HQ Learn";
  }, [courses, location.pathname, view]);

  useEffect(() => {
    document.title = `${title} · HQ Learn`;
    window.scrollTo(0, 0);
  }, [location.pathname, title]);

  if (!role || !view) return null;

  return (
    <div className="grid min-h-screen grid-cols-[minmax(0,1fr)] min-[821px]:grid-cols-[248px_minmax(0,1fr)]">
      <Sidebar
        role={role}
        view={view}
        onRole={(nextRole) => {
          switchRole(nextRole);
          navigate(ROLE_HOME[nextRole]);
        }}
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
        <Outlet />
      </main>
    </div>
  );
}
