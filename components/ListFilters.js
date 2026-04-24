"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

/**
 * Generic, URL-synchronized filter bar.
 *
 * @param {{
 *   searchKey?: string,
 *   searchPlaceholder?: string,
 *   filters?: Array<{
 *     key: string,
 *     label: string,
 *     options: Array<{value: string, label: string}>,
 *   }>,
 *   actions?: React.ReactNode,
 * }} props
 */
export default function ListFilters({
  searchKey = "search",
  searchPlaceholder = "Search…",
  filters = [],
  actions = null,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(
    searchParams.get(searchKey) || ""
  );

  useEffect(() => {
    setSearchValue(searchParams.get(searchKey) || "");
  }, [searchParams, searchKey]);

  function push(nextParams) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(nextParams)) {
      if (v === "" || v == null || v === "all") {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    }
    params.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function onSearchSubmit(event) {
    event.preventDefault();
    push({ [searchKey]: searchValue.trim() });
  }

  function onFilterChange(key, value) {
    push({ [key]: value });
  }

  return (
    <div className="list-filters">
      <form onSubmit={onSearchSubmit} className="search-form">
        <input
          className="search"
          type="search"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </form>
      {filters.map((f) => (
        <select
          key={f.key}
          className="select"
          value={searchParams.get(f.key) || "all"}
          onChange={(e) => onFilterChange(f.key, e.target.value)}
          aria-label={f.label}
        >
          {f.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
      {actions ? <div className="list-filters-actions">{actions}</div> : null}
      {isPending ? <span className="muted">Loading…</span> : null}
    </div>
  );
}
