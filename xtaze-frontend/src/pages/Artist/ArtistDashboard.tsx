import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { MetricsCard } from "../Admin/adminComponents/metrics-card";
import { DemographicsChart } from "./artistComponents/demographics-chart";
import { MonthlyListenersChart } from "./artistComponents/monthly-listeners-chart";
import { TopSongsTable } from "./artistComponents/top-songs-table";
import ArtistSidebar from "./artistComponents/artist-aside";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { fetchArtistTracks } from "../../services/adminService";

interface PlayHistory {
  month: string;
  plays: number;
}



const ArtistDashboard = () => {
  const [mostListenedSong, setMostListenedSong] = useState("None");
  const [totalSongs, setTotalSongs] = useState("0");
  const user = useSelector((state: RootState) => state.artist.signupData);

  useEffect(() => {
    const fetchMetrics = async () => {
      const token = localStorage.getItem("artistToken");

      if (!token || !user?._id) {
        console.error("Token or User ID not found. Please login.");
        setMostListenedSong("None");
        setTotalSongs("0");
        return;
      }

      try {
        const tracks = await fetchArtistTracks(user._id, token);
        console.log("Tracks for Metrics:", tracks);

        if (!tracks || tracks.length === 0) {
          setMostListenedSong("None");
          setTotalSongs("0");
          return;
        }

        // Calculate Total Number of Songs
        const totalSongsCount = tracks.length;
        setTotalSongs(totalSongsCount.toLocaleString());

        // Calculate Most Listened Song (based on total plays)
        let maxPlays = 0;
        let mostListened = "None";
        tracks.forEach((track) => {
          const trackPlays = track.playHistory.reduce(
            (sum: number, entry: PlayHistory) => sum + entry.plays,
            0
          );
          if (trackPlays > maxPlays) {
            maxPlays = trackPlays;
            mostListened = track.title;
          }
        });
        setMostListenedSong(mostListened);
      } catch (error) {
        console.error("Error fetching metrics:", error);
        setMostListenedSong("None");
        setTotalSongs("0");
      }
    };

    fetchMetrics();
  }, [user?._id]);

  // useEffect(() => {
  //   const styles = `
  //     body, * {
  //       background-color: var(--background) !important; /* Dark background */
  //     }
  //   `;
  //   const styleSheet = document.createElement("style");
  //   styleSheet.type = "text/css";
  //   styleSheet.innerText = styles;
  //   document.head.appendChild(styleSheet);

  //   return () => {
  //     document.head.removeChild(styleSheet); // Cleanup on unmount
  //   };
  // }, []);

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
            <MetricsCard title="Most Listened Song" value={mostListenedSong} />
            <MetricsCard title="Total Number of Songs" value={totalSongs} />
          </div>
          <Card className="mt-6 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Monthly Listeners</h2>
            </div>
            <MonthlyListenersChart />
          </Card>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card className="p-6 ">
              <DemographicsChart />
            </Card>
            <Card className="p-6">
              <h1 className="mb-4 text-2xl font-semibold">Top Songs</h1>
              <TopSongsTable />
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArtistDashboard;