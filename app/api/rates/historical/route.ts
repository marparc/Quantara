// app/api/rates/historical/route.ts
import { NextRequest, NextResponse } from "next/server";

// app/api/rates/historical/route.ts
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date)
    return NextResponse.json({ error: "Missing ?date param" }, { status: 400 });

  const key = process.env.ACCESS_KEY;
  if (!key)
    return NextResponse.json({ error: "ACCESS_KEY not set" }, { status: 500 });

  const res = await fetch(
    `https://api.exchangerate.host/historical?date=${date}&format=1&access_key=${key}`,
    { next: { revalidate: 3600 } }
  );
  const data = await res.json();
  return NextResponse.json(data);
}
