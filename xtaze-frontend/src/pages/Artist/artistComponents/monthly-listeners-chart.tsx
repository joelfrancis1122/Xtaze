"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RootState } from "../../../store/store";
import { fetchArtistTracks } from "../../../services/adminService";

interface PlayHistory {
  month: string; // e.g., "2025-01"
  plays: number;
}

interface Track {
  _id: string;
  title: string;
  playHistory: PlayHistory[];
}

export function MonthlyListenersChart() {
  const [data, setData] = useState<{ month: string; plays: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For fade-in animation
  const user = useSelector((state: RootState) => state.artist.signupData);

  useEffect(() => {
    const fetchPlayHistory = async () => {
      const token = localStorage.getItem("artistToken");

      if (!token || !user?._id) {
        console.error("Token or User ID not found. Please login.");
        setData([]);
        setIsLoading(false);
        return;
      }

      try {
        const tracks = await fetchArtistTracks(user._id, token);
        console.log("Tracks:", tracks); // Debug: Inspect track data structure

        if (!tracks || tracks.length === 0) {
          setData([]);
          setIsLoading(false);
          return;
        }

        // Aggregate play history by month
        const monthlyData: { [key: string]: number } = {};
        tracks.forEach((track: Track) => {
          track.playHistory.forEach(({ month, plays }) => {
            monthlyData[month] = (monthlyData[month] || 0) + plays;
          });
        });
        console.log("Aggregated Monthly Data:", monthlyData); // Debug: Check summed data

        // Convert to ChartData array with all 12 months
        const fullData = Array.from({ length: 12 }, (_, i) => {
          const monthNum = String(i + 1).padStart(2, "0"); // "01" to "12"
          const monthKey = `2025-${monthNum}`; // "2025-01" to "2025-12"
          const monthDisplay = new Date(2025, i, 1).toLocaleString("default", { month: "short" }); // "Jan" to "Dec"
          return {
            month: monthDisplay,
            plays: monthlyData[monthKey] || 0, // Default to 0 if no data
          };
        });

        console.log("Monthly Play Data:", fullData); // Debug: Check final chart data
        setData(fullData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching play history:", error);
        setData([]);
        setIsLoading(false);
      }
    };

    fetchPlayHistory();
  }, [user?._id]);

  return (
    <div
      className={`h-[300px] w-full transition-opacity duration-1000 ease-in-out ${isLoading ? "opacity-0" : "opacity-100"
        }`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} >
          <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Plays</span>
                        <span className="font-bold text-muted-foreground">
                          {payload?.[0]?.value?.toLocaleString() || "0"}

                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Month</span>
                        <span className="font-bold">{payload[0].payload.month}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="plays"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}