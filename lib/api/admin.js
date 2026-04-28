import { backendData, backendFetch } from "../backend";

function cleanQuery(query = {}) {
  const out = {};
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "" || v === "all") continue;
    out[k] = v;
  }
  return out;
}

export function getDashboardStats() {
  return backendData("/admin/dashboard/stats", { auth: "jwt" });
}

export function listUsers(query) {
  return backendData("/admin/users", {
    auth: "jwt",
    query: cleanQuery(query),
  });
}

export function getUser(userId) {
  return backendData(`/admin/users/${encodeURIComponent(userId)}`, {
    auth: "jwt",
  });
}

export function setUserBlocked(userId, isBlocked) {
  return backendFetch(`/admin/users/${encodeURIComponent(userId)}/block`, {
    method: "PATCH",
    auth: "jwt",
    body: { isBlocked: Boolean(isBlocked) },
  });
}

export function listActivities(query) {
  return backendData("/admin/activity/list", {
    auth: "jwt",
    query: cleanQuery(query),
  });
}

export function listBlends(query) {
  return backendData("/admin/blends/list", {
    auth: "jwt",
    query: cleanQuery(query),
  });
}

export function listAffirmations(query) {
  return backendData("/admin/affirmations/list", {
    auth: "jwt",
    query: cleanQuery(query),
  });
}

export function listSubscriptions(query) {
  return backendData("/admin/subscriptions/list", {
    auth: "jwt",
    query: cleanQuery(query),
  });
}

export function listExperiences(query) {
  return backendData("/admin/experience/list", {
    auth: "jwt",
    query: cleanQuery(query),
  });
}

export function sendAnnouncement({ title, body, userIds }) {
  return backendFetch(
    "/admin/notifications/send-announcement-notification",
    {
      method: "POST",
      auth: "jwt",
      body: { title, body, userIds },
    }
  );
}

export function deleteUser(userId) {
  return backendFetch(`/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    auth: "jwt",
  });
}

export function deleteAffirmation(affirmationId) {
  return backendFetch(`/admin/affirmations/${encodeURIComponent(affirmationId)}`, {
    method: "DELETE",
    auth: "jwt",
  });
}

export function deleteExperience(experienceId) {
  return backendFetch(`/admin/experience/${encodeURIComponent(experienceId)}`, {
    method: "DELETE",
    auth: "jwt",
  });
}
