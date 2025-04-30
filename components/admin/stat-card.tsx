import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: React.ReactNode
  icon: React.ReactNode
  description?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  error?: string | null
  isPlaceholder?: boolean
}

export function StatCard({ title, value, icon, description, trend, className, error, isPlaceholder }: StatCardProps) {
  const cardClasses = cn(
    "overflow-hidden",
    className,
    error ? "border-destructive bg-destructive/10" : "",
    isPlaceholder ? "opacity-70" : ""
  )

  return (
    <Card className={cardClasses}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-destructive">Error: {error}</div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && <div className="text-xs text-muted-foreground">{description}</div>}
            {trend && (
              <div className="mt-2 flex items-center text-xs">
                <span
                  className={cn(
                    "mr-1 rounded-sm px-1 py-0.5",
                    trend.isPositive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                  )}
                >
                  {trend.isPositive ? "+" : "-"}
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
