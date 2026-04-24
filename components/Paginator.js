"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

export default function Paginator({
  currentPage = 1,
  totalPages = 1,
  hasNextPage = false,
  hasPrevPage = false,
  totalDocs = 0,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function go(page) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  if (totalPages <= 1 && totalDocs === 0) {
    return null;
  }

  return (
    <div className="paginator">
      <div className="paginator-count muted">
        {totalDocs.toLocaleString()} total • page {currentPage} of {totalPages || 1}
      </div>
      <div className="paginator-buttons">
        <button
          type="button"
          className="ghost-button"
          disabled={!hasPrevPage || isPending}
          onClick={() => go(currentPage - 1)}
        >
          ← Prev
        </button>
        <button
          type="button"
          className="ghost-button"
          disabled={!hasNextPage || isPending}
          onClick={() => go(currentPage + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
