import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

/** Applies the theme to the document root and animates the switch with a circular reveal. */
export function useTheme(initial: Theme) {
  const [theme, setTheme] = useState<Theme>(initial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = useCallback((origin?: {x: number;y: number;}) => {
    const next: Theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = (document as Document & {startViewTransition?: (cb: () => void) => {ready: Promise<void>;};}).
    startViewTransition;

    if (!origin || reduce || typeof start !== 'function') {
      setTheme(next);
      return;
    }

    try {
      const transition = start.call(document, () => {
        document.documentElement.dataset.theme = next;
        setTheme(next);
      });
      const radius = Math.hypot(
        Math.max(origin.x, window.innerWidth - origin.x),
        Math.max(origin.y, window.innerHeight - origin.y)
      );
      transition.ready.
      then(() => {
        document.documentElement.animate(
          {
            clipPath: [
            `circle(0px at ${origin.x}px ${origin.y}px)`,
            `circle(${radius}px at ${origin.x}px ${origin.y}px)`]

          },
          {
            duration: 650,
            easing: 'cubic-bezier(.2,.7,.2,1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      }).
      catch(() => undefined);
    } catch {
      setTheme(next);
    }
  }, []);

  return { theme, toggleTheme };
}