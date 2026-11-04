"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCases } from "@/api/queries";
import { getCaseStage } from "@/components/cases/RecentCasesList";

const STAGE_DOT = { review: "bg-amber-400", documents: "bg-white/30", saved: "bg-emerald-400" } as const;
const STAGE_PATH = { review: "review", documents: "documents", saved: "confirm" } as const;

/** The last few cases in the sidebar, so you can jump back without going Home. Shares the cached cases list, so it costs no extra request. */
export default function SidebarRecentCases() {
  const pathname = usePathname();
  const cases = (useCases().data || []).slice(0, 6);
  if (!cases.length) return null;
  return (
    <div>
      <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">Recent</div>
      {cases.map((caseSummary) => {
        const stage = getCaseStage(caseSummary);
        const isActive = pathname.startsWith(`/cases/${caseSummary.id}`);
        return (
          <Link key={caseSummary.id} href={`/cases/${caseSummary.id}/${STAGE_PATH[stage]}`} title={`${caseSummary.clientName || "Not read yet"} · ${stage}`}
            className={`flex h-7 items-center gap-2 rounded-md px-2 text-[12px] transition-colors duration-150 ${isActive ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white"}`}>
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STAGE_DOT[stage]}`} aria-hidden />
            <span className="truncate">{caseSummary.clientName || <span className="italic text-white/35">Not read yet</span>}</span>
          </Link>
        );
      })}
    </div>
  );
}
