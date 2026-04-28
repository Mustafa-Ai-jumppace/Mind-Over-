"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({
  label = "Delete",
  confirmText = "Delete this item? This cannot be undone.",
  href,
  method = "DELETE",
  disabled = false,
  className = "danger-button compact",
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function onClick() {
    if (disabled || pending) return;
    if (!window.confirm(confirmText)) return;

    setError(null);
    setPending(true);
    try {
      if (!href) throw new Error("Missing delete URL.");
      const res = await fetch(href, { method });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Delete failed.");
      }
      router.refresh();
    } catch (e) {
      setError(e.message || "Delete failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="inline-action">
      <button
        type="button"
        className={className}
        onClick={onClick}
        disabled={disabled || pending}
      >
        {pending ? "Deleting…" : label}
      </button>
      {error ? <div className="muted">{error}</div> : null}
    </div>
  );
}

