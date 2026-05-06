"use client";
import { useQuery } from "@tanstack/react-query";

import { api } from "./client";

interface Membership {
  customerId: string;
  role: "admin" | "approver";
}
interface MeResponse {
  user: { id: string; email: string; role: string };
  memberships: Membership[];
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async (): Promise<MeResponse> => {
      // openapi-fetch typing is loose because the spec response is { '200': { description: 'ok' } }.
      // Cast at the boundary.
      const { data, error } = await api.GET("/me" as never);
      if (error) throw new Error("failed to load /me");
      return data as MeResponse;
    },
  });
}

interface AdAccount {
  id: string;
  displayName: string;
  provider: string;
  backend: string;
}

export function useAdAccounts(customerId: string | undefined) {
  return useQuery({
    queryKey: ["ad-accounts", customerId],
    enabled: !!customerId,
    queryFn: async (): Promise<{ adAccounts: AdAccount[] }> => {
      const { data, error } = await api.GET(
        `/customers/${customerId}/ad-accounts` as never,
      );
      if (error) throw new Error("failed to load ad accounts");
      return data as { adAccounts: AdAccount[] };
    },
  });
}

interface DashboardData {
  pendingProposals: number;
  headlineCampaign: {
    name: string;
    status: "enabled" | "paused";
    spendUsd: number;
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    cpa: number;
  };
}

export function useDashboard(adAccountId: string | undefined) {
  return useQuery({
    queryKey: ["dashboard", adAccountId],
    enabled: !!adAccountId,
    queryFn: async (): Promise<DashboardData> => {
      const { data, error } = await api.GET(
        `/ad-accounts/${adAccountId}/dashboard` as never,
      );
      if (error) throw new Error("failed to load dashboard");
      return data as DashboardData;
    },
  });
}

export interface CampaignOverview {
  campaignId: string;
  name: string;
  status: "enabled" | "paused";
  spendUsd: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cpa: number;
}

export function useCampaigns(adAccountId: string | undefined) {
  return useQuery({
    queryKey: ["campaigns", adAccountId],
    enabled: !!adAccountId,
    queryFn: async (): Promise<{ campaigns: CampaignOverview[] }> => {
      const { data, error } = await api.GET(
        `/ad-accounts/${adAccountId}/campaigns` as never,
      );
      if (error) throw new Error("failed to load campaigns");
      return data as { campaigns: CampaignOverview[] };
    },
  });
}

export function useCampaign(
  adAccountId: string | undefined,
  campaignId: string,
) {
  return useQuery({
    queryKey: ["campaign", adAccountId, campaignId],
    enabled: !!adAccountId,
    queryFn: async (): Promise<CampaignOverview> => {
      const { data, error } = await api.GET(
        `/ad-accounts/${adAccountId}/campaigns/${campaignId}` as never,
      );
      if (error) throw new Error("failed to load campaign");
      return data as CampaignOverview;
    },
  });
}

export interface SearchTerm {
  id: string;
  text: string;
  adGroupId: string;
  matchedKeywordId: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
}

export function useSearchTerms(
  adAccountId: string | undefined,
  campaignId: string,
) {
  return useQuery({
    queryKey: ["search-terms", adAccountId, campaignId],
    enabled: !!adAccountId,
    queryFn: async (): Promise<{ rows: SearchTerm[] }> => {
      const { data, error } = await api.GET(
        `/ad-accounts/${adAccountId}/campaigns/${campaignId}/search-terms` as never,
      );
      if (error) throw new Error("failed to load search terms");
      return data as { rows: SearchTerm[] };
    },
  });
}
