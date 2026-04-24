"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import UserAvatar from "../../../components/UserAvatar";

export default function ProfileForm({ initialUser }) {
  const router = useRouter();
  const [name, setName] = useState(initialUser?.name || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialUser?.profilePicture || null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdStatus, setPwdStatus] = useState(null);
  const [pwdSaving, setPwdSaving] = useState(false);

  function onFileChange(event) {
    const selected = event.target.files?.[0];
    setFile(selected || null);
    if (selected) {
      const url = URL.createObjectURL(selected);
      setPreview(url);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setStatus(null);
    setSaving(true);
    try {
      const formData = new FormData();
      if (name) formData.append("name", name);
      if (file) formData.append("file", file);

      const res = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Could not save profile.");
      setStatus({ type: "success", message: "Profile updated." });
      setFile(null);
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword(event) {
    event.preventDefault();
    setPwdStatus(null);

    if (newPwd.length < 8) {
      setPwdStatus({ type: "error", message: "New password must be at least 8 characters." });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setPwdSaving(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: newPwd,
          oldPassword: currentPwd || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Could not reset password.");
      setPwdStatus({ type: "success", message: "Password updated." });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err) {
      setPwdStatus({ type: "error", message: err.message });
    } finally {
      setPwdSaving(false);
    }
  }

  const displayUser = {
    name,
    email: initialUser?.email,
    profilePicture: preview,
  };

  return (
    <>
      <section className="panel">
        <div className="panel-header">
          <h2>Profile details</h2>
          <span className="muted">
            <code>POST /auth/upsert-profile</code>
          </span>
        </div>

        <form className="panel-body profile-form" onSubmit={saveProfile}>
          <div className="profile-hero">
            <UserAvatar user={displayUser} size={96} />
            <div>
              <strong>{initialUser?.email || "—"}</strong>
              <div className="muted">
                Upload a photo and update your display name.
              </div>
            </div>
          </div>

          <label className="field">
            <span>Display name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={255}
              placeholder="Your name"
            />
          </label>

          <label className="field">
            <span>Profile photo</span>
            <input type="file" accept="image/*" onChange={onFileChange} />
            {file ? (
              <small className="muted">
                New: {file.name} ({Math.round(file.size / 1024)} KB)
              </small>
            ) : null}
          </label>

          {status ? (
            <div
              className={`alert ${
                status.type === "success" ? "alert-success" : "alert-danger"
              }`}
            >
              {status.message}
            </div>
          ) : null}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Reset password</h2>
          <span className="muted">
            <code>POST /auth/reset-password</code>
          </span>
        </div>

        <form className="panel-body profile-form" onSubmit={resetPassword}>
          <label className="field">
            <span>Current password (optional but recommended)</span>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <div className="form-grid">
            <label className="field">
              <span>New password</span>
              <input
                type="password"
                autoComplete="new-password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                minLength={8}
                placeholder="••••••••"
                required
              />
              <small className="muted">Minimum 8 characters.</small>
            </label>
            <label className="field">
              <span>Confirm new password</span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                minLength={8}
                placeholder="••••••••"
                required
              />
            </label>
          </div>

          {pwdStatus ? (
            <div
              className={`alert ${
                pwdStatus.type === "success" ? "alert-success" : "alert-danger"
              }`}
            >
              {pwdStatus.message}
            </div>
          ) : null}

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={pwdSaving}
            >
              {pwdSaving ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
