"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon, { type IconName } from "@/components/ui/Icon";
import Kbd from "@/components/ui/Kbd";
import { SIDEBAR_STORAGE_KEY } from "@/config/storage-keys";
import { useHotkeys } from "@/hooks/useHotkeys";
import ConnectionStatus from "./ConnectionStatus";
import SidebarRecentCases from "./SidebarRecentCases";

const SECTIONS: { title: string; links: { href: string; label: string; icon: IconName; hotkey?: string; match: RegExp }[] }[] = [
  { title: "Work", links: [
    { href: "/", label: "Home", icon: "home", match: /^\/$/ },
    { href: "/cases/new", label: "New case", icon: "case", hotkey: "C", match: /^\/cases/ },
    { href: "/batches/new", label: "New batch", icon: "batch", hotkey: "B", match: /^\/batches/ },
  ] },
  { title: "Setup", links: [
    { href: "/forms", label: "Forms", icon: "forms", match: /^\/forms(?!\/new)/ },
    { href: "/forms/new", label: "Add a form", icon: "plus", hotkey: "F", match: /^\/forms\/new/ },
  ] },
];

const SIDEBAR_COLLAPSED_WIDTH_PIXELS = 100;

/** Folded or not lives on <html data-sidebar>, set before the first paint (see layout.tsx), so a reload never jumps.
 * The toggle flips what is on screen now (including an "auto" fold on a narrow screen) and remembers the choice. */
function toggleSidebar() {
  const sidebarElement = document.querySelector("aside");
  const isCollapsedNow = Boolean(sidebarElement && sidebarElement.getBoundingClientRect().width < SIDEBAR_COLLAPSED_WIDTH_PIXELS);
  const chosenSidebarState = isCollapsedNow ? "open" : "collapsed";
  document.documentElement.dataset.sidebar = chosenSidebarState;
  try { localStorage.setItem(SIDEBAR_STORAGE_KEY, chosenSidebarState); } catch {}
}

/** Left navigation. Collapses to icons with the arrow button or the [ key; the choice is remembered. */
export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  // C / B / F start something from any page; [ folds the sidebar.
  useHotkeys({ c: () => router.push("/cases/new"), b: () => router.push("/batches/new"), f: () => router.push("/forms/new"), "[": toggleSidebar });

  return (
    <aside className="flex w-52 shrink-0 flex-col bg-ink text-white transition-[width] duration-200 ease-out collapsed:w-14">
      <div className="flex h-12 items-center px-4 collapsed:justify-center collapsed:px-0">
        <Link href="/" className="flex min-w-0 items-baseline gap-1.5 whitespace-nowrap" title="Home">
          <span className="hidden h-6 w-6 place-items-center rounded-md bg-brand-500 text-[9px] font-bold collapsed:grid">360</span>
          <span className="text-[15px] font-bold tracking-tight collapsed:hidden">360<span className="text-brand-500"> ONE</span></span>
          <span className="truncate text-[11px] text-white/45 collapsed:hidden">Form Prefill</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-2 py-2">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/35 collapsed:hidden">{section.title}</div>
            <div className="mx-2 mb-1 hidden h-px bg-white/10 collapsed:block" />
            {section.links.map((link) => {
              const isActive = link.match.test(pathname);
              return (
                <Link key={link.href} href={link.href} title={link.label} aria-current={isActive ? "page" : undefined}
                  className={`group relative flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors duration-150 collapsed:justify-center ${
                    isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
                  <span className={`absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-full bg-brand-500 transition-opacity duration-150 ${isActive ? "opacity-100" : "opacity-0"}`} aria-hidden />
                  <Icon name={link.icon} className={`h-4 w-4 shrink-0 ${isActive ? "text-brand-500" : ""}`} />
                  <span className="flex-1 truncate collapsed:hidden">{link.label}</span>
                  {link.hotkey ? <span className="opacity-0 transition-opacity group-hover:opacity-100 collapsed:hidden"><Kbd onDark>{link.hotkey}</Kbd></span> : null}
                </Link>
              );
            })}
          </div>
        ))}
        <div className="collapsed:hidden"><SidebarRecentCases /></div>
      </nav>
      <div className="space-y-1 border-t border-white/10 px-2 py-2">
        <ConnectionStatus />
        <div className="flex items-start gap-2 rounded-md px-2 py-1.5 text-[11px] leading-snug text-white/50 collapsed:hidden">
          <Icon name="shield" className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-400" />
          <span>Read on this machine. Aadhaar last 4 only. PAN never saved.</span>
        </div>
        <button type="button" onClick={toggleSidebar} title="Collapse or expand  ["
          className="flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-[12px] text-white/50 transition-colors hover:bg-white/5 hover:text-white collapsed:justify-center">
          <Icon name="collapse" className="h-4 w-4 shrink-0 transition-transform duration-200 collapsed:rotate-180" />
          <span className="flex-1 text-left collapsed:hidden">Collapse</span>
          <span className="collapsed:hidden"><Kbd onDark>[</Kbd></span>
        </button>
      </div>
    </aside>
  );
}
