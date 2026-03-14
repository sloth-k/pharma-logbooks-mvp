import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiRole } from "@/lib/api-auth";
import { createLogEntry } from "@/lib/data";

const entrySchema = z.object({
  sectionKey: z.string().min(1),
  rowNo: z.number().int().positive(),
  fieldValues: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = entrySchema.parse(await request.json());
    const actorUserId = await requireApiRole(["operator", "supervisor", "admin"]);
    const result = await createLogEntry(id, payload, actorUserId);

    return NextResponse.json(
      {
        message: "Entry saved",
        ...result
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Entry save failed."
      },
      { status: 400 }
    );
  }
}
