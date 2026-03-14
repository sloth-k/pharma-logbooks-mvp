import { NextResponse } from "next/server";
import { z } from "zod";

import type { AppRole } from "@/lib/auth";
import { requireApiRole } from "@/lib/api-auth";
import { signLogbook } from "@/lib/data";

const signSchema = z.object({
  meaning: z.enum(["performed", "reviewed", "verified", "approved"]),
  password: z.string().min(8),
  comment: z.string().optional()
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = signSchema.parse(await request.json());
    const allowedRoles: AppRole[] =
      payload.meaning === "approved"
        ? ["qa_approver", "admin"]
        : payload.meaning === "reviewed"
          ? ["supervisor", "qa_reviewer", "qa_approver", "admin"]
          : ["operator", "supervisor", "admin"];
    const actorUserId = await requireApiRole(allowedRoles);
    const result = await signLogbook(id, payload, actorUserId);

    return NextResponse.json({
      message: "Signature recorded",
      ...result,
      data: {
        ...payload,
        password: "[redacted]"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Signature failed."
      },
      { status: 400 }
    );
  }
}
