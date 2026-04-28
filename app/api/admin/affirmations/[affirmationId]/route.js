import * as adminApi from "../../../../../lib/api/admin";
import { respond } from "../../../../../lib/routeUtils";

export async function DELETE(_request, context) {
  const { affirmationId } = await context.params;
  const result = await adminApi.deleteAffirmation(affirmationId);
  return respond(result);
}

