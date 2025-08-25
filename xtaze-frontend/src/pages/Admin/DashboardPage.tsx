""

import { useEffect, useState } from "react"
import { Card } from "../../components/ui/card"
import { MetricsCard } from "./adminComponents/metrics-card"
import { StatsChart } from "./adminComponents/stats-chart"
import { PopularTracks } from "./adminComponents/popular-tracks"
import { PopularArtists } from "./adminComponents/popular-artists"
import "../../styles/zashboard.css"
import Sidebar from "./adminComponents/aside-side"
import { fetchArtists, fetchSubscriptionHistory, listActiveArtists } from "../../services/adminService"

interface Subscription {
  email: string;
  planName: string;
  price: number;
}

export default function Page() {
    // const [history, setHistory] = useState<Subscription[]>([]);
    const [totalArtists, setTotalArtists] = useState<number>(0);
    const [totalRevenue, setTotalRevenue] = useState<number>(0);

    useEffect(() => {
      const fetchSubscription = async () => {
        try {
          const response =await fetchSubscriptionHistory();
          const subscriptions: Subscription[] = response;
          
          const validSubscriptions = subscriptions.filter(sub => sub.email && sub.planName);
          
          const revenue = validSubscriptions.reduce((sum, sub) => sum + sub.price, 0);
          setTotalRevenue(revenue);
          // setHistory(validSubscriptions);
        } catch (err) {
          console.error("Error fetching subscription history:", err);
        }
      };

      
      const fetchTotalArtists = async () => {
        try {
          const artists = await listActiveArtists();
          // Count valid artists (those with role === "artist" and active)
          const artistCount = artists.data.filter(artist => artist.role === "artist" && artist.isActive).length;
          setTotalArtists(artistCount);
        } catch (err) {
          console.error("Error fetching total artists:", err);
        }
      };

      fetchSubscription();
      fetchTotalArtists();
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="flex">
                {/* Sidebar */}
                <Sidebar />

                {/* Main content */}
                <main className="flex-1 p-6 lg:ml-64">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex-1 flex justify-end text-right">
                            <div>
                                <h1 className="text-2xl font-bold">Dashboard</h1>
                                <div className="text-sm text-muted-foreground">Welcome back, Admin</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <MetricsCard
                            title="Total Artists"
                            value={totalArtists.toString()}
                        />
                        <MetricsCard
                            title="Total Revenue"
                            value={`$${totalRevenue.toFixed(2)}`}
                        />
                    </div>

                    <Card className="mt-6 p-6">
                        <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold">Listening Statistics</h2>
                        </div>
                        <StatsChart />
                    </Card>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <Card className="p-6">
                            <h2 className="mb-4 text-lg font-semibold">Popular Tracks</h2>
                            <PopularTracks />
                        </Card>
                        <Card className="p-6">
                            <h2 className="mb-4 text-lg font-semibold">Popular Artists</h2>
                            <PopularArtists />
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
