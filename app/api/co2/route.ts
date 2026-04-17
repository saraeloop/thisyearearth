import { NextResponse } from "next/server";
import { fetchLatestCo2 } from "@/lib/api/co2";

export async function GET() {
  const reading = await fetchLatestCo2();
  return NextResponse.json(reading);
}
