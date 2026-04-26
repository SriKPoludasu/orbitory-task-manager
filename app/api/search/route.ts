import { NextResponse } from "next/server";
import { searchTasks } from "@/lib/actions";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const tasks = await searchTasks(q, projectId);
  return NextResponse.json(tasks);
}
