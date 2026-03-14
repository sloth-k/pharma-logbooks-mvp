import { NextResponse } from "next/server";
import { z } from "zod";

const versionSchema = z.object({
  definition: z.record(z.string(), z.unknown()),
  versionNo: z.number().int().positive()
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params;
  const payload = versionSchema.parse(await request.json());

  return NextResponse.json(
    {
      message: "Template version draft saved",
      templateId,
      versionId: crypto.randomUUID(),
      data: payload
    },
    { status: 201 }
  );
}
