"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import { useAdAccounts, useMe } from "@/lib/api/hooks";

export default function GoogleAdsLandingPage() {
  const me = useMe();
  const customerId = me.data?.memberships[0]?.customerId;
  const accounts = useAdAccounts(customerId);
  const router = useRouter();
  const qc = useQueryClient();

  const connect = useMutation({
    mutationFn: async () => {
      if (!customerId) throw new Error("no customer");
      const { data, error } = await api.POST(
        `/customers/${customerId}/ad-accounts/connect-mock` as never,
        {
          body: { displayName: "Acme Plumbing — Google Ads (mock)" },
        } as never,
      );
      if (error) throw new Error("failed to connect");
      return data as { id: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ad-accounts"] });
      router.push("/google-ads/suggestions");
    },
  });

  useEffect(() => {
    if ((accounts.data?.adAccounts.length ?? 0) > 0) {
      router.replace("/google-ads/suggestions");
    }
  }, [accounts.data, router]);

  if (accounts.isLoading)
    return <div className="text-muted-foreground p-8">Loading…</div>;
  if ((accounts.data?.adAccounts.length ?? 0) > 0) return null;

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Connect Google Ads</h1>
      <p className="text-muted-foreground max-w-md text-center">
        Ribbler will analyze your campaigns and propose optimizations. You
        approve everything before anything is changed. For this demo, no real
        Google account is needed — we use synthetic data.
      </p>
      <button
        onClick={() => connect.mutate()}
        disabled={connect.isPending}
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm disabled:opacity-60"
      >
        {connect.isPending ? "Connecting…" : "Add demo account"}
      </button>
      {connect.error ? (
        <div className="text-destructive text-sm">{connect.error.message}</div>
      ) : null}
    </div>
  );
}
