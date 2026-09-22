import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import type { Announcement } from '../types/lms';
import { linkButton } from '../styles';

interface TopBarProps {
  title: string;
  announcements: Announcement[];
  panelOpen: boolean;
  onTogglePanel: () => void;
  onClosePanel: () => void;
  onReadAll: () => void;
  onOpenProfile: () => void;
  onToggleTheme: (origin: {x: number;y: number;}) => void;
  theme: 'light' | 'dark';
}

export function TopBar({
  title,
  announcements,
  panelOpen,
  onTogglePanel,
  onClosePanel,
  onReadAll,
  onOpenProfile,
  onToggleTheme,
  theme
}: TopBarProps) {
  const wrap = useRef<HTMLElement>(null);
  const unread = announcements.filter((a) => a.unread).length;

  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClosePanel();
    };
    const onClick = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) onClosePanel();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('click', onClick);
    };
  }, [panelOpen, onClosePanel]);

  return (
    <header className="relative mb-7 flex items-center gap-4" ref={wrap}>
      <h1 className="flex-1 text-[clamp(26px,3.4vw,40px)] leading-[1.05] font-[720] tracking-[-0.025em] [font-stretch:90%]">{title}</h1>

      <button
        type="button"
        className="relative grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface transition-[transform,border-color] duration-200 ease-hq hover:border-muted active:scale-[0.94]"
        aria-label="Open profile and settings"
        onClick={onOpenProfile}>
        <Icon name="user" />
      </button>

      <button
        type="button"
        className="relative grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface transition-[transform,border-color] duration-200 ease-hq hover:border-muted active:scale-[0.94]"
        aria-label="Announcements"
        aria-expanded={panelOpen}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePanel();
        }}>
        
        <Icon name="bell" />
        {unread > 0 && <span className="absolute -top-[3px] -right-[3px] grid h-[19px] min-w-[19px] place-items-center rounded-[99px] bg-accent px-[5px] text-[11px] font-bold text-white">{unread}</span>}
      </button>

      <button
        type="button"
        className="relative grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface transition-[transform,border-color] duration-200 ease-hq hover:border-muted active:scale-[0.94]"
        aria-label="Switch between light and dark mode"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onToggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
        }}>
        
        <Icon name={theme === 'dark' ? 'moon' : 'sun'} />
      </button>

      <div className={`absolute top-14 right-0 z-20 w-[min(360px,calc(100vw-36px))] origin-top-right rounded-[18px] border border-line bg-surface p-2 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.45)] transition-[opacity,transform] duration-300 ease-hq ${panelOpen ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-2 scale-[0.98] opacity-0'}`} role="dialog" aria-label="Announcements">
        <header className="flex items-center justify-between px-3 pt-2.5 pb-2">
          <b className="text-base">Announcements</b>
          <button type="button" className={linkButton} onClick={onReadAll}>
            Mark all as read
          </button>
        </header>
        <div>
          {announcements.map((a) =>
          <div key={a.t} className="flex gap-3 rounded-xl border-line p-3 [&+div]:rounded-none [&+div]:border-t">
              <i className={`mt-[7px] size-[9px] shrink-0 rounded-full bg-accent transition-[opacity,transform] duration-300 ${a.unread ? '' : 'scale-0 opacity-0'}`} aria-hidden="true" />
              <div>
                <p className="leading-[1.35] font-[550]">{a.t}</p>
                <span className="text-[13px] text-muted">{a.m}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>);

}
