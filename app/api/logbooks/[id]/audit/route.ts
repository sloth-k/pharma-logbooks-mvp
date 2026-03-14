import { NextResponse } from "next/server";

import { getLogbookDetail } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logbook = await getLogbookDetail(id);

  return NextResponse.json({ items: logbook.auditTrail });
}
