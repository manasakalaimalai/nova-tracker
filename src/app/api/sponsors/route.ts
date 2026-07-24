import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidPasscode } from "@/lib/auth";

export async function GET() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        transactions: {
          include: { category: true },
        },
      },
    });
    return NextResponse.json(sponsors);
  } catch (error) {
    console.error("GET /api/sponsors error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const passcode = request.headers.get("x-edit-passcode") ?? "";
  if (!isValidPasscode(passcode)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, committedAmount, status, notes } = body;

    if (!name || committedAmount === undefined) {
      return NextResponse.json(
        { error: "Name and committedAmount are required" },
        { status: 400 }
      );
    }

    const sponsor = await prisma.sponsor.create({
      data: {
        name,
        committedAmount: parseFloat(committedAmount),
        status: status || "pledged",
        notes: notes || null,
      },
    });

    return NextResponse.json(sponsor, { status: 201 });
  } catch (error) {
    console.error("POST /api/sponsors error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
