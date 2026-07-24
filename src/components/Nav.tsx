"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useEditMode } from "@/context/EditModeContext";
import { cn } from "@/lib/utils";

function LockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UnlockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const { isEditMode, unlock, lock } = useEditMode();
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navLinks = [
    { href: "/", label: "Ledger" },
    { href: "/sponsors", label: "Sponsors" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const ok = await unlock(passcodeInput);
    setLoading(false);
    if (ok) {
      setShowPasscodeModal(false);
      setPasscodeInput("");
    } else {
      setError("Incorrect passcode. Try again.");
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-nova-background border-b border-nova-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <span className="font-fraunces text-lg font-bold text-nova-text tracking-tight">
            Nova Residency — Cohort 0
          </span>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-1.5 rounded text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-nova-card text-nova-text"
                    : "text-nova-text/60 hover:text-nova-text hover:bg-nova-card/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Edit mode toggle */}
          <div className="flex items-center gap-3">
            {isEditMode && (
              <span className="text-xs font-medium px-2 py-1 rounded bg-nova-debit/10 text-nova-debit border border-nova-debit/20">
                Edit Mode
              </span>
            )}
            <button
              onClick={() => {
                if (isEditMode) {
                  lock();
                } else {
                  setShowPasscodeModal(true);
                }
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium border transition-colors",
                isEditMode
                  ? "border-nova-border text-nova-text/60 hover:text-nova-debit hover:border-nova-debit/30"
                  : "border-nova-border text-nova-text/60 hover:text-nova-text hover:border-nova-border"
              )}
              title={isEditMode ? "Lock (exit edit mode)" : "Unlock edit mode"}
            >
              {isEditMode ? <UnlockIcon /> : <LockIcon />}
              <span>{isEditMode ? "Lock" : "Unlock"}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Passcode Modal */}
      {showPasscodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-nova-text/20 backdrop-blur-sm"
            onClick={() => {
              setShowPasscodeModal(false);
              setPasscodeInput("");
              setError("");
            }}
          />
          <div className="relative bg-nova-background border border-nova-border rounded-xl shadow-lg p-8 w-full max-w-sm mx-4">
            <h2 className="font-fraunces text-xl font-bold text-nova-text mb-1">
              Enter Passcode
            </h2>
            <p className="text-sm text-nova-text/50 mb-6">
              Unlock edit mode to add or modify records.
            </p>

            <form onSubmit={handleUnlock} className="space-y-4">
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => {
                  setPasscodeInput(e.target.value);
                  setError("");
                }}
                placeholder="Enter passcode"
                autoFocus
                className="w-full px-4 py-2.5 bg-nova-card border border-nova-border rounded-lg text-nova-text placeholder-nova-text/30 focus:outline-none focus:border-nova-text/40 text-sm"
              />
              {error && (
                <p className="text-sm text-nova-debit">{error}</p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasscodeModal(false);
                    setPasscodeInput("");
                    setError("");
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-nova-border text-sm font-medium text-nova-text/60 hover:text-nova-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !passcodeInput}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-nova-text text-nova-background text-sm font-medium hover:bg-nova-text/90 transition-colors disabled:opacity-40"
                >
                  {loading ? "Checking..." : "Unlock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
