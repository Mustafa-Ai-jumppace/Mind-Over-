"use client";

import { useEffect, useState, useCallback } from "react";
import UserAvatar from "../../../components/UserAvatar";

const DEBOUNCE_MS = 350;

export default function AnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(() => new Map());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadUsers = useCallback(async (q) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", "25");
      if (q) params.set("search", q);
      params.set("isBlocked", "false");
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load users.");
      const list = data?.data?.users || data?.users || [];
      setUsers(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadUsers(search.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search, loadUsers]);

  function toggle(user) {
    const id = user._id || user.id;
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, user);
      return next;
    });
  }

  function remove(id) {
    setSelected((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (title.trim().length < 5) {
      setError("Title must be at least 5 characters.");
      return;
    }
    if (body.trim().length < 10) {
      setError("Body must be at least 10 characters.");
      return;
    }
    if (selected.size === 0) {
      setError("Select at least one recipient.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          userIds: Array.from(selected.keys()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to send.");
      setSuccess(`Notification queued for ${selected.size} user(s).`);
      setTitle("");
      setBody("");
      setSelected(new Map());
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedList = Array.from(selected.values());

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-header">
          <h2>Send announcement</h2>
          <span className="muted">
            <code>POST /admin/notifications/send-announcement-notification</code>
          </span>
        </div>

        <form onSubmit={submit} className="panel-body announcement-form">
          {error ? (
            <div className="alert alert-danger">{error}</div>
          ) : null}
          {success ? (
            <div className="alert alert-success">{success}</div>
          ) : null}

          <label className="field">
            <span>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New feature drop"
              maxLength={120}
              required
            />
            <small className="muted">
              {title.length} / 120 · minimum 5 characters
            </small>
          </label>

          <label className="field">
            <span>Body</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Share the news with your users…"
              maxLength={600}
              required
            />
            <small className="muted">
              {body.length} / 600 · minimum 10 characters
            </small>
          </label>

          <div className="field">
            <span>Recipients ({selected.size} selected)</span>
            {selectedList.length > 0 ? (
              <ul className="chip-list">
                {selectedList.map((u) => (
                  <li key={u._id || u.id} className="chip">
                    {u.name || u.email}
                    <button
                      type="button"
                      onClick={() => remove(u._id || u.id)}
                      aria-label={`Remove ${u.email}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="muted">No recipients selected yet.</div>
            )}
          </div>

          <div className="field">
            <input
              className="search"
              type="search"
              placeholder="Search users by email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="user-picker">
            {loading ? (
              <div className="muted">Loading users…</div>
            ) : users.length === 0 ? (
              <div className="muted">No users found.</div>
            ) : (
              <ul className="user-picker-list">
                {users.map((u) => {
                  const id = u._id || u.id;
                  const checked = selected.has(id);
                  return (
                    <li
                      key={id}
                      className={`user-picker-item ${checked ? "is-selected" : ""}`}
                    >
                      <label>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(u)}
                        />
                        <UserAvatar user={u} size={32} />
                        <span>
                          <strong>{u.name || "—"}</strong>
                          <small>{u.email}</small>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting
                ? "Sending…"
                : `Send to ${selected.size} user${selected.size === 1 ? "" : "s"}`}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
