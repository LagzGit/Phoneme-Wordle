import { NextResponse } from "next/server";
import { wordUpdateSchema } from "@/lib/activity-validation";
import { deleteWord, updateWord } from "@/lib/activity-service";
import { errorResponse, parseId } from "@/lib/api-errors";
import { readJson, validateBody } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const input = validateBody(wordUpdateSchema, await readJson(request));
    return NextResponse.json({
      data: await updateWord(parseId(id, "Word ID"), input),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    return NextResponse.json({
      data: await deleteWord(parseId(id, "Word ID")),
      message: "Word deleted.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
