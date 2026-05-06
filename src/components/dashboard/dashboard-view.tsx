"use client";
import { Link } from "@/i18n/navigation";
import { useAdAccounts, useDashboard, useMe } from "@/lib/api/hooks";

export function DashboardView() {
  const me = useMe();
  const customerId = me.data?.memberships[0]?.customerId;
  const accounts = useAdAccounts(customerId);
  const adAccountId = accounts.data?.adAccounts[0]?.id;
  const dash = useDashboard(adAccountId);

  if (me.isLoading) return <Skeleton />;
  if (!customerId)
    return (
      <div className="p-8">
        No customer membership. Ask an admin to add you to a customer.
      </div>
    );

  if (accounts.isLoading) return <Skeleton />;
  if (!adAccountId) {
    return (
      <Empty
        title="No Google Ads account connected"
        cta={{ href: "/google-ads", label: "Connect Google Ads" }}
      />
    );
  }

  if (dash.isLoading) return <Skeleton />;
  if (dash.error || !dash.data)
    return (
      <div className="text-destructive p-8">Failed to load dashboard.</div>
    );

  const c = dash.data.headlineCampaign;
  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Spend (30d)" value={`$${c.spendUsd.toLocaleString()}`} />
        <Kpi label="Clicks" value={c.clicks.toLocaleString()} />
        <Kpi label="Conversions" value={c.conversions.toLocaleString()} />
        <Kpi label="CPA" value={`$${c.cpa.toFixed(2)}`} />
      </div>

      {dash.data.pendingProposals > 0 ? (
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">
                {dash.data.pendingProposals} pending AI suggestion
                {dash.data.pendingProposals === 1 ? "" : "s"}
              </div>
              <div className="text-muted-foreground text-sm">
                Review and approve in the queue.
              </div>
            </div>
            <Link
              href="/google-ads/suggestions"
              className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm"
            >
              Review
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Empty({
  title,
  cta,
}: {
  title: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3">
      <div className="text-muted-foreground">{title}</div>
      <Link
        href={cta.href}
        className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm"
      >
        {cta.label}
      </Link>
    </div>
  );
}

function Skeleton() {
  return <div className="text-muted-foreground p-8">Loading…</div>;
}
