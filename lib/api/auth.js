import { backendData, backendFetch } from "../backend";

export function login({ email, password }) {
  return backendFetch("/auth/login", {
    method: "POST",
    auth: "bearer",
    body: { email, password },
  });
}

export function signup({ name, email, password }) {
  return backendFetch("/auth/signup", {
    method: "POST",
    auth: "bearer",
    body: { name, email, password },
  });
}

export function logout() {
  return backendFetch("/auth/logout", { method: "POST", auth: "jwt" });
}

export function autoLogin() {
  return backendFetch("/auth/auto-login", { method: "POST", auth: "jwt" });
}

export function getProfileById() {
  return backendData("/auth/get-profile-by-id", { method: "GET", auth: "jwt" });
}

export function upsertProfile(formData) {
  return backendFetch("/auth/upsert-profile", {
    method: "POST",
    auth: "jwt",
    body: formData,
  });
}

export function toggleNotification() {
  return backendData("/auth/toggle-notification", {
    method: "POST",
    auth: "jwt",
  });
}

export function deleteAccount() {
  return backendFetch("/auth/delete-account", {
    method: "POST",
    auth: "jwt",
  });
}

export function resetPassword({ password, oldPassword }) {
  const body = { password };
  if (oldPassword) body.oldPassword = oldPassword;
  return backendFetch("/auth/reset-password", {
    method: "POST",
    auth: "jwt",
    body,
  });
}
