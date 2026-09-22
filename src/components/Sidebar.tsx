import { useLayoutEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from './Icon';
import { PEOPLE } from '../data/lms';
import { ROLE_NAVIGATION } from '../routes/routeConfig';
import type { Role, ViewId } from '../types/lms';


interface SidebarProps {
  role: Role;
  view: ViewId;
  onRole: (role: Role) => void;
  onProfile: () => void;
  onSignOut: () => void;
}

const ROLES: Array<{ id: Role; label: string }> = [
  { id: 'student', label: 'Student' },
  { id: 'facilitator', label: 'Facilitator' },
  { id: 'admin', label: 'Admin' },
];

export function Sidebar({ role, view, onRole, onProfile, onSignOut }: SidebarProps) {
  const navRef = useRef<HTMLElement>(null);
  const [ind, setInd] = useState<{y: number;h: number;} | null>(null);
  const items = ROLE_NAVIGATION[role];
  const activeId: ViewId = view === 'course' ? 'courses' : view === 'courseBuilder' ? 'adminCourses' : view;
  const me = PEOPLE[role];

  useLayoutEffect(() => {
    const move = () => {
      const el = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
      if (!el) {
        setInd(null);
        return;
      }
      setInd({ y: el.offsetTop, h: el.offsetHeight });
    };
    move();
    window.addEventListener('resize', move);
    if (document.fonts) document.fonts.ready.then(move).catch(() => undefined);
    return () => window.removeEventListener('resize', move);
  }, [role, activeId]);

  return (
    <aside className="flex h-auto flex-row flex-wrap items-center gap-3 border-0 px-[18px] pt-3.5 min-[481px]:flex-nowrap min-[821px]:sticky min-[821px]:top-[env(safe-area-inset-top,0px)] min-[821px]:h-screen min-[821px]:flex-col min-[821px]:items-stretch min-[821px]:gap-[22px] min-[821px]:border-r min-[821px]:border-line min-[821px]:px-4 min-[821px]:pt-6 min-[821px]:pb-5">
      <div className="flex items-center gap-2.5 px-2 text-[19px] font-[750] tracking-[-0.02em]">
        <span className="relative size-7 shrink-0 rounded-full bg-accent after:absolute after:-right-0.5 after:-bottom-0.5 after:size-2.5 after:rounded-full after:bg-reward after:shadow-[0_0_0_3px_var(--bg)]" aria-hidden="true" />
        HQ Learn
      </div>
      <button
        type="button"
        className="ml-auto grid size-10 place-items-center rounded-full border border-line text-muted hover:text-accent-text min-[821px]:hidden"
        aria-label="Sign out"
        onClick={onSignOut}
      >
        <Icon name="logout" className="size-4" />
      </button>

      <div className="grid w-full grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1" role="group" aria-label="Development role switcher">
        {ROLES.map((item) => (
          <button
            key={item.id}
            type="button"
            className="rounded-[9px] px-1 py-2 text-center text-[12px] font-semibold text-muted transition-colors aria-pressed:bg-background aria-pressed:text-foreground"
            aria-pressed={role === item.id}
            onClick={() => onRole(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex flex-row justify-start gap-0 overflow-x-auto border-t border-line bg-background px-1.5 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[821px]:relative min-[821px]:inset-auto min-[821px]:z-auto min-[821px]:flex-col min-[821px]:gap-1 min-[821px]:overflow-visible min-[821px]:border-0 min-[821px]:bg-transparent min-[821px]:p-0" aria-label="Main" ref={navRef}>
        <span
          className="absolute inset-x-0 top-0 hidden h-11 rounded-xl bg-foreground opacity-0 transition-[transform,height] duration-300 ease-hq min-[821px]:block"
          aria-hidden="true"
          style={
          ind ?
          { transform: `translateY(${ind.y}px)`, height: `${ind.h}px`, opacity: 1 } :
          undefined
          } />
        
        {items.map((item) =>
        <NavLink
          key={item.id}
          to={item.path}
          type="button"
          className="relative z-[1] flex min-w-[74px] flex-none flex-col items-center justify-center gap-[3px] rounded-xl px-0.5 py-2 text-center text-[11.5px] font-[550] text-muted transition-colors duration-200 hover:text-foreground aria-[current=page]:text-accent-text min-[821px]:min-w-0 min-[821px]:flex-row min-[821px]:justify-start min-[821px]:gap-3 min-[821px]:px-3.5 min-[821px]:py-[11px] min-[821px]:text-left min-[821px]:text-[15px] min-[821px]:aria-[current=page]:text-background"
          aria-current={activeId === item.id ? 'page' : undefined}>
          
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        )}
      </nav>

      <div className="mt-auto hidden border-t border-line pt-2 min-[821px]:block">
        <button type="button" className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-surface-2" onClick={onProfile}>
          <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-hq-red-ink text-sm font-bold text-hq-bone" aria-hidden="true">
            {me.initials}
          </span>
          <div className="min-w-0 flex-1">
            <b className="block truncate leading-tight font-semibold">{me.name}</b>
            <span className="block truncate text-[13px] text-muted">{me.sub}</span>
          </div>
          <Icon name="settings" className="size-4 text-muted" />
        </button>
        <button type="button" className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-accent-text" onClick={onSignOut}>
          <Icon name="logout" className="size-4" />
          Sign out
        </button>
      </div>
    </aside>);

}
