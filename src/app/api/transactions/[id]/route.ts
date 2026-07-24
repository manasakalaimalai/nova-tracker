import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidPasscode } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(type && { type }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(categoryId && { categoryId }),
        ...(description && { description }),
        ...(teamMember && { teamMember }),
        paymentMode: paymentMode ?? null,
        notes: notes ?? null,
        sponsorId: sponsorId ?? null,
      },
      include: {
        category: true,
        sponsor: true,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("PUT /api/transactions/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const passcode = request.headers.get("x-edit-passcode") ?? "";
  if (!isValidPasscode(passcode)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.transaction.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/transactions/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
