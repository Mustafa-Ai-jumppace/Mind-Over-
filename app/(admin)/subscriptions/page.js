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

export default async function SubscriptionsPage({ searchParams }) {
  const sp = await searchParams;
  const query = {
    page: sp?.page || "1",
    limit: sp?.limit || "10",
    status: sp?.status,
    planType: sp?.planType,
    userId: sp?.userId,
  };

  const result = await adminApi.listSubscriptions(query);
  const data = result.ok ? result.data : null;
  const error = result.ok ? null : result.error?.message;

  const subs = data?.subscriptions || [];

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-header">
          <h2>Subscriptions</h2>
        </div>
        <div className="panel-filters">
          <ListFilters
            searchKey="userId"
            searchPlaceholder="Filter by user name…"
            filters={[
              {
                key: "status",
                label: "Status",
                options: [
                  { value: "all", label: "All statuses" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ],
              },
              {
                key: "planType",
                label: "Plan type",
                options: [
                  { value: "all", label: "All plans" },
                  { value: "free", label: "Free" },
                  { value: "paid", label: "Paid" },
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
                <th>User</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Type</th>
                <th>Ends</th>
              </tr>
            </thead>
            <tbody>
              {subs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                subs.map((s) => {
                  const u = s.userId || {};
                  return (
                    <tr key={s._id || s.id}>
                      <td>
                        {u._id ? (
                          <Link href={`/users/${u._id}`} className="user-cell linky">
                            <UserAvatar user={u} size={32} />
                            <div>
                              <strong>{u.name || "—"}</strong>
                              <small>{u.email}</small>
                            </div>
                          </Link>
                        ) : (
                          <span className="muted">Unknown user</span>
                        )}
                      </td>
                      <td>
                        <span className="tag">{s.planType || "—"}</span>
                      </td>
                      <td>
                        <span
                          className={`status ${
                            s.status === "active"
                              ? "active-status"
                              : "pending-status"
                          }`}
                        >
                          {s.status || "—"}
                        </span>
                      </td>
                      <td>{s.subscriptionType || "—"}</td>
                      <td>{formatDate(s.endDate)}</td>
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
