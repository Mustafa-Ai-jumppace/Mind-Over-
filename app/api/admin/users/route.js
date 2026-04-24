import { NextResponse } from "next/server";
import * as adminApi from "../../../../lib/api/admin";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());
  const result = await adminApi.listUsers(query);
  if (!result.ok) {
    return NextResponse.json(
      { message: result.error?.message || "Failed to load users." },
      { status: 502 }
    );
  }
  return NextResponse.json(result.data);
}
