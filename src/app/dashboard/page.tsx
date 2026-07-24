import { prisma } from "@/lib/prisma";
import Dashboard from "@/components/Dashboard";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [transactions, sponsors] = await Promise.all([
    prisma.transaction.findMany({
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    prisma.sponsor.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const serializedTransactions = transactions.map((t) => ({
    ...t,
    date: t.date.toISOString(),
    amount: (t.amount as unknown as Decimal).toNumber(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    category: {
      ...t.category,
      createdAt: t.category.createdAt.toISOString(),
    },
  }));

  const serializedSponsors = sponsors.map((s) => ({
    ...s,
    committedAmount: (s.committedAmount as unknown as Decimal).toNumber(),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <main>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-fraunces text-3xl font-bold text-nova-text">
            Dashboard
          </h1>
          <p className="text-nova-text/40 text-sm mt-1">
            Financial overview for Nova Residency Cohort 0
          </p>
        </div>
        <Dashboard
          transactions={serializedTransactions}
          sponsors={serializedSponsors}
        />
      </div>
    </main>
  );
}
