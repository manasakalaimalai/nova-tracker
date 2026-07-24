"use client";

import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SummaryBarProps {
  totalCredits: number;
  totalDebits: number;
}

export default function SummaryBar({
  totalCredits,
  totalDebits,
}: SummaryBarProps) {
  const net = totalCredits - totalDebits;

  return (
    <div className="sticky top-14 z-40 bg-nova-background border-b border-nova-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-8">
          {/* Credits */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-nova-text/40 uppercase tracking-widest mb-1">
              Total Credits
            </span>
            <span className="numbers text-2xl font-bold text-nova-credit">
              {formatINR(totalCredits)}
            </span>
          </div>

          <div className="w-px h-10 bg-nova-border" />

          {/* Debits */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-nova-text/40 uppercase tracking-widest mb-1">
              Total Debits
            </span>
            <span className="numbers text-2xl font-bold text-nova-debit">
              {formatINR(totalDebits)}
            </span>
          </div>

          <div className="w-px h-10 bg-nova-border" />

          {/* Net Balance */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-nova-text/40 uppercase tracking-widest mb-1">
              Net Balance
            </span>
            <span
              className={cn(
                "numbers text-2xl font-bold",
                net >= 0 ? "text-nova-credit" : "text-nova-debit"
              )}
            >
              {formatINR(Math.abs(net))}
              <span className="text-base ml-1 font-normal">
                {net >= 0 ? "surplus" : "deficit"}
              </span>
            </span>
          </div>

          {/* Export button pushed to right */}
          <div className="ml-auto">
            <a
              href="/api/export"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-nova-border text-sm font-medium text-nova-text/60 hover:text-nova-text hover:border-nova-text/30 transition-colors"
              download
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
