"use client"

import * as React from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { cn } from "../utils.js"
import { Button } from "./button.js"

export interface PhotoUploaderProps {
  onUpload?: (files: File[]) => void
  onRemove?: (index: number) => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
  className?: string
  disabled?: boolean
  multiple?: boolean
  preview?: boolean
  uploadedFiles?: File[]
}

const PhotoUploader = React.forwardRef<HTMLDivElement, PhotoUploaderProps>(
  ({
    onUpload,
    onRemove,
    maxFiles = 5,
    maxSize = 5 * 1024 * 1024, // 5MB
    acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
    className,
    disabled = false,
    multiple = true,
    preview = true,
    uploadedFiles = [],
    ...props
  }, ref) => {
    const [dragActive, setDragActive] = React.useState(false)
    const [files, setFiles] = React.useState<File[]>(uploadedFiles)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleDrag = React.useCallback((e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true)
      } else if (e.type === "dragleave") {
        setDragActive(false)
      }
    }, [])

    const handleDrop = React.useCallback((e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (disabled) return

      const droppedFiles = Array.from(e.dataTransfer.files)
      const validFiles = droppedFiles.filter(file => {
        if (!acceptedTypes.includes(file.type)) return false
        if (file.size > maxSize) return false
        return true
      })

      const filesToAdd = multiple
        ? validFiles.slice(0, maxFiles - files.length)
        : validFiles.slice(0, 1)

      if (multiple) {
        setFiles(prev => [...prev, ...filesToAdd])
      } else {
        setFiles(filesToAdd)
      }

      if (onUpload) {
        onUpload(filesToAdd)
      }
    }, [disabled, files, acceptedTypes, maxSize, maxFiles, multiple, onUpload])

    const handleFiles = React.useCallback((newFiles: File[]) => {
      const validFiles = newFiles.filter(file => {
        if (!acceptedTypes.includes(file.type)) return false
        if (file.size > maxSize) return false
        return true
      })

      const filesToAdd = multiple
        ? validFiles.slice(0, maxFiles - files.length)
        : validFiles.slice(0, 1)

      if (multiple) {
        setFiles(prev => [...prev, ...filesToAdd])
      } else {
        setFiles(filesToAdd)
      }

      if (onUpload) {
        onUpload(filesToAdd)
      }
    }, [files, acceptedTypes, maxSize, maxFiles, multiple, onUpload])

    const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(Array.from(e.target.files))
      }
    }, [handleFiles])

    const removeFile = React.useCallback((index: number) => {
      setFiles(prev => prev.filter((_, i) => i !== index))
      if (onRemove) {
        onRemove(index)
      }
    }, [onRemove])

    const openFileDialog = () => {
      if (inputRef.current) {
        inputRef.current.click()
      }
    }

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 transition-colors",
            dragActive
              ? "border-orange-500 bg-orange-50 dark:bg-orange-950/50"
              : "border-orange-200 dark:border-orange-800",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "cursor-pointer hover:border-orange-300 dark:hover:border-orange-700"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={!disabled ? openFileDialog : undefined}
        >
          <input
            ref={inputRef}
            type="file"
            multiple={multiple}
            accept={acceptedTypes.join(",")}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />

          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="h-10 w-10 text-orange-400 mb-4" />
            <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">
              {dragActive ? "Drop files here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-orange-500 dark:text-orange-500">
              {acceptedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase()} up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        </div>

        {preview && files.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-orange-100 dark:bg-orange-800">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-orange-400" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
                <p className="mt-1 text-xs text-orange-600 dark:text-orange-400 truncate">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

PhotoUploader.displayName = "PhotoUploader"

export { PhotoUploader }
