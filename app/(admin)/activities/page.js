import Link from "next/link";
import * as adminApi from "../../../lib/api/admin";
import ListFilters from "../../../components/ListFilters";
import Paginator from "../../../components/Paginator";
import UserAvatar from "../../../components/UserAvatar";

export const dynamic = "force-dynamic";

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

export default async function ActivitiesPage({ searchParams }) {
  const sp = await searchParams;
  const query = {
    page: sp?.page || "1",
    limit: sp?.limit || "15",
    userId: sp?.userId,
    type: sp?.type,
    activityType: sp?.activityType,
    dateFrom: sp?.dateFrom,
    dateTo: sp?.dateTo,
  };

  const result = await adminApi.listActivities(query);
  const data = result.ok ? result.data : null;
  const error = result.ok ? null : result.error?.message;
  const activities = data?.activities || [];

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-header">
          <h2>Activity log</h2>
          <span className="muted">
            <code>GET /admin/activity/list</code>
          </span>
        </div>
        <div className="panel-filters">
          <ListFilters
            searchKey="userId"
            searchPlaceholder="Filter by user ID…"
            filters={[
              {
                key: "type",
                label: "Content type",
                options: [
                  { value: "all", label: "All types" },
                  { value: "blend", label: "Blend" },
                  { value: "affirmation", label: "Affirmation" },
                  { value: "spotify_music", label: "Spotify" },
                  { value: "apple_music", label: "Apple Music" },
                ],
              },
              {
                key: "activityType",
                label: "Action",
                options: [
                  { value: "all", label: "All actions" },
                  { value: "play", label: "Play" },
                  { value: "created_blend", label: "Created blend" },
                  { value: "created_affirmation", label: "Created affirmation" },
                ],
              },
            ]}
          />
        </div>

        {error ? (
          <div className="alert alert-danger" style={{ margin: 18 }}>
            {error}
          </div>
        ) : null}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>User</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty">
                    No activity matches those filters.
                  </td>
                </tr>
              ) : (
                activities.map((a) => {
                  const u = a.userId || {};
                  return (
                    <tr key={a._id || a.id}>
                      <td>{formatDateTime(a.createdAt)}</td>
                      <td>
                        {u._id ? (
                          <Link
                            href={`/users/${u._id}`}
                            className="user-cell linky"
                          >
                            <UserAvatar user={u} size={28} />
                            <div>
                              <strong>{u.name || "—"}</strong>
                              <small>{u.email}</small>
                            </div>
                          </Link>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td>
                        <span className="tag">{a.type || "—"}</span>
                      </td>
                      <td>{a.activityType || "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="panel-footer">
          <Paginator
            currentPage={data?.currentPage || 1}
            totalPages={data?.totalPages || 0}
            hasNextPage={data?.hasNextPage}
            hasPrevPage={data?.hasPrevPage}
            totalDocs={data?.totalDocs || 0}
          />
        </div>
      </section>
    </div>
  );
}
