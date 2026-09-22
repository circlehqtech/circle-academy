import React, { useEffect, useState } from 'react';

/**
 * Wraps a page so it plays the shared enter animation and, one frame later,
 * gets the `go` class that drives progress rings, bars and chart growth.
 */
export function View({ children }: {children: React.ReactNode;}) {
  const [go, setGo] = useState(false);

  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setGo(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  return <section className={`animate-enter${go ? ' go' : ''}`}>{children}</section>;
}
