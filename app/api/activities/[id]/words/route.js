import { NextResponse } from "next/server";
import { wordCreateSchema } from "@/lib/activity-validation";
import { createWord, getActivity } from "@/lib/activity-service";
import { errorResponse, parseId } from "@/lib/api-errors";
import { createdResponse, readJson, validateBody } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const activity = await getActivity(parseId(id, "Activity ID"));
    return NextResponse.json({ data: activity.words });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const input = validateBody(wordCreateSchema, await readJson(request));
    return createdResponse(await createWord(parseId(id, "Activity ID"), input));
  } catch (error) {
    return errorResponse(error);
  }
}
