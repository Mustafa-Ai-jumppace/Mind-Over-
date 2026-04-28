import Link from "next/link";
import * as adminApi from "../../../lib/api/admin";
import ListFilters from "../../../components/ListFilters";
import Paginator from "../../../components/Paginator";
import UserAvatar from "../../../components/UserAvatar";
import DeleteButton from "../../../components/DeleteButton";

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

function stars(rating) {
  if (!rating && rating !== 0) return "—";
  const r = Number(rating);
  if (Number.isNaN(r)) return String(rating);
  const rounded = Math.round(r * 2) / 2;
  const full = Math.floor(rounded);
  const half = rounded - full >= 0.5 ? "½" : "";
  return "★".repeat(full) + half + "  " + r.toFixed(1);
}

export default async function ExperiencesPage({ searchParams }) {
  const sp = await searchParams;
  const query = {
    page: sp?.page || "1",
    limit: sp?.limit || "10",
    search: sp?.search,
    userId: sp?.userId,
    ratingMin: sp?.ratingMin,
    ratingMax: sp?.ratingMax,
    dateFrom: sp?.dateFrom,
    dateTo: sp?.dateTo,
  };

  const result = await adminApi.listExperiences(query);
  const data = result.ok ? result.data : null;
  const error = result.ok ? null : result.error?.message;
  const experiences = data?.experiences || [];

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-header">
          <h2>Experiences</h2>
        </div>
        <div className="panel-filters">
          <ListFilters
            searchKey="search"
            searchPlaceholder="Search comments…"
            filters={[
              {
                key: "ratingMin",
                label: "Min rating",
                options: [
                  { value: "all", label: "Any rating" },
                  { value: "1", label: "≥ 1 ★" },
                  { value: "2", label: "≥ 2 ★" },
                  { value: "3", label: "≥ 3 ★" },
                  { value: "4", label: "≥ 4 ★" },
                  { value: "5", label: "5 ★ only" },
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

        <div className="panel-body">
          {experiences.length === 0 ? (
            <div className="empty" style={{ padding: 20 }}>
              No experiences match those filters.
            </div>
          ) : (
            <ul className="review-list">
              {experiences.map((e) => {
                const u = e.userId || {};
                return (
                  <li key={e._id || e.id} className="review-card">
                    <div className="review-head">
                      {u._id ? (
                        <Link href={`/users/${u._id}`} className="user-cell linky">
                          <UserAvatar user={u} size={32} />
                          <div>
                            <strong>{u.name || "—"}</strong>
                            <small>{u.email}</small>
                          </div>
                        </Link>
                      ) : (
                        <span className="muted">Anonymous</span>
                      )}
                      <div className="review-actions">
                        <span className="review-rating">{stars(e.rating)}</span>
                        <DeleteButton
                          label="Delete"
                          confirmText="Delete this experience permanently?"
                          href={`/api/admin/experience/${encodeURIComponent(
                            e._id || e.id
                          )}`}
                          className="danger-button compact"
                        />
                      </div>
                    </div>
                    <div className="review-body">
                      {e.comment || <span className="muted">No comment</span>}
                    </div>
                    <div className="review-foot muted">
                      {formatDate(e.createdAt)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
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
