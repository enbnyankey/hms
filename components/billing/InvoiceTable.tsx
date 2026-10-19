"use client";

import { useMemo, useState } from "react";
import { Search, X, Eye, Wallet, Trash2, Flag, Inbox } from "lucide-react";
import Table, { type TableColumn } from "@/components/ui/Table";
import {
  invoiceFilters,
  formatGHS,
  type Invoice,
  type InvoiceStatus,
  type InvoiceFilterId,
} from "@/lib/billing-data";

const statusStyle: Record<InvoiceStatus, string> = {
  "Partial Paid": "bg-status-blue-bg text-status-blue",
  Adjudicating: "bg-status-amber-bg text-status-amber",
  Unpaid: "bg-status-red-bg text-status-red",
  "Paid in Full": "bg-status-green-bg text-status-green",
  Cleared: "bg-status-green-bg text-status-green",
  Rejected: "bg-status-orange-bg text-status-orange",
  Void: "bg-slate-100 text-slate-500",
};

const PAGE_SIZE = 3;

function isNhisClaim(scheme: string) {
  return scheme.toLowerCase().includes("nhis");
}

function matchesFilter(inv: Invoice, filter: InvoiceFilterId) {
  switch (filter) {
    case "all":
      return true;
    case "pending":
      return inv.balance > 0 && inv.status !== "Void";
    case "inpatient":
      return inv.category === "Inpatient";
    case "nhis":
      return isNhisClaim(inv.scheme);
  }
}

export default function InvoiceTable({
  invoices,
  onView,
  onPay,
  onVoid,
  onReject,
}: {
  invoices: Invoice[];
  onView: (id: string) => void;
  onPay: (id: string) => void;
  onVoid: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<InvoiceFilterId>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filterCounts = useMemo(() => {
    const counts: Record<InvoiceFilterId, number> = { all: 0, pending: 0, inpatient: 0, nhis: 0 };
    for (const id of Object.keys(counts) as InvoiceFilterId[]) {
      counts[id] = invoices.filter((inv) => matchesFilter(inv, id)).length;
    }
    return counts;
  }, [invoices]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (!matchesFilter(inv, activeFilter)) return false;
      if (!query) return true;
      return (
        inv.patient.toLowerCase().includes(query) ||
        inv.id.toLowerCase().includes(query) ||
        inv.mrn.toLowerCase().includes(query)
      );
    });
  }, [invoices, activeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageInvoices = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const invoiceColumns: TableColumn<Invoice>[] = [
    {
      key: "invoice",
      header: "Invoice & Patient",
      headerClassName: "px-5 pb-2 pt-3 font-semibold",
      cellClassName: "px-5 py-3",
      render: (inv) => (
        <>
          <p className="font-mono text-[11px] font-semibold text-brand-cyan">{inv.id}</p>
          <p className="font-semibold text-slate-800">{inv.patient}</p>
          <p className="text-[11px] text-slate-400">{inv.mrn}</p>
        </>
      ),
    },
    {
      key: "encounter",
      header: "Encounter / Scheme",
      headerClassName: "pb-2 pt-3 font-semibold",
      cellClassName: "py-3 pr-3",
      render: (inv) => (
        <>
          <p className="font-medium text-slate-700">{inv.encounter}</p>
          <p className="text-[11px] text-brand-cyan">{inv.scheme}</p>
        </>
      ),
    },
    {
      key: "total",
      header: "Total (GHS)",
      headerClassName: "pb-2 pt-3 text-right font-semibold",
      cellClassName: "py-3 pr-3 text-right font-mono font-semibold text-slate-700",
      align: "right",
      render: (inv) => formatGHS(inv.total),
    },
    {
      key: "insurance",
      header: "Insurance",
      headerClassName: "pb-2 pt-3 text-right font-semibold",
      cellClassName: "py-3 pr-3 text-right font-mono text-slate-500",
      align: "right",
      render: (inv) => formatGHS(inv.insurance),
    },
    {
      key: "balance",
      header: "Balance Due",
      headerClassName: "pb-2 pt-3 text-right font-semibold",
      cellClassName: "py-3 pr-3 text-right font-mono font-bold",
      align: "right",
      render: (inv) => (
        <span className={inv.balance === 0 ? "text-slate-400" : "text-status-red"}>{formatGHS(inv.balance)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      headerClassName: "pb-2 pt-3 text-right font-semibold",
      cellClassName: "py-3 pr-3 text-right",
      align: "right",
      render: (inv) => (
        <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[inv.status]}`}>
          {inv.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "px-5 pb-2 pt-3 text-right font-semibold",
      cellClassName: "px-5 py-3",
      align: "right",
      render: (inv) => {
        const voided = inv.status === "Void";
        const canReject = isNhisClaim(inv.scheme) && (inv.status === "Adjudicating" || inv.status === "Partial Paid");

        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              title="View invoice"
              onClick={() => onView(inv.id)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            {!voided && inv.balance > 0 && (
              <button
                type="button"
                title="Record payment"
                onClick={() => onPay(inv.id)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-brand-teal hover:bg-teal-50"
              >
                <Wallet className="h-3.5 w-3.5" />
              </button>
            )}
            {!voided && canReject && (
              <button
                type="button"
                title="Reject claim"
                onClick={() => onReject(inv.id)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-status-amber hover:bg-status-amber-bg"
              >
                <Flag className="h-3.5 w-3.5" />
              </button>
            )}
            {!voided && (
              <button
                type="button"
                title="Void invoice"
                onClick={() => onVoid(inv.id)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-status-red hover:bg-status-red-bg"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  function handleFilterClick(id: InvoiceFilterId) {
    setActiveFilter(id);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="rounded-xl border max-h-150 border-surface-border bg-white shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-surface-border px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Active Patient Invoices</h2>
          <p className="text-[11px] text-slate-400">
            Clinical service charge ledgers, co-pays, and discharge accounts
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md bg-slate-100 p-1">
          {invoiceFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => handleFilterClick(f.id)}
              aria-pressed={activeFilter === f.id}
              className={`rounded px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                activeFilter === f.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f.label} ({filterCounts[f.id]})
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-surface-border px-5 py-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by patient, invoice ID, or MRN…"
            className="w-full rounded-md border border-surface-border py-1.5 pl-8 pr-2.5 text-xs text-slate-700 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
        {search && (
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="flex items-center gap-1 rounded-md border border-surface-border px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <Table<Invoice>
          columns={invoiceColumns}
          data={pageInvoices}
          getRowKey={(inv) => inv.id}
          tableClassName="min-w-[820px]"
          bodyClassName="divide-y divide-surface-border"
          rowClassName={(inv) => `align-top hover:bg-slate-50 ${inv.status === "Void" ? "opacity-60" : ""}`}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
          <Inbox className="h-6 w-6 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">No invoices match this view</p>
          <p className="max-w-xs text-[11px] text-slate-400">
            Try a different filter or clear your search to see more billing encounters.
          </p>
          {(search || activeFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveFilter("all");
                setPage(1);
              }}
              className="mt-1 rounded-md border border-surface-border px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-surface-border px-5 py-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            {filtered.length === 0
              ? "Showing 0 of 0 billing encounters"
              : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length} billing encounters`}
          </span>
          <span className="flex items-center gap-1 font-semibold text-status-green">
            <span className="h-1.5 w-1.5 rounded-full bg-status-green" />
            Cashier Desk #04 Active
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-surface-border px-2.5 py-1 font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`rounded-md px-2.5 py-1 font-semibold ${
                n === currentPage ? "bg-brand-cyan text-white" : "border border-surface-border hover:bg-slate-50"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-md border border-surface-border px-2.5 py-1 font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
