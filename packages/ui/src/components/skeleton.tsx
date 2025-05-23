import { cn } from "../utils.js"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-orange-100 dark:bg-orange-800", className)}
      {...props}
    />
  )
}

export { Skeleton }
