import * as authApi from "../../../lib/api/auth";
import { respond } from "../../../lib/routeUtils";

export async function POST() {
  const result = await authApi.toggleNotification();
  if (!result.ok) {
    return respond({
      ok: false,
      status: result.error ? 502 : 500,
      error: result.error,
    });
  }
  return respond({ ok: true, status: 200, data: { data: result.data } });
}
