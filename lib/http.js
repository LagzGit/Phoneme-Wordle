import { NextResponse } from "next/server";
import { AppError } from "./api-errors.js";
import { validationDetails } from "./activity-validation.js";

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new AppError("Request body must contain valid JSON.", 400, "INVALID_JSON");
  }
}

export function validateBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new AppError(
      "Please correct the highlighted input and try again.",
      400,
      "VALIDATION_ERROR",
      validationDetails(result.error)
    );
  }
  return result.data;
}

export function createdResponse(data) {
  return NextResponse.json({ data }, { status: 201 });
}
