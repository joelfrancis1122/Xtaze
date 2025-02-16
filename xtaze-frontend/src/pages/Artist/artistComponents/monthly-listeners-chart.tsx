"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { month: "Jan", listeners: 120000 },
  { month: "Feb", listeners: 132000 },
  { month: "Mar", listeners: 145000 },
  { month: "Apr", listeners: 160000 },
  { month: "May", listeners: 178000 },
  { month: "Jun", listeners: 194000 },
  { month: "Jul", listeners: 208000 },
  { month: "Aug", listeners: 222000 },
  { month: "Sep", listeners: 239000 },
  { month: "Oct", listeners: 253000 },
  { month: "Nov", listeners: 270000 },
  { month: "Dec", listeners: 292000 },
]

export function MonthlyListenersChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Listeners</span>
                        <span className="font-bold text-muted-foreground">w</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Month</span>
                        <span className="font-bold">{payload[0].payload.month}</span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Line type="monotone" dataKey="listeners" stroke="#8884d8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

