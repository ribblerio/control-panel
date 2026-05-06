"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ProposalCard } from "@/components/proposals/proposal-card";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import { useAdAccounts, useMe } from "@/lib/api/hooks";
import { useProposals } from "@/lib/api/proposal-hooks";

export default function SuggestionsPage() {
  const me = useMe();
  const customerId = me.data?.memberships[0]?.customerId;
  const accounts = useAdAccounts(customerId);
  const adAccountId = accounts.data?.adAccounts[0]?.id;
  const [statusFilter, setStatusFilter] = useState<"proposed" | "all">(
    "proposed",
  );
  const proposals = useProposals(
    adAccountId,
    statusFilter === "proposed" ? "proposed" : undefined,
  );

  const qc = useQueryClient();
  const runAnalysis = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.POST(
        `/ad-accounts/${adAccountId}/run-analysis` as never,
        { body: {} } as never,
      );
      if (error) throw new Error("failed to start analysis");
      return data;
    },
    onSuccess: () => {
      [1, 5, 15, 30, 60].forEach((s) =>
        setTimeout(
          () => qc.invalidateQueries({ queryKey: ["proposals"] }),
          s * 1000,
        ),
      );
    },
  });

  if (!adAccountId) {
    return (
      <div className="text-muted-foreground p-8">
        No account connected.{" "}
        <Link className="underline" href="/google-ads">
          Connect.
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">AI Suggestions</h1>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "proposed" | "all")
            }
            className="rounded-md border px-2 py-1 text-sm"
          >
            <option value="proposed">Pending</option>
            <option value="all">All</option>
          </select>
          <button
            onClick={() => runAnalysis.mutate()}
            disabled={runAnalysis.isPending}
            className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm disabled:opacity-60"
          >
            {runAnalysis.isPending ? "Starting…" : "Run analysis"}
          </button>
        </div>
      </div>

      {proposals.isLoading ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : (proposals.data?.proposals ?? []).length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">
          No suggestions yet. Click &ldquo;Run analysis&rdquo; to have the AI
          scan the account.
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.data?.proposals.map((p) => (
            <ProposalCard key={p.id} proposal={p} />
          ))}
        </div>
      )}
    </div>
  );
}
