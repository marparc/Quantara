// app/api/rates/change/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const start = searchParams.get("start_date");
  const end = searchParams.get("end_date");
  const currencies = searchParams.get("currencies") ?? "";

  if (!start || !end)
    return NextResponse.json(
      { error: "Missing ?start_date or ?end_date params" },
      { status: 400 }
    );

  const key = process.env.ACCESS_KEY;
  if (!key)
    return NextResponse.json({ error: "ACCESS_KEY not set" }, { status: 500 });

  const url = new URL("https://api.exchangerate.host/change");
  url.searchParams.set("start_date", start);
  url.searchParams.set("end_date", end);
  url.searchParams.set("format", "0");
  url.searchParams.set("access_key", key);
  if (currencies) url.searchParams.set("currencies", currencies);

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  const data = await res.json();
  return NextResponse.json(data);
}
