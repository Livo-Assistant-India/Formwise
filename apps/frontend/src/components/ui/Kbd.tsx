import type { ReactNode } from "react";

/** A keyboard key hint, e.g. <Kbd>C</Kbd>. `onDark` for use on the ink header or buttons. */
export default function Kbd({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  const tone = onDark ? "border-white/20 bg-white/10 text-white/70" : "border-line bg-canvas text-muted";
  return (
    <kbd className={`inline-grid h-[18px] min-w-[18px] place-items-center rounded border px-1 font-sans text-[10px] font-medium leading-none ${tone}`}>
      {children}
    </kbd>
  );
}
