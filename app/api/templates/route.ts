import { NextResponse } from "next/server";
import { z } from "zod";

import { getTemplates, createTemplate } from "@/lib/data";
import { requireApiRole } from "@/lib/api-auth";

const templateSchema = z.object({
  code: z.string().min(3),
  name: z.string().min(3),
  category: z.enum(["equipment_cleaning", "area_cleaning", "environment_monitoring"]),
  description: z.string().optional()
});

export async function GET() {
  const templates = await getTemplates();
  return NextResponse.json({ items: templates });
}

export async function POST(request: Request) {
  try {
    const payload = templateSchema.parse(await request.json());
    const actorUserId = await requireApiRole(["admin"]);
    const template = await createTemplate(payload, actorUserId);

    return NextResponse.json(
      {
        message: "Template draft created",
        templateId: template.id,
        data: template
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Template creation failed."
      },
      { status: 400 }
    );
  }
}
