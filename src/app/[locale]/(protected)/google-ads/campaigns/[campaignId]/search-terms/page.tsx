"use client";
import { Fragment, use, useMemo, useState } from "react";

import { ProposalCard } from "@/components/proposals/proposal-card";
import { useAdAccounts, useMe, useSearchTerms } from "@/lib/api/hooks";
import { useProposals } from "@/lib/api/proposal-hooks";

export default function SearchTermsPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = use(params);
  const me = useMe();
  const customerId = me.data?.memberships[0]?.customerId;
  const accounts = useAdAccounts(customerId);
  const adAccountId = accounts.data?.adAccounts[0]?.id;

  const terms = useSearchTerms(adAccountId, campaignId);
  const proposals = useProposals(adAccountId, "proposed");

  const [openProposalId, setOpenProposalId] = useState<string | null>(null);

  const negProposalsByTerm = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of proposals.data?.proposals ?? []) {
      if (p.type !== "add_negative_keyword") continue;
      const term = (p.payload as { term?: string }).term;
      if (term) map.set(term, p.id);
    }
    return map;
  }, [proposals.data]);

  if (terms.isLoading) return <div className="p-8">Loading…</div>;

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-semibold">Search Terms</h1>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase">
            <tr>
              <th className="p-3">Term</th>
              <th className="p-3">Clicks</th>
              <th className="p-3">Cost</th>
              <th className="p-3">Conv.</th>
              <th className="p-3">AI</th>
            </tr>
          </thead>
          <tbody>
            {(terms.data?.rows ?? []).map((t) => {
              const proposalId = negProposalsByTerm.get(t.text);
              return (
                <Fragment key={t.id}>
                  <tr className="border-t">
                    <td className="p-3 font-medium">{t.text}</td>
                    <td className="p-3">{t.clicks}</td>
                    <td className="p-3">${t.cost.toFixed(2)}</td>
                    <td className="p-3">{t.conversions}</td>
                    <td className="p-3">
                      {proposalId ? (
                        <button
                          onClick={() =>
                            setOpenProposalId(
                              openProposalId === proposalId ? null : proposalId,
                            )
                          }
                          className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900"
                        >
                          AI suggests negative
                        </button>
                      ) : null}
                    </td>
                  </tr>
                  {openProposalId === proposalId && proposalId ? (
                    <tr>
                      <td colSpan={5} className="bg-muted/40 p-3">
                        {(() => {
                          const p = proposals.data?.proposals.find(
                            (x) => x.id === proposalId,
                          );
                          return p ? <ProposalCard proposal={p} /> : null;
                        })()}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
