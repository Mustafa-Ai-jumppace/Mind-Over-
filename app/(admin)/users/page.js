import Link from "next/link";
import * as adminApi from "../../../lib/api/admin";
import ListFilters from "../../../components/ListFilters";
import Paginator from "../../../components/Paginator";
import BlockUserButton from "../../../components/BlockUserButton";
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

function statusPill(user) {
  if (user.isBlocked) return <span className="status blocked-status">Blocked</span>;
  if (user.isDeleted) return <span className="status blocked-status">Deleted</span>;
  if (!user.isVerified) return <span className="status pending-status">Unverified</span>;
  return <span className="status active-status">Active</span>;
}

export default async function UsersPage({ searchParams }) {
  const sp = await searchParams;
  const query = {
    page: sp?.page || "1",
    limit: sp?.limit || "10",
    search: sp?.search,
    isVerified: sp?.isVerified,
    isBlocked: sp?.isBlocked,
  };

  const result = await adminApi.listUsers(query);
  const data = result.ok ? result.data : null;
  const error = result.ok ? null : result.error?.message;

  const users = data?.users || [];
  const totalDocs = data?.totalDocs || 0;
  const currentPage = data?.currentPage || 1;
  const totalPages = data?.totalPages || 0;

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-header">
          <h2>All users</h2>
          <span className="muted">
            <code>GET /admin/users</code>
          </span>
        </div>
        <div className="panel-filters">
          <ListFilters
            searchKey="search"
            searchPlaceholder="Search by email…"
            filters={[
              {
                key: "isVerified",
                label: "Verification",
                options: [
                  { value: "all", label: "All verification" },
                  { value: "true", label: "Verified" },
                  { value: "false", label: "Unverified" },
                ],
              },
              {
                key: "isBlocked",
                label: "Block status",
                options: [
                  { value: "all", label: "All statuses" },
                  { value: "false", label: "Active" },
                  { value: "true", label: "Blocked" },
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
                <th>Subscription</th>
                <th>Status</th>
                <th>Last login</th>
                <th>Joined</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty">
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id || u.id}>
                    <td>
                      <Link
                        href={`/users/${u._id || u.id}`}
                        className="user-cell linky"
                      >
                        <UserAvatar user={u} size={36} />
                        <div>
                          <strong>{u.name || "—"}</strong>
                          <small>{u.email}</small>
                        </div>
                      </Link>
                    </td>
                    <td>
                      {u.subscription ? (
                        <>
                          <span
                            className={`status ${
                              u.subscription.status === "active"
                                ? "active-status"
                                : "pending-status"
                            }`}
                          >
                            {u.subscription.planType || "—"}
                          </span>
                          <br />
                          <small className="muted">
                            {u.subscription.status || ""}
                          </small>
                        </>
                      ) : (
                        <span className="muted">None</span>
                      )}
                    </td>
                    <td>{statusPill(u)}</td>
                    <td>{formatDate(u.lastLogin)}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td className="row-actions">
                      {u.type !== "Admin" ? (
                        <BlockUserButton
                          userId={u._id || u.id}
                          isBlocked={Boolean(u.isBlocked)}
                        />
                      ) : (
                        <span className="tag ok">Admin</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="panel-footer">
          <Paginator
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={data?.hasNextPage}
            hasPrevPage={data?.hasPrevPage}
            totalDocs={totalDocs}
          />
        </div>
      </section>
    </div>
  );
}
