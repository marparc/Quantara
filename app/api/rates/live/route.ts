// app/api/rates/live/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.ACCESS_KEY;
  if (!key)
    return NextResponse.json({ error: "ACCESS_KEY not set" }, { status: 500 });

  const res = await fetch(
    `https://api.exchangerate.host/live?format=0&access_key=${key}`,
    { next: { revalidate: 3600 } }
  );
  const data = await res.json();
  return NextResponse.json(data);
}
