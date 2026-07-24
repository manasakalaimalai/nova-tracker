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
    const { name, committedAmount, status, notes } = body;

    // Fetch current sponsor to check status change
    const currentSponsor = await prisma.sponsor.findUnique({
      where: { id: params.id },
    });

    if (!currentSponsor) {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
    }

    const updatedSponsor = await prisma.sponsor.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(committedAmount !== undefined && {
          committedAmount: parseFloat(committedAmount),
        }),
        ...(status && { status }),
        notes: notes !== undefined ? notes : currentSponsor.notes,
      },
    });

    // If status changed to "received", automatically create a credit transaction
    if (status === "received" && currentSponsor.status !== "received") {
      const sponsorPaymentCategory = await prisma.category.findFirst({
        where: { name: "Sponsor Payment" },
      });

      if (sponsorPaymentCategory) {
        await prisma.transaction.create({
          data: {
            date: new Date(),
            type: "credit",
            amount: updatedSponsor.committedAmount,
            categoryId: sponsorPaymentCategory.id,
            description: `Sponsor payment — ${updatedSponsor.name}`,
            teamMember: "Madhu",
            sponsorId: updatedSponsor.id,
          },
        });
      }
    }

    return NextResponse.json(updatedSponsor);
  } catch (error) {
    console.error("PUT /api/sponsors/[id] error:", error);
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
    // First unlink any transactions
    await prisma.transaction.updateMany({
      where: { sponsorId: params.id },
      data: { sponsorId: null },
    });

    await prisma.sponsor.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/sponsors/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
