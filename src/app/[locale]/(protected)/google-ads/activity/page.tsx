"use client";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { useAdAccounts, useMe } from "@/lib/api/hooks";

interface AuditEvent {
  id: number;
  occurredAt: string;
  actorKind: string;
  actorId: string | null;
  eventKind: string;
  proposalId: string | null;
  payload: Record<string, unknown>;
}

export default function ActivityPage() {
  const me = useMe();
  const customerId = me.data?.memberships[0]?.customerId;
  const accounts = useAdAccounts(customerId);
  const adAccountId = accounts.data?.adAccounts[0]?.id;

  const events = useQuery({
    queryKey: ["activity", adAccountId],
    enabled: !!adAccountId,
    queryFn: async (): Promise<{ events: AuditEvent[] }> => {
      const { data, error } = await api.GET(
        `/ad-accounts/${adAccountId}/activity?limit=200` as never,
      );
      if (error) throw new Error("failed to load activity");
      return data as { events: AuditEvent[] };
    },
    refetchInterval: 5000,
  });

  if (events.isLoading) return <div className="p-8">Loading…</div>;

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-semibold">Activity Log</h1>
      <div className="space-y-2">
        {(events.data?.events ?? []).map((e) => (
          <div
            key={e.id}
            className="bg-card flex items-baseline gap-3 rounded border p-3 text-sm"
          >
            <span className="text-muted-foreground font-mono text-xs">
              {new Date(e.occurredAt).toLocaleString()}
            </span>
            <span className="bg-muted rounded px-2 py-0.5 text-xs">
              {e.actorKind}
            </span>
            <span className="font-medium">{e.eventKind}</span>
            <span className="text-muted-foreground truncate text-xs">
              {JSON.stringify(e.payload)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
