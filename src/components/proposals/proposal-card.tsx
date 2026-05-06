"use client";
import { useState } from "react";

import type { Proposal } from "@/lib/api/proposal-hooks";
import {
  useApproveProposal,
  useRejectProposal,
} from "@/lib/api/proposal-hooks";

const TYPE_LABEL: Record<string, string> = {
  add_negative_keyword: "Add negative keyword",
  add_keyword: "Add new keyword",
  set_geo_bid_modifier: "Adjust location bid",
};

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  const [open, setOpen] = useState<"evidence" | "payload" | null>(null);
  const approve = useApproveProposal();
  const reject = useRejectProposal();

  const isPending = proposal.status === "proposed";
  const isExecuted = proposal.status === "executed";

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-secondary rounded-full px-2 py-0.5 text-xs">
            {TYPE_LABEL[proposal.type] ?? proposal.type}
          </span>
          <span className="text-muted-foreground text-xs">
            {new Date(proposal.createdAt).toLocaleString()}
          </span>
          {proposal.confidence ? (
            <span className="text-muted-foreground text-xs">
              conf {Number(proposal.confidence).toFixed(2)}
            </span>
          ) : null}
        </div>
        <StatusBadge status={proposal.status} />
      </div>

      <p className="mt-2 text-sm">{proposal.reasoning}</p>

      <div className="mt-3 flex gap-2 text-xs">
        <button
          onClick={() => setOpen(open === "evidence" ? null : "evidence")}
          className="underline"
        >
          Evidence
        </button>
        <button
          onClick={() => setOpen(open === "payload" ? null : "payload")}
          className="underline"
        >
          Raw mutation
        </button>
      </div>

      {open === "evidence" ? (
        <pre className="bg-muted mt-2 max-h-48 overflow-auto rounded p-2 text-xs">
          {JSON.stringify(proposal.evidence, null, 2)}
        </pre>
      ) : null}
      {open === "payload" ? (
        <pre className="bg-muted mt-2 max-h-48 overflow-auto rounded p-2 text-xs">
          {JSON.stringify(proposal.payload, null, 2)}
        </pre>
      ) : null}

      {isExecuted && proposal.executionResult?.diff ? (
        <div className="mt-3 rounded bg-emerald-50 p-2 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          <div className="font-medium">Executed (simulated)</div>
          <div className="text-xs">{proposal.executionResult.diff.summary}</div>
        </div>
      ) : null}

      {isPending ? (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => approve.mutate(proposal.id)}
            disabled={approve.isPending}
            className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm disabled:opacity-60"
          >
            Approve
          </button>
          <button
            onClick={() => reject.mutate({ id: proposal.id })}
            disabled={reject.isPending}
            className="hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
          >
            Reject
          </button>
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "proposed"
      ? "bg-amber-100 text-amber-900"
      : status === "approved"
        ? "bg-blue-100 text-blue-900"
        : status === "executed"
          ? "bg-emerald-100 text-emerald-900"
          : status === "rejected"
            ? "bg-zinc-200 text-zinc-700"
            : status === "failed"
              ? "bg-red-100 text-red-900"
              : "bg-secondary";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${tone}`}>{status}</span>
  );
}
