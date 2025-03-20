import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { MetricsCard } from "../Admin/adminComponents/metrics-card";
import { DemographicsChart } from "./artistComponents/demographics-chart";
import { MonthlyListenersChart } from "./artistComponents/monthly-listeners-chart";
import { TopSongsTable } from "./artistComponents/top-songs-table";
import ArtistSidebar from "./artistComponents/artist-aside";

const ArtistDashboard = () => {


  useEffect(() => {
    const styles = `
      body, * {
        background-color: var(--background) !important; /* Dark background */
      }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet); // Cleanup on unmount
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid lg:grid-cols-[280px_1fr]">
        {/* Sidebar Component */}
        <ArtistSidebar />

        <main className="flex-1 pl-0.4 pr-6 pt-5 pb-6">
        <div className="mb-6 flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Artist Dashboard</h1>
              <div className="text-sm text-muted-foreground">Last 30 days overview</div>
            </div>
            <Button variant="outline" className="gap-2">
              This Month
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricsCard
              title="Monthly Listeners"
              value="0"
            />
            <MetricsCard
              title="Total Streams"
              value="0"
            />
            <MetricsCard
              title="Total Earnings"
              value="$0"
            />
          </div>
          <Card className="mt-6 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Monthly Listeners</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  30 days
                </Button>
                <Button size="sm" variant="ghost">
                  3 months
                </Button>
                <Button size="sm" variant="ghost">
                  6 months
                </Button>
                <Button size="sm" variant="ghost">
                  Year
                </Button>
              </div>
            </div>
            <MonthlyListenersChart />
          </Card>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Listener Demographics</h2>
              <DemographicsChart />
            </Card>
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Top Songs</h2>
              <TopSongsTable />
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArtistDashboard;
