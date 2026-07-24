import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidPasscode } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const teamMember = searchParams.get("teamMember");

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (teamMember) where.teamMember = teamMember;

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        sponsor: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
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
    const {
      date,
      type,
      amount,
      categoryId,
      description,
      teamMember,
      paymentMode,
      notes,
      sponsorId,
    } = body;

    if (!date || !type || !amount || !categoryId || !description || !teamMember) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(date),
        type,
        amount: parseFloat(amount),
        categoryId,
        description,
        teamMember,
        paymentMode: paymentMode || null,
        notes: notes || null,
        sponsorId: sponsorId || null,
      },
      include: {
        category: true,
        sponsor: true,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
