import fs from "fs";
import path from "path";

import type { AnalyticsViewProps } from "../components/views/analytics/types";
import type { CalendarEvent } from "../components/views/calendar/types";
import type { Customer } from "../components/views/customers/types";
import type { HomepageViewProps } from "../components/views/homepage/types";
import type { OrderType } from "../components/views/orders/types";
import type { Product } from "../components/views/products/types";

interface PageDataMap {
  orders: OrderType[];
  customers: Customer[];
  products: Product[];
  events: CalendarEvent[];
  analytics: AnalyticsViewProps["analyticsData"];
  homepage: HomepageViewProps["homepageData"];
}

type PageName = keyof PageDataMap;

/**
 * Retrieves mock data from backendBackup.json. Demo-data path used by all
 * inherited nellavio pages. Phase 5 will replace consumers with TanStack
 * Query against core-module's REST API; until then this stub keeps the
 * inherited pages building without Apollo.
 *
 * TODO(phase-5): wire to TanStack Query against core-module.
 */
const getBackupData = <T extends PageName>(pageName: T): PageDataMap[T] => {
  const backupFilePath = path.join(
    process.cwd(),
    "public",
    "backendBackup.json",
  );

  const raw = fs.readFileSync(backupFilePath, "utf-8");
  const allData = JSON.parse(raw) as PageDataMap;

  return allData[pageName];
};

/**
 * Fetches page data. After removing Apollo (Phase 4) this always reads
 * the bundled backup JSON. Real data flows for Ribbler are added page-by-page
 * in Phase 5 via TanStack Query + the openapi-fetch client.
 */
export const getData = async <T extends PageName>(
  pageName: T,
): Promise<PageDataMap[T]> => {
  return getBackupData(pageName);
};
