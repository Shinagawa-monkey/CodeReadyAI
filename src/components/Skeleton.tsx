import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "animate-pulse bg-muted rounded h-[1.25em] w-full max-w-full inline-block align-bottom",
        className
      )}
    />
  )
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-9", className)} /> // h-9 is hight of default btn in shadcn
}