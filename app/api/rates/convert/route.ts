// app/api/rates/convert/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const amount = searchParams.get("amount");

  if (!from || !to || !amount)
    return NextResponse.json(
      { error: "Missing ?from, ?to, or ?amount params" },
      { status: 400 }
    );

  const key = process.env.ACCESS_KEY;
  if (!key)
    return NextResponse.json({ error: "ACCESS_KEY not set" }, { status: 500 });

  const res = await fetch(
    `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}&format=0&access_key=${key}`
  );
  const data = await res.json();
  return NextResponse.json(data);
}
