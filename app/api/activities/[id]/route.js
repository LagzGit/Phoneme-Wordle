import { NextResponse } from "next/server";
import { activityUpdateSchema } from "@/lib/activity-validation";
import {
  deleteActivity,
  getActivity,
  updateActivity,
} from "@/lib/activity-service";
import { errorResponse, parseId } from "@/lib/api-errors";
import { readJson, validateBody } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    return NextResponse.json({ data: await getActivity(parseId(id, "Activity ID")) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const input = validateBody(activityUpdateSchema, await readJson(request));
    return NextResponse.json({
      data: await updateActivity(parseId(id, "Activity ID"), input),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    await deleteActivity(parseId(id, "Activity ID"));
    return NextResponse.json({ message: "Activity deleted." });
  } catch (error) {
    return errorResponse(error);
  }
}
