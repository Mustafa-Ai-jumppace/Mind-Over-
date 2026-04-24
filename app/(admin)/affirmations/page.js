import Link from "next/link";
import * as adminApi from "../../../lib/api/admin";
import ListFilters from "../../../components/ListFilters";
import Paginator from "../../../components/Paginator";
import UserAvatar from "../../../components/UserAvatar";

export const dynamic = "force-dynamic";

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

export default async function AffirmationsPage({ searchParams }) {
  const sp = await searchParams;
  const query = {
    page: sp?.page || "1",
    limit: sp?.limit || "12",
    search: sp?.search,
    userId: sp?.userId,
    includeDeleted: sp?.includeDeleted,
  };

  const result = await adminApi.listAffirmations(query);
  const data = result.ok ? result.data : null;
  const error = result.ok ? null : result.error?.message;
  const affirmations = data?.affirmations || [];

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-header">
          <h2>Affirmations</h2>
          <span className="muted">
            <code>GET /admin/affirmations/list</code>
          </span>
        </div>
        <div className="panel-filters">
          <ListFilters
            searchKey="search"
            searchPlaceholder="Search by title…"
            filters={[
              {
                key: "includeDeleted",
                label: "Deleted",
                options: [
                  { value: "all", label: "Active only" },
                  { value: "true", label: "Include deleted" },
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
                <th>Title</th>
                <th>Owner</th>
                <th>Created</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {affirmations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty">
                    No affirmations found.
                  </td>
                </tr>
              ) : (
                affirmations.map((a) => {
                  const u = a.userId || {};
                  return (
                    <tr key={a._id || a.id}>
                      <td>
                        <strong>{a.title || "—"}</strong>
                        {a.text ? (
                          <div className="muted clamp-2">{a.text}</div>
                        ) : null}
                      </td>
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
                      <td>{formatDate(a.createdAt)}</td>
                      <td>
                        {a.isDeleted ? (
                          <span className="status blocked-status">Deleted</span>
                        ) : (
                          <span className="status active-status">Active</span>
                        )}
                      </td>
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
