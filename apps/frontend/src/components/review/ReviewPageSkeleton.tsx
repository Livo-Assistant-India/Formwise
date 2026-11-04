import Skeleton, { FieldSkeletonGrid } from "@/components/ui/Skeleton";

/** The review screen's grid: section rail, fields, form preview. Shared with the skeleton so nothing jumps. */
export const REVIEW_GRID_CLASSES = "grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,0.95fr)_minmax(0,1.15fr)]";

/** Same three columns as the loaded page, so nothing jumps when the fields arrive. */
export default function ReviewPageSkeleton() {
  return (
    <div className={`grid h-full ${REVIEW_GRID_CLASSES}`} role="status" aria-label="Filling the form">
      <div className="space-y-3 border-r border-line bg-white p-4">
        <Skeleton className="h-4 w-32" /><Skeleton className="h-1.5 w-full" />
        {Array.from({ length: 6 }, (_unused, placeholderIndex) => <Skeleton key={placeholderIndex} className="h-8 w-full" />)}
      </div>
      <div className="space-y-5 border-r border-line bg-white p-4"><Skeleton className="h-5 w-40" /><FieldSkeletonGrid /></div>
      <div className="p-4"><Skeleton className="mx-auto aspect-[0.707] h-full bg-white" /><span className="sr-only">Filling the form…</span></div>
    </div>
  );
}
