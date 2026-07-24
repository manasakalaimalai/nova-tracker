import { NextRequest, NextResponse } from "next/server";
import { isValidPasscode } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passcode } = body;

    if (!passcode || !isValidPasscode(passcode)) {
      return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
