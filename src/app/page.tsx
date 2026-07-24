import { prisma } from "@/lib/prisma";
import SummaryBar from "@/components/SummaryBar";
import TransactionTable from "@/components/TransactionTable";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

export default async function LedgerPage() {
  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      include: { category: true, sponsor: true },
      orderBy: { date: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + (t.amount as unknown as Decimal).toNumber(), 0);

  const totalDebits = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + (t.amount as unknown as Decimal).toNumber(), 0);

  // Serialize for client components
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
    sponsor: t.sponsor
      ? {
          ...t.sponsor,
          committedAmount: (
            t.sponsor.committedAmount as unknown as Decimal
          ).toNumber(),
          createdAt: t.sponsor.createdAt.toISOString(),
          updatedAt: t.sponsor.updatedAt.toISOString(),
        }
      : null,
  }));

  const serializedCategories = categories.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <main>
      <SummaryBar totalCredits={totalCredits} totalDebits={totalDebits} />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-fraunces text-3xl font-bold text-nova-text">
            Ledger
          </h1>
          <p className="text-nova-text/40 text-sm mt-1">
            All financial transactions for Nova Residency Cohort 0
          </p>
        </div>
        <TransactionTable
          transactions={serializedTransactions}
          categories={serializedCategories}
        />
      </div>
    </main>
  );
}
