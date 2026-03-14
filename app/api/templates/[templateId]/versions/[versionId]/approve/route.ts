import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ templateId: string; versionId: string }> }
) {
  const { templateId, versionId } = await params;

  return NextResponse.json({
    message: "Template version approved",
    templateId,
    versionId,
    status: "approved"
  });
}
