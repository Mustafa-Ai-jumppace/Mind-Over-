import * as authApi from "../../../lib/api/auth";
import { respond } from "../../../lib/routeUtils";

export async function POST(request) {
  const form = await request.formData().catch(() => null);
  if (!form) {
    return respond({
      ok: false,
      status: 400,
      error: { message: "Expected multipart/form-data." },
    });
  }

  const forwardForm = new FormData();
  for (const [key, value] of form.entries()) {
    forwardForm.append(key, value);
  }

  const result = await authApi.upsertProfile(forwardForm);
  return respond(result);
}

export async function GET() {
  const result = await authApi.getProfileById();
  if (!result.ok) {
    return respond({
      ok: false,
      status: result.error ? 502 : 500,
      error: result.error || { message: "Failed to load profile." },
    });
  }
  return respond({ ok: true, status: 200, data: { data: result.data } });
}
