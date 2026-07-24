"use client";

import { useState, useCallback } from "react";
import { useEditMode } from "@/context/EditModeContext";
import { formatINR, formatDate, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Sponsor {
  id: string;
  name: string;
  committedAmount: string | number;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SponsorTableProps {
  sponsors: Sponsor[];
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pledged:
      "bg-nova-text/8 text-nova-text/60 border border-nova-border",
    invoiced:
      "bg-amber-50 text-amber-700 border border-amber-200",
    received:
      "bg-nova-credit/10 text-nova-credit border border-nova-credit/20",
  };
  const labels: Record<string, string> = {
    pledged: "Pledged",
    invoiced: "Invoiced",
    received: "Received",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        styles[status] || styles.pledged
      )}
    >
      {labels[status] || status}
    </span>
  );
}

function AddSponsorModal({
  passcode,
  onAdded,
  onClose,
}: {
  passcode: string;
  onAdded: (s: Sponsor) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    committedAmount: "",
    status: "pledged",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.committedAmount) {
      setError("Name and committed amount are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sponsors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-edit-passcode": passcode,
        },
        body: JSON.stringify({
          name: form.name,
          committedAmount: parseFloat(form.committedAmount),
          status: form.status,
          notes: form.notes || null,
        }),
      });
      if (res.ok) {
        const s = await res.json();
        onAdded(s);
        onClose();
      } else {
        setError("Failed to add sponsor");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-nova-text/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-nova-background border border-nova-border rounded-xl shadow-lg p-8 w-full max-w-md mx-4">
        <h2 className="font-fraunces text-xl font-bold text-nova-text mb-6">
          Add Sponsor
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-nova-text/50 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              autoFocus
              className="w-full px-3 py-2 bg-nova-card border border-nova-border rounded-lg text-sm focus:outline-none focus:border-nova-text/40"
              placeholder="Sponsor name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-nova-text/50 mb-1">
              Committed Amount (₹) *
            </label>
            <input
              type="number"
              value={form.committedAmount}
              onChange={(e) => setField("committedAmount", e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-nova-card border border-nova-border rounded-lg text-sm focus:outline-none focus:border-nova-text/40"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-nova-text/50 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
              className="w-full px-3 py-2 bg-nova-card border border-nova-border rounded-lg text-sm focus:outline-none focus:border-nova-text/40"
            >
              <option value="pledged">Pledged</option>
              <option value="invoiced">Invoiced</option>
              <option value="received">Received</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-nova-text/50 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-nova-card border border-nova-border rounded-lg text-sm focus:outline-none focus:border-nova-text/40 resize-none"
              placeholder="Optional notes"
            />
          </div>
          {error && <p className="text-sm text-nova-debit">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-nova-border rounded-lg text-sm font-medium text-nova-text/60 hover:text-nova-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-nova-text text-nova-background rounded-lg text-sm font-medium hover:bg-nova-text/90 disabled:opacity-40"
            >
              {loading ? "Adding..." : "Add Sponsor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditSponsorModal({
  sponsor,
  passcode,
  onSaved,
  onClose,
}: {
  sponsor: Sponsor;
  passcode: string;
  onSaved: (s: Sponsor) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: sponsor.name,
    committedAmount: String(sponsor.committedAmount),
    status: sponsor.status,
    notes: sponsor.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/sponsors/${sponsor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-edit-passcode": passcode,
        },
        body: JSON.stringify({
          name: form.name,
          committedAmount: parseFloat(form.committedAmount),
          status: form.status,
          notes: form.notes || null,
        }),
      });
      if (res.ok) {
        const s = await res.json();
        onSaved(s);
        onClose();
      } else {
        setError("Failed to save");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-nova-text/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-nova-background border border-nova-border rounded-xl shadow-lg p-8 w-full max-w-md mx-4">
        <h2 className="font-fraunces text-xl font-bold text-nova-text mb-6">
          Edit Sponsor
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-nova-text/50 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className="w-full px-3 py-2 bg-nova-card border border-nova-border rounded-lg text-sm focus:outline-none focus:border-nova-text/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-nova-text/50 mb-1">
              Committed Amount (₹)
            </label>
            <input
              type="number"
              value={form.committedAmount}
              onChange={(e) => setField("committedAmount", e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-nova-card border border-nova-border rounded-lg text-sm focus:outline-none focus:border-nova-text/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-nova-text/50 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
              className="w-full px-3 py-2 bg-nova-card border border-nova-border rounded-lg text-sm focus:outline-none focus:border-nova-text/40"
            >
              <option value="pledged">Pledged</option>
              <option value="invoiced">Invoiced</option>
              <option value="received">Received</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-nova-text/50 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-nova-card border border-nova-border rounded-lg text-sm focus:outline-none focus:border-nova-text/40 resize-none"
            />
          </div>
          {error && <p className="text-sm text-nova-debit">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-nova-border rounded-lg text-sm font-medium text-nova-text/60 hover:text-nova-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-nova-text text-nova-background rounded-lg text-sm font-medium hover:bg-nova-text/90 disabled:opacity-40"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SponsorTable({ sponsors: initialSponsors }: SponsorTableProps) {
  const { isEditMode, passcode } = useEditMode();
  const router = useRouter();

  const [sponsors, setSponsors] = useState<Sponsor[]>(initialSponsors);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);

  const handleMarkReceived = useCallback(
    async (sponsor: Sponsor) => {
      if (
        !confirm(
          `Mark "${sponsor.name}" as received? This will create a credit transaction for ${formatINR(sponsor.committedAmount)}.`
        )
      )
        return;
      try {
        const res = await fetch(`/api/sponsors/${sponsor.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-edit-passcode": passcode,
          },
          body: JSON.stringify({
            status: "received",
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          setSponsors((prev) =>
            prev.map((s) => (s.id === updated.id ? { ...s, status: "received" } : s))
          );
          router.refresh();
        } else {
          alert("Failed to update sponsor");
        }
      } catch {
        alert("Network error");
      }
    },
    [passcode, router]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this sponsor?")) return;
      try {
        const res = await fetch(`/api/sponsors/${id}`, {
          method: "DELETE",
          headers: { "x-edit-passcode": passcode },
        });
        if (res.ok) {
          setSponsors((prev) => prev.filter((s) => s.id !== id));
          router.refresh();
        } else {
          alert("Failed to delete");
        }
      } catch {
        alert("Network error");
      }
    },
    [passcode, router]
  );

  // Summary stats
  const totalCommitted = sponsors.reduce(
    (sum, s) => sum + Number(s.committedAmount),
    0
  );
  const totalReceived = sponsors
    .filter((s) => s.status === "received")
    .reduce((sum, s) => sum + Number(s.committedAmount), 0);
  const totalOutstanding = totalCommitted - totalReceived;

  return (
    <div>
      {/* Sponsor summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-nova-card border border-nova-border rounded-xl p-5">
          <p className="text-xs font-medium text-nova-text/40 uppercase tracking-widest mb-2">
            Total Committed
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
            Total Received
          </p>
          <p className="numbers text-2xl font-bold text-nova-credit">
            {formatINR(totalReceived)}
          </p>
          <p className="text-xs text-nova-text/40 mt-1">
            {sponsors.filter((s) => s.status === "received").length} confirmed
          </p>
        </div>
        <div className="bg-nova-card border border-nova-border rounded-xl p-5">
          <p className="text-xs font-medium text-nova-text/40 uppercase tracking-widest mb-2">
            Outstanding
          </p>
          <p
            className={cn(
              "numbers text-2xl font-bold",
              totalOutstanding > 0 ? "text-nova-debit" : "text-nova-credit"
            )}
          >
            {formatINR(totalOutstanding)}
          </p>
          <p className="text-xs text-nova-text/40 mt-1">
            {sponsors.filter((s) => s.status !== "received").length} pending
          </p>
        </div>
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-fraunces text-lg font-bold text-nova-text">
          Sponsors
        </h2>
        {isEditMode && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-nova-text text-nova-background text-sm font-medium rounded-lg hover:bg-nova-text/90 transition-colors"
          >
            <span>+</span>
            <span>Add Sponsor</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-nova-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-nova-card border-b border-nova-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-nova-text/50 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-nova-text/50 uppercase tracking-wider">
                Committed
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-nova-text/50 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-nova-text/50 uppercase tracking-wider">
                Outstanding
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-nova-text/50 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-nova-text/50 uppercase tracking-wider">
                Added
              </th>
              {isEditMode && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-nova-text/50 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sponsors.length === 0 ? (
              <tr>
                <td
                  colSpan={isEditMode ? 7 : 6}
                  className="px-4 py-16 text-center text-nova-text/30 text-sm"
                >
                  No sponsors yet.
                </td>
              </tr>
            ) : (
              sponsors.map((s) => {
                const outstanding =
                  s.status === "received" ? 0 : Number(s.committedAmount);
                return (
                  <tr
                    key={s.id}
                    className="border-b border-nova-border/60 hover:bg-nova-card/40 transition-colors"
                    style={{ height: "48px" }}
                  >
                    <td className="px-4 py-3 font-medium text-nova-text">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-right numbers font-medium text-nova-text">
                      {formatINR(s.committedAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={s.status} />
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right numbers font-medium",
                        outstanding > 0
                          ? "text-nova-debit"
                          : "text-nova-text/40"
                      )}
                    >
                      {formatINR(outstanding)}
                    </td>
                    <td className="px-4 py-3 text-nova-text/50 max-w-xs truncate text-xs">
                      {s.notes || "—"}
                    </td>
                    <td className="px-4 py-3 text-nova-text/40 text-xs whitespace-nowrap">
                      {formatDate(s.createdAt)}
                    </td>
                    {isEditMode && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {s.status !== "received" && (
                            <button
                              onClick={() => handleMarkReceived(s)}
                              className="text-xs text-nova-credit/70 hover:text-nova-credit px-2 py-1 rounded border border-nova-border hover:border-nova-credit/30 transition-colors whitespace-nowrap"
                            >
                              Mark received
                            </button>
                          )}
                          <button
                            onClick={() => setEditingSponsor(s)}
                            className="text-xs text-nova-text/50 hover:text-nova-text px-2 py-1 rounded border border-nova-border hover:border-nova-text/30 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="text-xs text-nova-debit/60 hover:text-nova-debit px-2 py-1 rounded border border-nova-border hover:border-nova-debit/30 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddSponsorModal
          passcode={passcode}
          onAdded={(s) => setSponsors((prev) => [s, ...prev])}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingSponsor && (
        <EditSponsorModal
          sponsor={editingSponsor}
          passcode={passcode}
          onSaved={(updated) =>
            setSponsors((prev) =>
              prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
            )
          }
          onClose={() => setEditingSponsor(null)}
        />
      )}
    </div>
  );
}
