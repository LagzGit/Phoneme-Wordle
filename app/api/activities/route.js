import { NextResponse } from "next/server";
import { ACTIVITY_TYPES, activityCreateSchema } from "@/lib/activity-validation";
import { createActivity, listActivities } from "@/lib/activity-service";
import { AppError, errorResponse } from "@/lib/api-errors";
import { createdResponse, readJson, validateBody } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const type = request.nextUrl.searchParams.get("type") || undefined;
    if (type && !ACTIVITY_TYPES.includes(type)) {
      throw new AppError("Unknown activity type.", 400, "INVALID_ACTIVITY_TYPE");
    }
    return NextResponse.json({ data: await listActivities(type) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const input = validateBody(activityCreateSchema, await readJson(request));
    return createdResponse(await createActivity(input));
  } catch (error) {
    return errorResponse(error);
  }
}
