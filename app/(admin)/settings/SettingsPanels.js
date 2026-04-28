"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPanels({ initialEnabled }) {
  const router = useRouter();

  const [enabled, setEnabled] = useState(initialEnabled);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifStatus, setNotifStatus] = useState(null);

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

  return (
    <>
      <section className="panel">
        <div className="panel-header">
          <h2>Notifications</h2>
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
    </>
  );
}
