import { notFound } from "next/navigation";
import { DataProvider } from "@/components/data-provider";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { isCampaignType } from "@/lib/constants";

export function generateStaticParams() {
  return [{ campaign: "alwayson" }, { campaign: "geolocalizadas" }];
}

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { campaign: string };
}) {
  if (!isCampaignType(params.campaign)) notFound();

  return (
    <DataProvider type={params.campaign}>
      <div className="min-h-screen ism-grid-bg">
        <Sidebar type={params.campaign} />
        <div className="lg:pl-[300px]">
          <main className="mx-auto max-w-[1400px] px-4 pb-12 sm:px-6">
            <Topbar />
            <div className="animate-fade-up">{children}</div>
          </main>
        </div>
      </div>
    </DataProvider>
  );
}
