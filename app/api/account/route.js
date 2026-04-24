import * as authApi from "../../../lib/api/auth";
import { clearSessionCookie } from "../../../lib/session";
import { respond } from "../../../lib/routeUtils";

export async function POST() {
  const result = await authApi.deleteAccount();
  if (result.ok) {
    await clearSessionCookie();
  }
  return respond(result);
}
