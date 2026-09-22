import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

interface ToastValue {
  toast: (message: string) => void;
}

const Ctx = createContext<ToastValue>({ toast: () => undefined });

export function useToast(): ToastValue {
  return useContext(Ctx);
}

export function ToastProvider({ children }: {children: React.ReactNode;}) {
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const toast = useCallback((m: string) => {
    setMessage(m);
    setShow(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShow(false), 2600);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div
        className={`pointer-events-none fixed left-1/2 z-50 max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-[99px] bg-foreground px-5 py-3 text-center text-[14.5px] font-semibold text-background transition-[opacity,transform] duration-[400ms] ease-hq max-[820px]:bottom-[calc(90px+env(safe-area-inset-bottom,0px))] min-[821px]:bottom-[calc(26px+env(safe-area-inset-bottom,0px))] ${show ? 'translate-y-0 opacity-100' : 'translate-y-[30px] opacity-0'}`}
        role="status"
        aria-live="polite">
        {message}
      </div>
    </Ctx.Provider>);

}
