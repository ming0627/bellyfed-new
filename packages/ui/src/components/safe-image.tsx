"use client"

import * as React from "react"
import { cn } from "../utils.js"

// Dynamic import for Next.js Image component to make it optional
let NextImage: any = null
try {
  NextImage = require("next/image").default
} catch {
  // Next.js not available, will use regular img tag
}

export interface SafeImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackSrc?: string
  priority?: boolean
  quality?: number
  fill?: boolean
  sizes?: string
  onError?: () => void
}

const SafeImage = React.forwardRef<HTMLImageElement, SafeImageProps>(
  ({
    src,
    alt,
    width,
    height,
    className,
    fallbackSrc = "/images/placeholder.jpg",
    priority = false,
    quality = 75,
    fill = false,
    sizes,
    onError,
    ...props
  }, ref) => {
    const [imageSrc, setImageSrc] = React.useState(src)
    const [hasError, setHasError] = React.useState(false)

    React.useEffect(() => {
      setImageSrc(src)
      setHasError(false)
    }, [src])

    const handleError = () => {
      if (!hasError) {
        setHasError(true)
        setImageSrc(fallbackSrc)
        if (onError) {
          onError()
        }
      }
    }

    const imageProps = {
      src: imageSrc,
      alt,
      className: cn("object-cover", className),
      onError: handleError,
      priority,
      quality,
      ...props
    }

    if (NextImage) {
      if (fill) {
        return (
          <NextImage
            {...imageProps}
            fill
            sizes={sizes}
          />
        )
      }

      return (
        <NextImage
          {...imageProps}
          width={width}
          height={height}
        />
      )
    }

    // Fallback to regular img tag when Next.js is not available
    return (
      <img
        {...imageProps}
        width={width}
        height={height}
        style={fill ? { objectFit: 'cover', width: '100%', height: '100%' } : undefined}
      />
    )
  }
)

SafeImage.displayName = "SafeImage"

export { SafeImage }
