import { NextResponse } from "next/server";
import { z } from "zod";

import { createLogbook, getDashboardSummary } from "@/lib/data";
import { requireApiRole } from "@/lib/api-auth";

const createLogbookSchema = z.object({
  templateVersionId: z.string().min(1),
  siteId: z.string().min(1),
  departmentId: z.string().min(1),
  areaId: z.string().min(1),
  equipmentId: z.string().min(1).optional(),
  businessDate: z.string().date(),
  shiftCode: z.string().min(1)
});

export async function GET() {
  const dashboard = await getDashboardSummary();
  return NextResponse.json({ items: dashboard.recentLogbooks });
}

export async function POST(request: Request) {
  try {
    const payload = createLogbookSchema.parse(await request.json());
    const actorUserId = await requireApiRole(["operator", "supervisor", "admin"]);
    const result = await createLogbook(payload, actorUserId);

    return NextResponse.json(
      {
        message: "Logbook created",
        ...result,
        data: payload
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Logbook creation failed."
      },
      { status: 400 }
    );
  }
}
