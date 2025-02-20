import { Card } from "../../../components/ui/card"
import { ArrowUpRight } from "lucide-react"
import type React from "react" // Added import for React

interface MetricsCardProps {
  title: string
  value: string

  chart?: React.ReactNode
}

export function MetricsCard({ title, value, chart }: MetricsCardProps) {
  return (
    <Card className="p-4 bg-background/50 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-muted-foreground">{title}</h3>
        {chart ? <ArrowUpRight className="h-4 w-4 text-muted-foreground" /> : null}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <div className="flex items-center gap-1 mt-1">
          
          </div>
        </div>
        {chart}
      </div>
    </Card>
  )
}

