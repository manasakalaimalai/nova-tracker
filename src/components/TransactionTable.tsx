"use client";

import { useState, useCallback } from "react";
import { useEditMode } from "@/context/EditModeContext";
import { formatINR, formatDate, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
  categoryId: string;
  category: Category;
  description: string;
  teamMember: string;
  paymentMode: string | null;
  notes: string | null;
  sponsorId: string | null;
}

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
}

const TEAM_MEMBERS = ["Manasa", "Harshita", "Inchara"];
const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Card", "Cheque", "Other"];

function AddCategoryInline({
  type,
  passcode,
  onCreated,
}: {
  type: string;
  passcode: string;
  onCreated: (cat: Category) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(type === "credit" ? "#6B8F71" : "#B5725A");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-edit-passcode": passcode,
        },
        body: JSON.stringify({ name: name.trim(), type, color }),
      });
      if (res.ok) {
        const cat = await res.json();
        onCreated(cat);
      } else {
        setError("Failed to create category");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2 p-3 bg-nova-background border border-nova-border rounded-lg">
      <p className="text-xs font-medium text-nova-text/50 mb-2">New category</p>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="flex-1 px-2 py-1.5 text-xs bg-white border border-nova-border rounded focus:outline-none focus:border-nova-text/40"
          autoFocus
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-7 border border-nova-border rounded cursor-pointer"
          title="Pick color"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-3 py-1.5 bg-nova-text text-nova-background text-xs rounded font-medium disabled:opacity-40"
        >
          {loading ? "..." : "Add"}
        </button>
      </form>
      {error && <p className="text-xs text-nova-debit mt-1">{error}</p>}
    </div>
  );
}

interface AddRowState {
  date: string;
  type: string;
  amount: string;
  categoryId: string;
  description: string;
  teamMember: string;
  paymentMode: string;
  notes: string;
  showNewCategory: boolean;
}

function AddTransactionRow({
  categories,
  passcode,
  onAdded,
}: {
  categories: Category[];
  passcode: string;
  onAdded: (t: Transaction) => void;
}) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<AddRowState>({
    date: today,
    type: "debit",
    amount: "",
    categoryId: "",
    description: "",
    teamMember: "Manasa",
    paymentMode: "",
    notes: "",
    showNewCategory: false,
  });
  const [localCats, setLocalCats] = useState<Category[]>(categories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredCats = localCats.filter((c) => c.type === form.type);

  function setField(field: keyof AddRowState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.date || !form.amount || !form.categoryId || !form.description || !form.teamMember) {
      setError("Please fill all required fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-edit-passcode": passcode,
        },
        body: JSON.stringify({
          date: form.date,
          type: form.type,
          amount: parseFloat(form.amount),
          categoryId: form.categoryId,
          description: form.description,
          teamMember: form.teamMember,
          paymentMode: form.paymentMode || null,
          notes: form.notes || null,
        }),
      });
      if (res.ok) {
        const t = await res.json();
        onAdded(t);
        setForm({
          date: today,
          type: "debit",
          amount: "",
          categoryId: "",
          description: "",
          teamMember: "Manasa",
          paymentMode: "",
          notes: "",
          showNewCategory: false,
        });
        router.refresh();
      } else {
        setError("Failed to add transaction");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <tr className="bg-nova-card border-b border-nova-border">
      <td className="px-4 py-3" colSpan={8}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-nova-text/50 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
                className="w-full px-2 py-1.5 text-sm bg-white border border-nova-border rounded focus:outline-none focus:border-nova-text/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-nova-text/50 mb-1">
                Type *
              </label>
              <select
                value={form.type}
                onChange={(e) => {
                  setField("type", e.target.value);
                  setField("categoryId", "");
                  setField("showNewCategory", false);
                }}
                className="w-full px-2 py-1.5 text-sm bg-white border border-nova-border rounded focus:outline-none focus:border-nova-text/40"
              >
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-nova-text/50 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setField("amount", e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-2 py-1.5 text-sm bg-white border border-nova-border rounded focus:outline-none focus:border-nova-text/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-nova-text/50 mb-1">
                Category *
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setField("showNewCategory", true);
                    setField("categoryId", "");
                  } else {
                    setField("categoryId", e.target.value);
                    setField("showNewCategory", false);
                  }
                }}
                className="w-full px-2 py-1.5 text-sm bg-white border border-nova-border rounded focus:outline-none focus:border-nova-text/40"
              >
                <option value="">Select category</option>
                {filteredCats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value="__new__">+ New category</option>
              </select>
              {form.showNewCategory && (
                <AddCategoryInline
                  type={form.type}
                  passcode={passcode}
                  onCreated={(cat) => {
                    setLocalCats((prev) => [...prev, cat]);
                    setField("categoryId", cat.id);
                    setField("showNewCategory", false);
                  }}
                />
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-nova-text/50 mb-1">
                Description *
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="What was this for?"
                className="w-full px-2 py-1.5 text-sm bg-white border border-nova-border rounded focus:outline-none focus:border-nova-text/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-nova-text/50 mb-1">
                Team Member *
              </label>
              <select
                value={form.teamMember}
                onChange={(e) => setField("teamMember", e.target.value)}
                className="w-full px-2 py-1.5 text-sm bg-white border border-nova-border rounded focus:outline-none focus:border-nova-text/40"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-nova-text/50 mb-1">
                Payment Mode
              </label>
              <select
                value={form.paymentMode}
                onChange={(e) => setField("paymentMode", e.target.value)}
                className="w-full px-2 py-1.5 text-sm bg-white border border-nova-border rounded focus:outline-none focus:border-nova-text/40"
              >
                <option value="">Select...</option>
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 md:col-span-4">
              <label className="block text-xs font-medium text-nova-text/50 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Optional notes"
                className="w-full px-2 py-1.5 text-sm bg-white border border-nova-border rounded focus:outline-none focus:border-nova-text/40"
              />
            </div>
          </div>
          {error && <p className="text-sm text-nova-debit mb-2">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-nova-text text-nova-background text-sm font-medium rounded-lg hover:bg-nova-text/90 transition-colors disabled:opacity-40"
            >
              {loading ? "Adding..." : "Add Transaction"}
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}

function EditTransactionRow({
  transaction,
  categories,
  passcode,
  onSaved,
  onCancel,
}: {
  transaction: Transaction;
  categories: Category[];
  passcode: string;
  onSaved: (t: Transaction) => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    date: new Date(transaction.date).toISOString().slice(0, 10),
    type: transaction.type,
    amount: String(transaction.amount),
    categoryId: transaction.categoryId,
    description: transaction.description,
    teamMember: transaction.teamMember,
    paymentMode: transaction.paymentMode || "",
    notes: transaction.notes || "",
  });
  const [localCats, setLocalCats] = useState<Category[]>(categories);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredCats = localCats.filter((c) => c.type === form.type);

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-edit-passcode": passcode,
        },
        body: JSON.stringify({
          date: form.date,
          type: form.type,
          amount: parseFloat(form.amount),
          categoryId: form.categoryId,
          description: form.description,
          teamMember: form.teamMember,
          paymentMode: form.paymentMode || null,
          notes: form.notes || null,
        }),
      });
      if (res.ok) {
        const t = await res.json();
        onSaved(t);
        router.refresh();
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
    <tr className="bg-nova-card border-b border-nova-border">
      <td className="px-4 py-3" colSpan={8}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-nova-text/50 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-white border border-nova-border rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-nova-text/50 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => {
                setField("type", e.target.value);
                setField("categoryId", "");
              }}
              className="w-full px-2 py-1.5 text-sm bg-white border border-nova-border rounded focus:outline-none"
            >
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-nova-text/50 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setField("amount", e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-2 py-1.5 text-sm bg-white border border-nova-border rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-nova-text/50 mb-1">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  setShowNewCategory(true);
                  setField("categoryId", "");
                } else {
                  setField("categoryId", e.target.value);
                  setShowNewCategory(false);
                }
              }}
              className="w-full px-2 py-1.5 text-sm bg-white border border-nova-border rounded focus:outline-none"
            >
              <option value="">Select category</option>
              {filteredCats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="__new__">+ New category</option>
            </select>
            {showNewCategory && (
              <AddCategoryInline
                type={form.type}
                passcode={passcode}
                onCreated={(cat) => {
                  setLocalCats((prev) => [...prev, cat]);
                  setField("categoryId", cat.id);
                  setShowNewCategory(false);
                }}
              />
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-nova-text/50 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-white border border-nova-border rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-nova-text/50 mb-1">Team Member</label>
            <select
              value={form.teamMember}
              onChange={(e) => setField("teamMember", e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-white border border-nova-border rounded focus:outline-none"
            >
              {TEAM_MEMBERS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-nova-text/50 mb-1">Payment Mode</label>
            <select
              value={form.paymentMode}
              onChange={(e) => setField("paymentMode", e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-white border border-nova-border rounded focus:outline-none"
            >
              <option value="">Select...</option>
              {PAYMENT_MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 md:col-span-4">
            <label className="block text-xs font-medium text-nova-text/50 mb-1">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-white border border-nova-border rounded focus:outline-none"
            />
          </div>
        </div>
        {error && <p className="text-sm text-nova-debit mb-2">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-nova-text text-nova-background text-sm font-medium rounded-lg hover:bg-nova-text/90 disabled:opacity-40"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-nova-border text-sm font-medium rounded-lg text-nova-text/60 hover:text-nova-text"
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function TransactionTable({
  transactions: initialTransactions,
  categories: initialCategories,
}: TransactionTableProps) {
  const { isEditMode, passcode } = useEditMode();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterMember, setFilterMember] = useState("");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddRow, setShowAddRow] = useState(false);

  const handleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this transaction?")) return;
      try {
        const res = await fetch(`/api/transactions/${id}`, {
          method: "DELETE",
          headers: { "x-edit-passcode": passcode },
        });
        if (res.ok) {
          setTransactions((prev) => prev.filter((t) => t.id !== id));
          router.refresh();
        }
      } catch {
        alert("Failed to delete");
      }
    },
    [passcode, router]
  );

  const filtered = transactions.filter((t) => {
    if (filterType && t.type !== filterType) return false;
    if (filterCategory && t.categoryId !== filterCategory) return false;
    if (filterMember && t.teamMember !== filterMember) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "date") {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === "asc" ? diff : -diff;
    } else {
      const diff = Number(a.amount) - Number(b.amount);
      return sortDir === "asc" ? diff : -diff;
    }
  });

  function SortIcon({ field }: { field: "date" | "amount" }) {
    if (sortField !== field) {
      return (
        <span className="ml-1 text-nova-text/20">
          ↕
        </span>
      );
    }
    return (
      <span className="ml-1 text-nova-text/60">
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 text-sm bg-nova-card border border-nova-border rounded-lg focus:outline-none text-nova-text"
        >
          <option value="">All types</option>
          <option value="credit">Credits</option>
          <option value="debit">Debits</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 text-sm bg-nova-card border border-nova-border rounded-lg focus:outline-none text-nova-text"
        >
          <option value="">All categories</option>
          {initialCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filterMember}
          onChange={(e) => setFilterMember(e.target.value)}
          className="px-3 py-1.5 text-sm bg-nova-card border border-nova-border rounded-lg focus:outline-none text-nova-text"
        >
          <option value="">All members</option>
          {TEAM_MEMBERS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <span className="text-sm text-nova-text/40 ml-auto">
          {sorted.length} transaction{sorted.length !== 1 ? "s" : ""}
        </span>

        {isEditMode && (
          <button
            onClick={() => setShowAddRow((s) => !s)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-nova-text text-nova-background text-sm font-medium rounded-lg hover:bg-nova-text/90 transition-colors"
          >
            <span>{showAddRow ? "−" : "+"}</span>
            <span>{showAddRow ? "Cancel" : "Add Transaction"}</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-nova-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-nova-card border-b border-nova-border">
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-nova-text/50 uppercase tracking-wider cursor-pointer select-none"
                onClick={() => handleSort("date")}
              >
                Date <SortIcon field="date" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-nova-text/50 uppercase tracking-wider">
                Type
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-semibold text-nova-text/50 uppercase tracking-wider cursor-pointer select-none"
                onClick={() => handleSort("amount")}
              >
                Amount <SortIcon field="amount" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-nova-text/50 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-nova-text/50 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-nova-text/50 uppercase tracking-wider">
                Member
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-nova-text/50 uppercase tracking-wider">
                Mode
              </th>
              {isEditMode && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-nova-text/50 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {showAddRow && isEditMode && (
              <AddTransactionRow
                categories={initialCategories}
                passcode={passcode}
                onAdded={(t) => {
                  setTransactions((prev) => [t, ...prev]);
                  setShowAddRow(false);
                }}
              />
            )}

            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={isEditMode ? 8 : 7}
                  className="px-4 py-16 text-center text-nova-text/30 text-sm"
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              sorted.map((t) =>
                editingId === t.id ? (
                  <EditTransactionRow
                    key={t.id}
                    transaction={t}
                    categories={initialCategories}
                    passcode={passcode}
                    onSaved={(updated) => {
                      setTransactions((prev) =>
                        prev.map((x) => (x.id === updated.id ? updated : x))
                      );
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <tr
                    key={t.id}
                    className="border-b border-nova-border/60 hover:bg-nova-card/40 transition-colors"
                    style={{ height: "48px" }}
                  >
                    <td className="px-4 py-3 text-nova-text/70 whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                          t.type === "credit"
                            ? "bg-nova-credit/10 text-nova-credit"
                            : "bg-nova-debit/10 text-nova-debit"
                        )}
                      >
                        {t.type === "credit" ? "Credit" : "Debit"}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right numbers font-medium whitespace-nowrap",
                        t.type === "credit"
                          ? "text-nova-credit"
                          : "text-nova-debit"
                      )}
                    >
                      {t.type === "credit" ? "+" : "−"}
                      {formatINR(t.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs"
                        title={t.category.name}
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: t.category.color }}
                        />
                        {t.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-nova-text max-w-xs truncate">
                      {t.description}
                      {t.notes && (
                        <span className="ml-2 text-nova-text/40 text-xs">
                          ({t.notes})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-nova-text/70 whitespace-nowrap">
                      {t.teamMember}
                    </td>
                    <td className="px-4 py-3 text-nova-text/50 text-xs whitespace-nowrap">
                      {t.paymentMode || "—"}
                    </td>
                    {isEditMode && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingId(t.id)}
                            className="text-xs text-nova-text/50 hover:text-nova-text px-2 py-1 rounded border border-nova-border hover:border-nova-text/30 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-xs text-nova-debit/60 hover:text-nova-debit px-2 py-1 rounded border border-nova-border hover:border-nova-debit/30 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// cache bust Fri Jul 24 16:44:49 IST 2026
