import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { PageWrapper } from "@/components/common/PageWrapper";
import { DashboardView } from "@/components/dashboard/dashboard-view";

const Home = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageWrapper pageName="Dashboard">
      <DashboardView />
    </PageWrapper>
  );
};

export const metadata: Metadata = {
  title: { absolute: "Ribbler" },
};

export default Home;
