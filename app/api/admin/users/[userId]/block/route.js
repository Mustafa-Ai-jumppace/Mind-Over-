import { NextResponse } from "next/server";
import * as adminApi from "../../../../../../lib/api/admin";
import { respond } from "../../../../../../lib/routeUtils";

export async function PATCH(request, context) {
  const { userId } = await context.params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  if (typeof body?.isBlocked !== "boolean") {
    return NextResponse.json(
      { message: "`isBlocked` must be a boolean." },
      { status: 400 }
    );
  }

  const result = await adminApi.setUserBlocked(userId, body.isBlocked);
  return respond(result);
}
