"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  { category: "Male", value: 30 },
  { category: "Female", value: 45 },
  { category: "Other", value: 25 },
  { category: "18-24", value: 40 },
  { category: "25-34", value: 30 },
  { category: "35-44", value: 20 },
  { category: "45+", value: 10 },
  { category: "USA", value: 50 },
  { category: "UK", value: 20 },
  { category: "Canada", value: 15 },
  { category: "Other", value: 15 },
]

export function DemographicsChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

