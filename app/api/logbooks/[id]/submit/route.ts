import { NextResponse } from "next/server";

import { requireApiRole } from "@/lib/api-auth";
import { submitLogbook } from "@/lib/data";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiRole(["operator", "supervisor", "admin"]);
    const { id } = await params;
    const result = await submitLogbook(id);

    return NextResponse.json({
      message: "Logbook submitted for review",
      ...result
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Submit failed."
      },
      { status: 400 }
    );
  }
}
