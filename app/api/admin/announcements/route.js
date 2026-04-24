import { NextResponse } from "next/server";
import * as adminApi from "../../../../lib/api/admin";
import { respond } from "../../../../lib/routeUtils";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  const { title, body: msg, userIds } = body || {};
  if (!title || title.length < 5) {
    return NextResponse.json(
      { message: "Title must be at least 5 characters." },
      { status: 400 }
    );
  }
  if (!msg || msg.length < 10) {
    return NextResponse.json(
      { message: "Body must be at least 10 characters." },
      { status: 400 }
    );
  }
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json(
      { message: "At least one recipient is required." },
      { status: 400 }
    );
  }

  const result = await adminApi.sendAnnouncement({
    title,
    body: msg,
    userIds,
  });
  return respond(result);
}
