"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { useAdAccounts, useMe } from "@/lib/api/hooks";

interface ToolPerm {
  name: string;
  description: string;
  catalogueId: number | undefined;
  defaultPermission: "allow" | "approve" | "deny";
  effectivePermission: "allow" | "approve" | "deny";
  effectiveBackend: "mock" | "sandbox" | "live" | null;
}

export default function PermissionsPage() {
  const me = useMe();
  const customerId = me.data?.memberships[0]?.customerId;
  const accounts = useAdAccounts(customerId);
  const adAccountId = accounts.data?.adAccounts[0]?.id;

  const qc = useQueryClient();
  const perms = useQuery({
    queryKey: ["tool-permissions", adAccountId],
    enabled: !!adAccountId,
    queryFn: async (): Promise<{ categories: Record<string, ToolPerm[]> }> => {
      const { data, error } = await api.GET(
        `/ad-accounts/${adAccountId}/tool-permissions` as never,
      );
      if (error) throw new Error("failed to load permissions");
      return data as { categories: Record<string, ToolPerm[]> };
    },
  });

  const update = useMutation({
    mutationFn: async (body: {
      toolName: string;
      permission?: "allow" | "approve" | "deny" | null;
      backend?: "mock" | "sandbox" | "live" | null;
    }) => {
      const { error } = await api.PATCH(
        `/ad-accounts/${adAccountId}/tool-permissions` as never,
        { body } as never,
      );
      if (error) throw new Error("update failed");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tool-permissions"] }),
  });

  if (perms.isLoading) return <div className="p-8">Loading…</div>;

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-semibold">AI Permissions</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        For each AI capability, choose whether it runs immediately, queues for
        human approval, or is blocked.
      </p>

      <div className="space-y-6">
        {Object.entries(perms.data?.categories ?? {}).map(([cat, tools]) => (
          <div key={cat}>
            <h2 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
              {cat.replace("_", " ")}
            </h2>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left text-xs uppercase">
                  <tr>
                    <th className="p-3">Tool</th>
                    <th className="p-3">Permission</th>
                  </tr>
                </thead>
                <tbody>
                  {tools.map((t) => (
                    <tr key={t.name} className="border-t">
                      <td className="p-3">
                        <div className="font-medium">{t.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {t.description}
                        </div>
                      </td>
                      <td className="p-3">
                        <select
                          value={t.effectivePermission}
                          onChange={(e) =>
                            update.mutate({
                              toolName: t.name,
                              permission: e.target.value as
                                | "allow"
                                | "approve"
                                | "deny",
                            })
                          }
                          className="rounded-md border px-2 py-1"
                        >
                          <option value="allow">Allow (run immediately)</option>
                          <option value="approve">
                            Approve (queue for human)
                          </option>
                          <option value="deny">Deny</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
