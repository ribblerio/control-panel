"use client";
import { Link } from "@/i18n/navigation";
import { useAdAccounts, useCampaigns, useMe } from "@/lib/api/hooks";

export default function CampaignsPage() {
  const me = useMe();
  const customerId = me.data?.memberships[0]?.customerId;
  const accounts = useAdAccounts(customerId);
  const adAccountId = accounts.data?.adAccounts[0]?.id;
  const campaigns = useCampaigns(adAccountId);

  if (campaigns.isLoading) return <div className="p-8">Loading…</div>;

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-semibold">Campaigns</h1>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Status</th>
              <th className="p-3">Spend</th>
              <th className="p-3">Conv.</th>
              <th className="p-3">CPA</th>
            </tr>
          </thead>
          <tbody>
            {(campaigns.data?.campaigns ?? []).map((c) => (
              <tr key={c.campaignId} className="border-t">
                <td className="p-3">
                  <Link
                    href={`/google-ads/campaigns/${c.campaignId}`}
                    className="font-medium underline"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="p-3">{c.status}</td>
                <td className="p-3">${c.spendUsd.toLocaleString()}</td>
                <td className="p-3">{c.conversions}</td>
                <td className="p-3">${c.cpa.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
