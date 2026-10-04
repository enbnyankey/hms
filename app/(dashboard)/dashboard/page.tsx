import DashboardHeader from "@/components/DashboardHeader";
import KpiGrid from "@/components/KpiGrid";
import TriageFeed from "@/components/TriageFeed";
import WardBedCensus from "@/components/WardBedCensus";
import RevenueChannels from "@/components/RevenueChannels";
import OutpatientSuite from "@/components/OutpatientSuite";
import LiveAlerts from "@/components/LiveAlerts";

export default function ExecutiveDashboardPage() {
  return (
    <div>
      <DashboardHeader />
      <KpiGrid />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 items-stretch">
        <div className="lg:col-span-2 h-full">
          <TriageFeed />
        </div>
        <div className="space-y-3">
          <WardBedCensus />
          <RevenueChannels />
        </div>
      </div>

      <div className="mt-5">
        <OutpatientSuite />
      </div>

      <div className="mt-5">
        <LiveAlerts />
      </div>
    </div>
  );
}
