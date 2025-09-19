"";

import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { fetchSubscriptionHistory } from "../../../services/adminService";

interface Subscription {
  userId: string;
  email: string;
  planName: string;
  price: number;
  purchaseDate: string;
}

interface ChartData {
  date: string;
  subscriptions: number;
  revenue: number;
}

export function StatsChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [history, setHistory] = useState<Subscription[]>([]);

  // Fetch subscription history
  useEffect(() => {
    const fetchSubscriptionHistoryData = async () => {
      try {
        const subscriptionHistory = await fetchSubscriptionHistory();
        setHistory(subscriptionHistory);
      } catch (err: any) {
        console.error("Error fetching subscriptions:", err);
      }
    };

    fetchSubscriptionHistoryData();
  }, []);

  // Process chart data when history updates
  useEffect(() => {
  if (history.length === 0) return;

  // ✅ Filter only valid subscriptions
  const filteredHistory = history.filter(
    (sub) => sub.planName && sub.email
  );

  // ✅ Normalize all dates to "start of day" (midnight)
  const dates = filteredHistory.map((sub) => {
    const d = new Date(sub.purchaseDate);
    d.setHours(0, 0, 0, 0); 
    return d;
  });

  if (dates.length === 0) return;

  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  // ✅ Build continuous date range from min → max
  const dateRange: Date[] = [];
  for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
    dateRange.push(new Date(d));
  }

  console.log("Max Date:", maxDate);

  // ✅ Build chart data
  const data: ChartData[] = dateRange.map((date) => {
    const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const subscriptionsOnDate = filteredHistory.filter(
      (sub) => sub.purchaseDate.split("T")[0] === dateStr
    );

    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      subscriptions: subscriptionsOnDate.length,
      revenue: subscriptionsOnDate.reduce((sum, sub) => sum + sub.price, 0),
    };
  });

  setChartData(data);
}, [history]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Subscriptions</span>
                        <span className="font-bold text-muted-foreground">{payload[0].payload.subscriptions}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Revenue</span>
                        <span className="font-bold text-muted-foreground">${payload[0].payload.revenue.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                        <span className="font-bold">{payload[0].payload.date}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line type="monotone" dataKey="subscriptions" stroke="#8884d8" strokeWidth={2} />
          <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}