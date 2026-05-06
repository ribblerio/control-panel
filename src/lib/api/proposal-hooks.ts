"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./client";

export interface Proposal {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  reasoning: string;
  evidence: Record<string, unknown>;
  confidence: string | null;
  status: string;
  createdAt: string;
  decidedAt: string | null;
  executedAt: string | null;
  executionResult: {
    simulated?: boolean;
    diff?: { summary: string };
  } | null;
}

export function useProposals(adAccountId: string | undefined, status?: string) {
  const qs = status ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["proposals", adAccountId, status],
    enabled: !!adAccountId,
    queryFn: async (): Promise<{ proposals: Proposal[] }> => {
      const { data, error } = await api.GET(
        `/ad-accounts/${adAccountId}/proposals${qs}` as never,
      );
      if (error) throw new Error("failed to load proposals");
      return data as { proposals: Proposal[] };
    },
  });
}

export function useApproveProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.POST(
        `/proposals/${id}/approve` as never,
        { body: {} } as never,
      );
      if (error) throw new Error("approve failed");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRejectProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) => {
      const { data, error } = await api.POST(
        `/proposals/${id}/reject` as never,
        { body: { note } } as never,
      );
      if (error) throw new Error("reject failed");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["proposals"] }),
  });
}
