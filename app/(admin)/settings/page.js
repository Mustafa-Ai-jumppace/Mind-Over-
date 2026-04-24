import * as authApi from "../../../lib/api/auth";
import SettingsPanels from "./SettingsPanels";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const result = await authApi.getProfileById();
  const user = result.ok ? result.data?.user : null;

  return (
    <div className="stack">
      {!result.ok ? (
        <div className="alert alert-danger">
          Could not load settings: {result.error?.message}
        </div>
      ) : null}
      <SettingsPanels
        initialEnabled={Boolean(user?.isNotificationEnabled)}
      />
    </div>
  );
}
