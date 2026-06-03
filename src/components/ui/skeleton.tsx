import { cn } from "@/lib/utils"

function Skeleton({ className, variant = 'default', ...props }: React.ComponentProps<"div"> & { variant?: 'default' | 'shimmer' | 'pulse' }) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md",
        variant === 'shimmer' 
          ? "bg-gray-200 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-gray-100 before:to-transparent"
          : variant === 'pulse'
          ? "bg-gray-200 animate-pulse"
          : "bg-gray-200 animate-pulse",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
