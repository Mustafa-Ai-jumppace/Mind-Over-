import Link from "next/link";
import * as adminApi from "../../lib/api/admin";

function formatNumber(n) {
  if (n === null || n === undefined) return "—";
  const v = Number(n);
  if (Number.isNaN(v)) return "—";
  return v.toLocaleString();
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const result = await adminApi.getDashboardStats();
  const stats = result.ok ? result.data : null;
  const error = result.ok ? null : result.error?.message;

  const users = stats?.users || {};
  const content = stats?.content || {};
  const engagement = stats?.engagement || {};
  const subscriptions = stats?.subscriptions || {};

  return (
    <div className="stack">
      {error ? (
        <div className="alert alert-danger">
          Could not load stats: {error}
        </div>
      ) : null}

      <section className="cards" aria-label="User metrics">
        <article className="card card-info">
          <span>Total users</span>
          <strong>{formatNumber(users.total)}</strong>
          <small>All time</small>
        </article>
        <article className="card card-ok">
          <span>Verified</span>
          <strong>{formatNumber(users.verified)}</strong>
          <small>Email verified accounts</small>
        </article>
        <article className="card card-warn">
          <span>New today</span>
          <strong>{formatNumber(users.newToday)}</strong>
          <small>Signed up in the last 24h</small>
        </article>
        <article className="card card-danger">
          <span>Blocked</span>
          <strong>{formatNumber(users.blocked)}</strong>
          <small>Suspended accounts</small>
        </article>
      </section>

      <section className="grid-2">
        <section className="panel">
          <div className="panel-header">
            <h2>Content library</h2>
          </div>
          <div className="panel-body">
            <div className="stat-row">
              <div className="stat-row-label">
                <span className="dot dot-indigo" />
                <span>Blends</span>
              </div>
              <strong>{formatNumber(content.blends)}</strong>
            </div>
            <div className="stat-row">
              <div className="stat-row-label">
                <span className="dot dot-green" />
                <span>Affirmations</span>
              </div>
              <strong>{formatNumber(content.affirmations)}</strong>
            </div>
            <div className="stat-row">
              <div className="stat-row-label">
                <span className="dot dot-amber" />
                <span>Experiences (reviews)</span>
              </div>
              <strong>{formatNumber(content.experiences)}</strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Engagement & revenue</h2>
          </div>
          <div className="panel-body">
            <div className="stat-row">
              <div className="stat-row-label">
                <span className="dot dot-indigo" />
                <span>Total activities</span>
              </div>
              <strong>{formatNumber(engagement.totalActivities)}</strong>
            </div>
            <div className="stat-row">
              <div className="stat-row-label">
                <span className="dot dot-cyan" />
                <span>Activities last 7 days</span>
              </div>
              <strong>{formatNumber(engagement.activitiesLast7Days)}</strong>
            </div>
            <div className="stat-row">
              <div className="stat-row-label">
                <span className="dot dot-green" />
                <span>Active paid subscriptions</span>
              </div>
              <strong>{formatNumber(subscriptions.activePaid)}</strong>
            </div>
          </div>
        </section>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Jump to</h2>
        </div>
        <div className="panel-body">
          <div className="quick-links">
            <Link href="/users" className="quick-link">
              <strong>Manage users</strong>
              <span>Search, filter, block, or view user details.</span>
            </Link>
            <Link href="/subscriptions" className="quick-link">
              <strong>Subscriptions</strong>
              <span>Monitor plans, statuses, and renewals.</span>
            </Link>
            <Link href="/announcements" className="quick-link">
              <strong>Send announcement</strong>
              <span>Push a notification to selected users.</span>
            </Link>
            <Link href="/activities" className="quick-link">
              <strong>Activity log</strong>
              <span>See every play, blend, and affirmation event.</span>
            </Link>
            <Link href="/experiences" className="quick-link">
              <strong>Experiences</strong>
              <span>Read user reviews and ratings.</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
