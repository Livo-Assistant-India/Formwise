import type { ReactNode } from "react";

interface PageContainerProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Full width, full height of the shell. A title bar on top; the body fills the rest and scrolls only if
 * its content truly can't fit. */
export default function PageContainer({ title, description, actions, children }: PageContainerProps) {
  return (
    <div className="flex h-full flex-col">
      {title || actions ? (
        <div className="flex flex-wrap items-center gap-4 border-b border-line bg-white px-5 py-2.5">
          <div className="min-w-0">
            {title ? <h1 className="text-[15px] font-semibold tracking-tight">{title}</h1> : null}
            {description ? <p className="text-[11px] text-muted">{description}</p> : null}
          </div>
          {actions ? <div className="ml-auto flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-auto px-5 py-4">{children}</div>
    </div>
  );
}
