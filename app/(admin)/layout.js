import { redirect } from "next/navigation";
import { clearSessionCookie, getCurrentSession } from "../../lib/session";
import * as authApi from "../../lib/api/auth";
import AdminShell from "../../components/AdminShell";

export default async function AdminLayout({ children }) {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }

  let fullUser = session.user;
  try {
    const profile = await authApi.getProfileById();
    if (profile.ok && profile.data?.user) {
      const u = profile.data.user;
      fullUser = {
        id: u._id || u.id || session.user?.id,
        email: u.email || session.user?.email,
        name: u.name || session.user?.name,
        type: u.type || "Admin",
        role: (u.type || "Admin").toLowerCase(),
        profilePicture: u.profilePicture || null,
      };
    }
    if (!profile.ok && (profile.status === 401 || profile.status === 403)) {
      await clearSessionCookie();
      redirect("/login");
    }
  } catch {
    // Keep session fallback
  }

  return <AdminShell user={fullUser}>{children}</AdminShell>;
}
