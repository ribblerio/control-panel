import { BellIcon } from "../assets/icons/BellIcon";
import { DashboardIcon } from "../assets/icons/DashboardIcon";
import { EcommerceIcon } from "../assets/icons/EcommerceIcon";
import { HistoryIcon } from "../assets/icons/HistoryIcon";
import { SettingsIcon } from "../assets/icons/SettingsIcon";
import type { MenuConfigEntry } from "../components/layout/sideMenu/types";

/**
 * Central navigation config used by SideMenu, SideMenuMobile and search input.
 *
 * Ribbler IA: Dashboard at top, then per-platform groups. For MVP only the
 * Google Ads platform is wired; future platforms (Meta, TikTok, etc.) plug in
 * as additional category + item blocks.
 */
export const menuConfig: MenuConfigEntry[] = [
  { type: "category", titleKey: "main" },
  {
    type: "item",
    titleKey: "dashboard",
    Icon: DashboardIcon,
    path: "/",
  },
  { type: "category", titleKey: "googleAds" },
  {
    type: "item",
    titleKey: "aiSuggestions",
    Icon: BellIcon,
    path: "/google-ads/suggestions",
  },
  {
    type: "item",
    titleKey: "campaigns",
    Icon: EcommerceIcon,
    path: "/google-ads/campaigns",
  },
  {
    type: "item",
    titleKey: "aiPermissions",
    Icon: SettingsIcon,
    path: "/google-ads/permissions",
  },
  {
    type: "item",
    titleKey: "activityLog",
    Icon: HistoryIcon,
    path: "/google-ads/activity",
  },
];
