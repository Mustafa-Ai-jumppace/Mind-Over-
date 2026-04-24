"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPanels({ initialEnabled }) {
  const router = useRouter();

  const [enabled, setEnabled] = useState(initialEnabled);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifStatus, setNotifStatus] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null);

  async function toggleNotifications() {
    setNotifStatus(null);
    setNotifSaving(true);
    try {
      const response = await fetch("/api/notifications", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Could not update notifications.");
      }
      const next =
        typeof data?.data?.notificationToggle === "boolean"
          ? data.data.notificationToggle
          : typeof data?.notificationToggle === "boolean"
          ? data.notificationToggle
          : !enabled;
      setEnabled(next);
      setNotifStatus({
        type: "success",
        message: `Notifications ${next ? "enabled" : "disabled"}.`,
      });
    } catch (err) {
      setNotifStatus({ type: "error", message: err.message });
    } finally {
      setNotifSaving(false);
    }
  }

  async function deleteAccount() {
    setDeleteStatus(null);
    setDeleting(true);
    try {
      const response = await fetch("/api/account", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Could not delete account.");
      }
      router.replace("/login");
      router.refresh();
    } catch (err) {
      setDeleteStatus({ type: "error", message: err.message });
      setDeleting(false);
    }
  }

  return (
    <>
      <section className="panel">
        <div className="panel-header">
          <h2>Notifications</h2>
          <span className="muted">
            <code>POST /auth/toggle-notification</code>
          </span>
        </div>
        <div className="panel-body">
          <div className="toggle-row">
            <div>
              <strong>Push & email notifications</strong>
              <small>
                Master switch for all notifications tied to your account.
              </small>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={enabled}
                onChange={toggleNotifications}
                disabled={notifSaving}
              />
              <span className="slider" />
            </label>
          </div>

          {notifStatus ? (
            <div
              className={`alert ${
                notifStatus.type === "success"
                  ? "alert-success"
                  : "alert-danger"
              }`}
            >
              {notifStatus.message}
            </div>
          ) : null}
        </div>
      </section>

      <section className="panel danger-zone">
        <div className="panel-header">
          <h2>Danger zone</h2>
          <span className="muted">
            <code>POST /auth/delete-account</code>
          </span>
        </div>
        <div className="panel-body">
          <p>
            This will permanently delete your admin account from the Mind Over
            backend. You will be signed out immediately.
          </p>

          {deleteStatus ? (
            <div className="alert alert-danger">{deleteStatus.message}</div>
          ) : null}

          {!confirmOpen ? (
            <button
              type="button"
              className="danger-button"
              onClick={() => setConfirmOpen(true)}
            >
              Delete my account
            </button>
          ) : (
            <div className="confirm-box">
              <p>
                Type <code>DELETE</code> below to confirm account removal.
              </p>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
              />
              <div className="form-actions">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => {
                    setConfirmOpen(false);
                    setConfirmText("");
                    setDeleteStatus(null);
                  }}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="danger-button"
                  disabled={confirmText !== "DELETE" || deleting}
                  onClick={deleteAccount}
                >
                  {deleting ? "Deleting…" : "Confirm delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
