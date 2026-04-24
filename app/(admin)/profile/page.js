import * as authApi from "../../../lib/api/auth";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const result = await authApi.getProfileById();
  const user = result.ok ? result.data?.user : null;

  return (
    <div className="stack">
      {!result.ok ? (
        <div className="alert alert-danger">
          Could not load profile: {result.error?.message}
        </div>
      ) : null}

      <ProfileForm initialUser={user} />
    </div>
  );
}
