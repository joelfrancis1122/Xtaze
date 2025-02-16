"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { date: "Mon", streams: 2400, revenue: 4000 },
  { date: "Tue", streams: 1398, revenue: 3000 },
  { date: "Wed", streams: 9800, revenue: 2000 },
  { date: "Thu", streams: 3908, revenue: 2780 },
  { date: "Fri", streams: 4800, revenue: 1890 },
  { date: "Sat", streams: 3800, revenue: 2390 },
  { date: "Sun", streams: 4300, revenue: 3490 },
]

export function StatsChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip />
          <Line type="monotone" dataKey="streams" stroke="#8884d8" strokeWidth={2} />
          <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

