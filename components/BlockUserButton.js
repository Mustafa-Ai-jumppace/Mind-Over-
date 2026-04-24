"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BlockUserButton({ userId, isBlocked }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function toggle() {
    const confirmMsg = isBlocked
      ? "Unblock this user? They will regain access."
      : "Block this user? They will be signed out and can’t log in.";
    if (!window.confirm(confirmMsg)) return;

    setError(null);
    setPending(true);
    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(userId)}/block`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isBlocked: !isBlocked }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Failed to update user.");
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={isBlocked ? "ghost-button" : "danger-button compact"}
        onClick={toggle}
        disabled={pending}
      >
        {pending ? "…" : isBlocked ? "Unblock" : "Block"}
      </button>
      {error ? <div className="muted">{error}</div> : null}
    </>
  );
}
