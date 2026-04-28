import * as adminApi from "../../../../../lib/api/admin";
import { respond } from "../../../../../lib/routeUtils";

export async function DELETE(_request, context) {
  const { experienceId } = await context.params;
  const result = await adminApi.deleteExperience(experienceId);
  return respond(result);
}

