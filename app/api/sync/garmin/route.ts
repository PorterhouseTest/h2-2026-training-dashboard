import { NextRequest, NextResponse } from "next/server";
import { runGarminSync } from "@/lib/garmin";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const configuredSecret = process.env.GARMIN_SYNC_SECRET || process.env.CRON_SECRET;
  if (!configuredSecret) return false;

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const headerSecret = request.headers.get("x-garmin-sync-secret");
  const querySecret = request.nextUrl.searchParams.get("secret");

  return [bearer, headerSecret, querySecret].includes(configuredSecret);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await runGarminSync("cron-or-api");
  return NextResponse.json({ ok: true, result });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
