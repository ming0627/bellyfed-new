"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "../utils.js"

export interface SearchFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
  showClearButton?: boolean
}

const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, onClear, showClearButton = true, value, ...props }, ref) => {
    const handleClear = () => {
      if (onClear) {
        onClear()
      }
    }

    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500 dark:text-orange-400" />
        <input
          type="search"
          className={cn(
            "flex h-10 w-full rounded-md border border-orange-200 bg-white pl-10 pr-10 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-orange-800 dark:bg-orange-950 dark:ring-offset-orange-950 dark:placeholder:text-orange-400 dark:focus-visible:ring-orange-300",
            className
          )}
          ref={ref}
          value={value}
          {...props}
        />
        {showClearButton && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
SearchField.displayName = "SearchField"

export { SearchField }
