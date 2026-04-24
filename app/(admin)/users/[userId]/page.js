import Link from "next/link";
import { notFound } from "next/navigation";
import * as adminApi from "../../../../lib/api/admin";
import UserAvatar from "../../../../components/UserAvatar";
import BlockUserButton from "../../../../components/BlockUserButton";

export const dynamic = "force-dynamic";

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(value);
  }
}

export default async function UserDetailPage({ params }) {
  const { userId } = await params;

  const [userResult, activityResult, subsResult, expResult] = await Promise.all([
    adminApi.getUser(userId),
    adminApi.listActivities({ userId, limit: 10 }),
    adminApi.listSubscriptions({ userId, limit: 5 }),
    adminApi.listExperiences({ userId, limit: 5 }),
  ]);

  if (!userResult.ok) {
    if (userResult.error?.message?.toLowerCase().includes("not found")) {
      notFound();
    }
  }

  const user = userResult.ok ? userResult.data?.user : null;
  if (!user) {
    return (
      <div className="stack">
        <div className="alert alert-danger">
          {userResult.error?.message || "User not found."}
        </div>
        <Link href="/users" className="ghost-button">
          ← Back to users
        </Link>
      </div>
    );
  }

  const activities = activityResult.ok ? activityResult.data?.activities || [] : [];
  const subscriptions = subsResult.ok ? subsResult.data?.subscriptions || [] : [];
  const experiences = expResult.ok ? expResult.data?.experiences || [] : [];

  return (
    <div className="stack">
      <Link href="/users" className="muted linky">
        ← Back to all users
      </Link>

      <section className="panel">
        <div className="user-hero">
          <UserAvatar user={user} size={72} />
          <div className="user-hero-body">
            <h2 className="user-hero-name">{user.name || "—"}</h2>
            <div className="user-hero-meta muted">{user.email}</div>
            <div className="user-hero-tags">
              <span className={`status ${user.isBlocked ? "blocked-status" : user.isVerified ? "active-status" : "pending-status"}`}>
                {user.isBlocked
                  ? "Blocked"
                  : user.isVerified
                  ? "Verified"
                  : "Unverified"}
              </span>
              <span className="tag">{user.type || "User"}</span>
              {user.isNotificationEnabled ? (
                <span className="tag">Notifications on</span>
              ) : (
                <span className="tag muted">Notifications off</span>
              )}
            </div>
          </div>
          <div className="user-hero-actions">
            {user.type !== "Admin" ? (
              <BlockUserButton
                userId={user._id || user.id}
                isBlocked={Boolean(user.isBlocked)}
              />
            ) : null}
          </div>
        </div>

        <div className="panel-body user-facts">
          <div>
            <span className="muted">User ID</span>
            <code>{user._id || user.id}</code>
          </div>
          <div>
            <span className="muted">Created</span>
            <strong>{formatDateTime(user.createdAt)}</strong>
          </div>
          <div>
            <span className="muted">Last login</span>
            <strong>{formatDateTime(user.lastLogin)}</strong>
          </div>
          <div>
            <span className="muted">Blocked at</span>
            <strong>{formatDateTime(user.blockedAt)}</strong>
          </div>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <h3>Subscriptions</h3>
            <span className="muted">
              <code>GET /admin/subscriptions/list</code>
            </span>
          </div>
          <div className="panel-body">
            {subscriptions.length === 0 ? (
              <div className="muted">No subscriptions on file.</div>
            ) : (
              <ul className="clean-list">
                {subscriptions.map((s) => (
                  <li key={s._id || s.id}>
                    <div>
                      <strong>{s.planType || "—"}</strong>
                      <span className="muted"> · {s.subscriptionType || "—"}</span>
                    </div>
                    <div className="muted">
                      {s.status} · ends {formatDate(s.endDate)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Recent experiences</h3>
            <span className="muted">
              <code>GET /admin/experience/list</code>
            </span>
          </div>
          <div className="panel-body">
            {experiences.length === 0 ? (
              <div className="muted">No reviews yet.</div>
            ) : (
              <ul className="clean-list">
                {experiences.map((e) => (
                  <li key={e._id || e.id}>
                    <div>
                      <strong>{e.rating?.toFixed?.(1) || e.rating} ★</strong>
                      <span className="muted"> · {formatDate(e.createdAt)}</span>
                    </div>
                    <div>{e.comment || <span className="muted">No comment</span>}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Recent activity</h3>
          <span className="muted">
            <code>GET /admin/activity/list</code>
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Type</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty">
                    No activity logged.
                  </td>
                </tr>
              ) : (
                activities.map((a) => (
                  <tr key={a._id || a.id}>
                    <td>{formatDateTime(a.createdAt)}</td>
                    <td>
                      <span className="tag">{a.type || "—"}</span>
                    </td>
                    <td>{a.activityType || "—"}</td>
                    <td className="muted">
                      {a.title || a.description || ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
