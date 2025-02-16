"use client"

import { useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { MetricsCard } from "./adminComponents/metrics-card"
import { StatsChart } from "./adminComponents/stats-chart"
import { PopularTracks } from "./adminComponents/popular-tracks"
import { PopularArtists } from "./adminComponents/popular-artists"
import "../Admin/adminComponents/zashboard.css"
import Sidebar from "./adminComponents/aside-side"

export default function Page() {

    // Inject dark mode styles when component mounts
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

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="flex">
                {/* Sidebar */}
                <Sidebar/>

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
                            title="Total Listeners"
                            value="0"
                            change={{ value: "12,345", percentage: "+2.1%", isPositive: true }}
                        />
                        <MetricsCard
                            title="Total Artists"
                            value="0"
                            change={{ value: "1,234", percentage: "+3.2%", isPositive: true }}
                        />
                        <MetricsCard
                            title="Total Revenue"
                            value="$0"
                            change={{ value: "$23,456", percentage: "+5.6%", isPositive: true }}
                        />
                    </div>

                    <Card className="mt-6 p-6">
                        <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold">Listening Statistics</h2>
                            <div className="flex flex-wrap gap-2">
                                {["Today", "Last week", "Last month", "Last 6 months", "Year"].map((period) => (
                                    <Button key={period} size="sm" variant="ghost">
                                        {period}
                                    </Button>
                                ))}
                            </div>
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
    )
}
