import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

function escapeCSV(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        category: true,
        sponsor: true,
      },
      orderBy: { date: "desc" },
    });

    const headers = [
      "Date",
      "Type",
      "Amount",
      "Category",
      "Description",
      "Team Member",
      "Payment Mode",
      "Notes",
      "Sponsor",
    ];

    const rows = transactions.map((t) => [
      escapeCSV(formatDate(t.date)),
      escapeCSV(t.type),
      escapeCSV(t.amount.toString()),
      escapeCSV(t.category.name),
      escapeCSV(t.description),
      escapeCSV(t.teamMember),
      escapeCSV(t.paymentMode),
      escapeCSV(t.notes),
      escapeCSV(t.sponsor?.name),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="nova-tracker-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
