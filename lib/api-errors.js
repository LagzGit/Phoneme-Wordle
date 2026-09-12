import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(message, status = 400, code = "BAD_REQUEST", details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function errorResponse(error) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.code, message: error.message, details: error.details },
      { status: error.status }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "The requested record was not found." },
        { status: 404 }
      );
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "DUPLICATE", message: "That word already exists in this activity." },
        { status: 409 }
      );
    }
  }

  console.error(error);
  return NextResponse.json(
    { error: "INTERNAL_ERROR", message: "The server could not complete the request." },
    { status: 500 }
  );
}

export function parseId(value, label = "ID") {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(`${label} must be a positive integer.`, 400, "INVALID_ID");
  }
  return id;
}
