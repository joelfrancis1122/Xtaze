import  { useEffect } from "react";
import { ChevronDown, Globe, Home, LayoutDashboard, LifeBuoy, LogOut, Music, Settings, User } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import { MetricsCard } from "../Admin/adminComponents/metrics-card";
import { DemographicsChart } from "./artistComponents/demographics-chart";
import { MonthlyListenersChart } from "./artistComponents/monthly-listeners-chart";
import { TopSongsTable } from "./artistComponents/top-songs-table";
import { useNavigate } from "react-router-dom";
import { clearArtistData } from "../../redux/artistSlice";
import { useDispatch } from "react-redux";

const ArtistDashboard = () => {
  const dispatch = useDispatch()
  const navigate=useNavigate()
    useEffect(() => {
        const styles = `
      body, * {
        background-color: var(--background) !important; /* Dark background */
      }
    `;
        const styleSheet = document.createElement("style")
        styleSheet.type = "text/css"
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)

        return () => {
            document.head.removeChild(styleSheet) // Cleanup on unmount
        }
    }, [])
    const handleLogout = () => {
      localStorage.removeItem("token"); // Remove token from storage
      dispatch(clearArtistData())
      navigate("/artist"); // Redirect to login page
      
    };
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid lg:grid-cols-[280px_1fr]">
      <aside className="border-r bg-background/50 backdrop-blur flex flex-col h-screen">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Music className="h-6 w-6" />
        <span className="font-bold">ArtistDash</span>
      </div>
      <div className="px-4 py-4">
        <Input placeholder="Search" className="bg-background/50" />
      </div>
      <nav className="space-y-2 px-2 flex-grow">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <LayoutDashboard className="h-4 w-4 bg-white" />
          Dashboard
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <User className="h-4 w-4" />
          Profile
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Globe className="h-4 w-4" />
          Analytics
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Home className="h-4 w-4" />
          Releases
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Music className="h-4 w-4" />
          Playlists
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <LifeBuoy className="h-4 w-4" />
          Support
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <Button 
          variant="destructive" 
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
        <main className="p-6">
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
              value="292,000"
              change={{ value: "22,000", percentage: "+8.1%", isPositive: true }}
            />
            <MetricsCard
              title="Total Streams"
              value="1.5M"
              change={{ value: "100K", percentage: "+7.2%", isPositive: true }}
            />
            <MetricsCard
              title="Total Earnings"
              value="$12,892"
              change={{ value: "$1,340", percentage: "+11.6%", isPositive: true }}
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
