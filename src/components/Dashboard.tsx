"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatINR, cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: string | number;
  category: Category;
  teamMember: string;
}

interface Sponsor {
  id: string;
  name: string;
  committedAmount: string | number;
  status: string;
}

interface DashboardProps {
  transactions: Transaction[];
  sponsors: Sponsor[];
}

function formatINRShort(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount}`;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-nova-background border border-nova-border rounded-lg px-3 py-2 shadow-md text-sm">
        <p className="font-medium text-nova-text mb-0.5">{label}</p>
        <p className="text-nova-debit numbers">{formatINR(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

interface CreditTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CreditTooltip({ active, payload, label }: CreditTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-nova-background border border-nova-border rounded-lg px-3 py-2 shadow-md text-sm">
        <p className="font-medium text-nova-text mb-0.5">{label}</p>
        <p className="text-nova-credit numbers">{formatINR(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export default function Dashboard({ transactions, sponsors }: DashboardProps) {
  // Compute totals
  const totalCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalDebits = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const net = totalCredits - totalDebits;

  // Sponsor stats
  const totalCommitted = sponsors.reduce(
    (sum, s) => sum + Number(s.committedAmount),
    0
  );
  const totalReceived = sponsors
    .filter((s) => s.status === "received")
    .reduce((sum, s) => sum + Number(s.committedAmount), 0);
  const totalOutstanding = totalCommitted - totalReceived;

  // Spend by category (debits only)
  const categorySpend: Record<string, { name: string; amount: number; color: string }> = {};
  transactions
    .filter((t) => t.type === "debit")
    .forEach((t) => {
      const key = t.category.id;
      if (!categorySpend[key]) {
        categorySpend[key] = {
          name: t.category.name,
          amount: 0,
          color: t.category.color,
        };
      }
      categorySpend[key].amount += Number(t.amount);
    });

  const categoryData = Object.values(categorySpend)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Credits by category
  const creditCategoryData: Record<string, { name: string; amount: number; color: string }> = {};
  transactions
    .filter((t) => t.type === "credit")
    .forEach((t) => {
      const key = t.category.id;
      if (!creditCategoryData[key]) {
        creditCategoryData[key] = {
          name: t.category.name,
          amount: 0,
          color: t.category.color,
        };
      }
      creditCategoryData[key].amount += Number(t.amount);
    });
  const creditData = Object.values(creditCategoryData).sort(
    (a, b) => b.amount - a.amount
  );

  // By team member
  const memberSpend: Record<string, { credits: number; debits: number }> = {};
  transactions.forEach((t) => {
    if (!memberSpend[t.teamMember]) {
      memberSpend[t.teamMember] = { credits: 0, debits: 0 };
    }
    if (t.type === "credit") {
      memberSpend[t.teamMember].credits += Number(t.amount);
    } else {
      memberSpend[t.teamMember].debits += Number(t.amount);
    }
  });

  const memberData = Object.entries(memberSpend).map(([name, data]) => ({
    name,
    debits: data.debits,
    credits: data.credits,
  }));

  return (
    <div className="space-y-8">
      {/* Net balance hero */}
      <div className="bg-nova-card border border-nova-border rounded-2xl p-8 text-center">
        <p className="text-sm font-medium text-nova-text/40 uppercase tracking-widest mb-3">
          Net Balance
        </p>
        <p
          className={cn(
            "numbers text-5xl font-bold mb-2",
            net >= 0 ? "text-nova-credit" : "text-nova-debit"
          )}
        >
          {formatINR(Math.abs(net))}
        </p>
        <p className="text-sm text-nova-text/40">
          {net >= 0 ? "surplus" : "deficit"} — Credits minus Debits
        </p>
      </div>

      {/* Top row stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-nova-card border border-nova-border rounded-xl p-5">
          <p className="text-xs font-medium text-nova-text/40 uppercase tracking-widest mb-2">
            Total Credits
          </p>
          <p className="numbers text-2xl font-bold text-nova-credit">
            {formatINR(totalCredits)}
          </p>
          <p className="text-xs text-nova-text/40 mt-1">
            {transactions.filter((t) => t.type === "credit").length} transactions
          </p>
        </div>
        <div className="bg-nova-card border border-nova-border rounded-xl p-5">
          <p className="text-xs font-medium text-nova-text/40 uppercase tracking-widest mb-2">
            Total Debits
          </p>
          <p className="numbers text-2xl font-bold text-nova-debit">
            {formatINR(totalDebits)}
          </p>
          <p className="text-xs text-nova-text/40 mt-1">
            {transactions.filter((t) => t.type === "debit").length} transactions
          </p>
        </div>
        <div className="bg-nova-card border border-nova-border rounded-xl p-5">
          <p className="text-xs font-medium text-nova-text/40 uppercase tracking-widest mb-2">
            Sponsor Committed
          </p>
          <p className="numbers text-2xl font-bold text-nova-text">
            {formatINR(totalCommitted)}
          </p>
          <p className="text-xs text-nova-text/40 mt-1">
            {sponsors.length} sponsor{sponsors.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="bg-nova-card border border-nova-border rounded-xl p-5">
          <p className="text-xs font-medium text-nova-text/40 uppercase tracking-widest mb-2">
            Outstanding
          </p>
          <p
            className={cn(
              "numbers text-2xl font-bold",
              totalOutstanding > 0 ? "text-nova-debit" : "text-nova-text/40"
            )}
          >
            {formatINR(totalOutstanding)}
          </p>
          <p className="text-xs text-nova-text/40 mt-1">
            {formatINR(totalReceived)} received
          </p>
        </div>
      </div>

      {/* Sponsor progress */}
      {sponsors.length > 0 && (
        <div className="bg-nova-card border border-nova-border rounded-xl p-6">
          <h2 className="font-fraunces text-lg font-bold text-nova-text mb-4">
            Sponsor Progress
          </h2>
          <div className="mb-3">
            <div className="flex justify-between text-xs text-nova-text/50 mb-1.5">
              <span>Received</span>
              <span>
                {totalCommitted > 0
                  ? Math.round((totalReceived / totalCommitted) * 100)
                  : 0}
                % of committed
              </span>
            </div>
            <div className="h-3 bg-nova-background rounded-full overflow-hidden border border-nova-border">
              <div
                className="h-full bg-nova-credit rounded-full transition-all duration-500"
                style={{
                  width:
                    totalCommitted > 0
                      ? `${(totalReceived / totalCommitted) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {sponsors.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 bg-nova-background rounded-lg border border-nova-border"
              >
                <div>
                  <p className="text-sm font-medium text-nova-text truncate">
                    {s.name}
                  </p>
                  <p className="numbers text-xs text-nova-text/50 mt-0.5">
                    {formatINR(s.committedAmount)}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    s.status === "received"
                      ? "bg-nova-credit/10 text-nova-credit"
                      : s.status === "invoiced"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-nova-text/5 text-nova-text/50"
                  )}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spend by category */}
        <div className="bg-nova-card border border-nova-border rounded-xl p-6">
          <h2 className="font-fraunces text-lg font-bold text-nova-text mb-4">
            Spend by Category
          </h2>
          {categoryData.length === 0 ? (
            <p className="text-nova-text/30 text-sm py-8 text-center">
              No debit transactions yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, categoryData.length * 44)}>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  tickFormatter={formatINRShort}
                  tick={{ fontSize: 11, fill: "#2B262080" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 12, fill: "#2B2620" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color || "#B5725A"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Credits by category */}
        <div className="bg-nova-card border border-nova-border rounded-xl p-6">
          <h2 className="font-fraunces text-lg font-bold text-nova-text mb-4">
            Credits by Category
          </h2>
          {creditData.length === 0 ? (
            <p className="text-nova-text/30 text-sm py-8 text-center">
              No credit transactions yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, creditData.length * 44)}>
              <BarChart
                data={creditData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  tickFormatter={formatINRShort}
                  tick={{ fontSize: 11, fill: "#2B262080" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 12, fill: "#2B2620" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CreditTooltip />} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {creditData.map((entry, index) => (
                    <Cell key={index} fill={entry.color || "#6B8F71"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* By team member */}
      <div className="bg-nova-card border border-nova-border rounded-xl p-6">
        <h2 className="font-fraunces text-lg font-bold text-nova-text mb-4">
          Activity by Team Member
        </h2>
        {memberData.length === 0 ? (
          <p className="text-nova-text/30 text-sm py-8 text-center">
            No transactions yet
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {memberData.map((m) => (
              <div
                key={m.name}
                className="bg-nova-background border border-nova-border rounded-xl p-5"
              >
                <p className="font-fraunces text-lg font-bold text-nova-text mb-3">
                  {m.name}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-nova-text/50">Credits</span>
                    <span className="numbers text-sm font-medium text-nova-credit">
                      {formatINR(m.credits)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-nova-text/50">Debits</span>
                    <span className="numbers text-sm font-medium text-nova-debit">
                      {formatINR(m.debits)}
                    </span>
                  </div>
                  <div className="border-t border-nova-border pt-2 flex justify-between items-center">
                    <span className="text-xs font-medium text-nova-text/50">
                      Net
                    </span>
                    <span
                      className={cn(
                        "numbers text-sm font-bold",
                        m.credits - m.debits >= 0
                          ? "text-nova-credit"
                          : "text-nova-debit"
                      )}
                    >
                      {formatINR(Math.abs(m.credits - m.debits))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
