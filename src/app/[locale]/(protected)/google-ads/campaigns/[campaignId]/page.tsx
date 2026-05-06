"use client";
import { use } from "react";

import { Link, usePathname } from "@/i18n/navigation";
import { useAdAccounts, useCampaign, useMe } from "@/lib/api/hooks";

export default function CampaignOverviewPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = use(params);
  const me = useMe();
  const customerId = me.data?.memberships[0]?.customerId;
  const accounts = useAdAccounts(customerId);
  const adAccountId = accounts.data?.adAccounts[0]?.id;
  const campaign = useCampaign(adAccountId, campaignId);

  if (campaign.isLoading || !campaign.data)
    return <div className="p-8">Loading…</div>;
  const c = campaign.data;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">{c.name}</h1>
      <Tabs campaignId={campaignId} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Spend" value={`$${c.spendUsd.toLocaleString()}`} />
        <Kpi label="Impressions" value={c.impressions.toLocaleString()} />
        <Kpi label="CTR" value={`${(c.ctr * 100).toFixed(2)}%`} />
        <Kpi label="Conversions" value={c.conversions.toString()} />
      </div>
    </div>
  );
}

function Tabs({ campaignId }: { campaignId: string }) {
  const path = usePathname();
  const tabs = [
    { href: `/google-ads/campaigns/${campaignId}`, label: "Overview" },
    {
      href: `/google-ads/campaigns/${campaignId}/search-terms`,
      label: "Search Terms",
    },
  ];
  return (
    <div className="my-4 flex gap-1 border-b">
      {tabs.map((t) => {
        const active = path === t.href;
        return (
          <Link key={t.href} href={t.href} className={tabClass(active)}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

function tabClass(active: boolean) {
  return [
    "rounded-t-md px-3 py-1.5 text-sm",
    active
      ? "border border-b-transparent bg-card font-medium"
      : "text-muted-foreground hover:bg-muted",
  ].join(" ");
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
