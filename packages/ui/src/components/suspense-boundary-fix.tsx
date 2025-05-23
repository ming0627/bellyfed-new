"use client"

import * as React from "react"

interface SuspenseBoundaryFixProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * A wrapper component that fixes hydration issues with Suspense boundaries
 * by ensuring client-side rendering matches server-side rendering.
 */
export function SuspenseBoundaryFix({ 
  children, 
  fallback = <div>Loading...</div> 
}: SuspenseBoundaryFixProps) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <>{fallback}</>
  }

  return (
    <React.Suspense fallback={fallback}>
      {children}
    </React.Suspense>
  )
}
