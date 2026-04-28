import * as adminApi from "../../../../../lib/api/admin";
import { respond } from "../../../../../lib/routeUtils";

export async function DELETE(_request, context) {
  const { userId } = await context.params;
  const result = await adminApi.deleteUser(userId);
  return respond(result);
}

