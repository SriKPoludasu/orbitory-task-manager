import { NextResponse } from "next/server";
import { broadcast } from "@/lib/pusher";

export async function POST(request: Request) {
  const body = await request.json();
  await broadcast(body.channel, body.event, body.payload ?? {});
  return NextResponse.json({ ok: true });
}
