"use client";
// One shared, in-memory cache for GET responses (stale-while-revalidate). A page shows what is already cached at once
// and refreshes it quietly in the background, so moving between pages never flashes "Loading…" again. Kept in memory
// only (never localStorage): client names and document details must not be left on the machine.
import { useCallback, useEffect, useSyncExternalStore } from "react";

interface QueryState {
  cachedResponse?: unknown;
  loadError: Error | null;
  updatedAtMilliseconds: number;
  isFetching: boolean;
}

const EMPTY_QUERY_STATE: QueryState = { loadError: null, updatedAtMilliseconds: 0, isFetching: false };
const FRESH_FOR_MILLISECONDS = 3000;
const queryStatesByKey = new Map<string, QueryState>(); // replaced (never mutated) on every change, so React sees it
const fetchersByKey = new Map<string, () => Promise<unknown>>();
const runningRequestsByKey = new Map<string, Promise<unknown>>();
const listenersByKey = new Map<string, Set<() => void>>();

function updateQueryState(queryKey: string, stateChange: Partial<QueryState>) {
  queryStatesByKey.set(queryKey, { ...(queryStatesByKey.get(queryKey) || EMPTY_QUERY_STATE), ...stateChange });
  listenersByKey.get(queryKey)?.forEach((listener) => listener());
}

/** Fetch now, unless a request for the same key is already running (two components asking at once share one). */
function fetchQuery(queryKey: string): Promise<unknown> {
  const fetcher = fetchersByKey.get(queryKey);
  if (!fetcher) return Promise.resolve(undefined);
  const runningRequest = runningRequestsByKey.get(queryKey);
  if (runningRequest) return runningRequest;
  updateQueryState(queryKey, { isFetching: true });
  const request = fetcher()
    .then((response) => {
      updateQueryState(queryKey, { cachedResponse: response, loadError: null, updatedAtMilliseconds: Date.now(), isFetching: false });
      return response;
    })
    .catch((error: Error) => { updateQueryState(queryKey, { loadError: error, isFetching: false }); })
    .finally(() => runningRequestsByKey.delete(queryKey));
  runningRequestsByKey.set(queryKey, request);
  return request;
}

/** Mark cached responses old and refetch what is on screen. No prefix = everything (after any change on the server). */
export function invalidateQueries(keyPrefix = "") {
  for (const queryKey of queryStatesByKey.keys()) {
    if (!queryKey.startsWith(keyPrefix)) continue;
    updateQueryState(queryKey, { updatedAtMilliseconds: 0 });
    if (listenersByKey.get(queryKey)?.size) fetchQuery(queryKey);
  }
}

// Coming back to the window (after looking at a PDF, say) refreshes what is on screen.
if (typeof window !== "undefined") window.addEventListener("focus", () => invalidateQueries());

/**
 * Cached GET. `queryKey` names the response ("cases", "case:<id>"); null skips the request.
 * isLoading = nothing cached yet; isRefreshing = the cached response is shown while a newer one loads.
 */
export function useQuery<Response>(queryKey: string | null, fetcher: () => Promise<Response>) {
  if (queryKey) fetchersByKey.set(queryKey, fetcher);
  const subscribe = useCallback((handleChange: () => void) => {
    if (!queryKey) return () => {};
    if (!listenersByKey.has(queryKey)) listenersByKey.set(queryKey, new Set());
    listenersByKey.get(queryKey)!.add(handleChange);
    return () => { listenersByKey.get(queryKey)?.delete(handleChange); };
  }, [queryKey]);
  const queryState = useSyncExternalStore(subscribe,
    () => (queryKey ? queryStatesByKey.get(queryKey) || EMPTY_QUERY_STATE : EMPTY_QUERY_STATE), () => EMPTY_QUERY_STATE);

  useEffect(() => {
    if (queryKey && Date.now() - (queryStatesByKey.get(queryKey)?.updatedAtMilliseconds || 0) > FRESH_FOR_MILLISECONDS) fetchQuery(queryKey);
  }, [queryKey]);

  return {
    data: queryState.cachedResponse as Response | undefined,
    error: queryState.loadError,
    isLoading: Boolean(queryKey) && queryState.cachedResponse === undefined && !queryState.loadError,
    isRefreshing: queryState.isFetching && queryState.cachedResponse !== undefined,
    refresh: useCallback(() => (queryKey ? fetchQuery(queryKey) : Promise.resolve(undefined)), [queryKey]),
  };
}
