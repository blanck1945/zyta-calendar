import { useSearchParams } from "react-router";

/** Debe coincidir con Zyta-dashboard `ENTRY_LINK_TOKEN_QUERY` / `buildPublicEntryLinkUrl`. */
export const ENTRY_LINK_TOKEN_QUERY = "entryLinkToken";

export function useEntryLinkToken(): string | null {
  const [searchParams] = useSearchParams();
  return searchParams.get(ENTRY_LINK_TOKEN_QUERY);
}

export function buildCalendarPathWithEntryLink(
  calendarSlug: string,
  entryLinkToken: string | null
): string {
  const slug = calendarSlug.trim();
  if (!slug) return "/";
  if (!entryLinkToken) return `/${encodeURIComponent(slug)}`;
  const q = new URLSearchParams({ [ENTRY_LINK_TOKEN_QUERY]: entryLinkToken });
  return `/${encodeURIComponent(slug)}?${q.toString()}`;
}
