import React, { useCallback, useState } from 'react';
import ImageModule from 'next/image';
import { useDropzone } from 'react-dropzone';

// Solution for Next.js 15.x: Extract the actual Image component from default property
const Image = ImageModule.default;
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Reusable Image Uploader Component
 *
 * A flexible image upload component using react-dropzone with validation,
 * preview, and progress indication. Supports drag-and-drop and click-to-upload.
 *
 * @param {Object} props - Component props
 * @param {Function} props.onUpload - Callback function when files are uploaded
 * @param {Function} props.onRemove - Callback function when files are removed
 * @param {Array} props.acceptedTypes - Array of accepted MIME types
 * @param {number} props.maxSize - Maximum file size in bytes
 * @param {number} props.maxFiles - Maximum number of files
 * @param {boolean} props.multiple - Allow multiple file selection
 * @param {boolean} props.disabled - Disable the uploader
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Custom content for the drop zone
 */
export default function ImageUploader({
  onUpload,
  onRemove,
  acceptedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  maxSize = 2 * 1024 * 1024, // 2MB default
  maxFiles = 1,
  multiple = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Validate file before processing
   * @param {File} file - File to validate
   * @returns {string|null} Error message or null if valid
   */
  const validateFile = useCallback(
    file => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        return `File type ${file.type} is not supported. Accepted types: ${acceptedTypes.join(', ')}`;
      }

      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / 1024 / 1024);
        return `File size exceeds ${maxSizeMB}MB limit`;
      }

      // Check if it's actually an image
      if (!file.type.startsWith('image/')) {
        return 'File must be an image';
      }

      return null;
    },
    [acceptedTypes, maxSize],
  );

  /**
   * Handle file drop or selection
   * @param {File[]} acceptedFiles - Files that passed validation
   * @param {Object[]} rejectedFiles - Files that failed validation
   */
  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      // Clear previous errors
      setErrors([]);

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const newErrors = rejectedFiles.map(({ file, errors }) => {
          const errorMessages = errors.map(error => {
            switch (error.code) {
              case 'file-too-large':
                return `${file.name}: File is too large`;
              case 'file-invalid-type':
                return `${file.name}: Invalid file type`;
              case 'too-many-files':
                return `Too many files. Maximum ${maxFiles} allowed`;
              default:
                return `${file.name}: ${error.message}`;
            }
          });
          return errorMessages.join(', ');
        });
        setErrors(newErrors);
        return;
      }

      // Validate accepted files
      const validationErrors = [];
      const validFiles = [];

      for (const file of acceptedFiles) {
        const error = validateFile(file);
        if (error) {
          validationErrors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Check total file count
      if (uploadedFiles.length + validFiles.length > maxFiles) {
        setErrors([`Maximum ${maxFiles} files allowed`]);
        return;
      }

      // Process valid files
      if (validFiles.length > 0) {
        setIsUploading(true);
        try {
          // Create file objects with preview URLs
          const fileObjects = validFiles.map(file => ({
            file,
            id: `${file.name}-${Date.now()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            preview: URL.createObjectURL(file),
            status: 'uploading',
          }));

          // Update state with new files
          const newFiles = multiple
            ? [...uploadedFiles, ...fileObjects]
            : fileObjects;
          setUploadedFiles(newFiles);

          // Call upload callback
          if (onUpload) {
            await onUpload(validFiles, fileObjects);
          }

          // Update status to success
          setUploadedFiles(prev =>
            prev.map(f =>
              fileObjects.find(fo => fo.id === f.id)
                ? { ...f, status: 'success' }
                : f,
            ),
          );
        } catch (error) {
          console.error('Upload error:', error);
          setErrors([error.message || 'Upload failed']);

          // Update status to error
          setUploadedFiles(prev =>
            prev.map(f =>
              fileObjects.find(fo => fo.id === f.id)
                ? { ...f, status: 'error' }
                : f,
            ),
          );
        } finally {
          setIsUploading(false);
        }
      }
    },
    [uploadedFiles, validateFile, maxFiles, multiple, onUpload],
  );

  /**
   * Remove uploaded file
   * @param {string} fileId - ID of file to remove
   */
  const removeFile = useCallback(
    fileId => {
      const fileToRemove = uploadedFiles.find(f => f.id === fileId);
      if (fileToRemove) {
        // Revoke object URL to prevent memory leaks
        if (fileToRemove.preview) {
          URL.revokeObjectURL(fileToRemove.preview);
        }

        // Update state
        const newFiles = uploadedFiles.filter(f => f.id !== fileId);
        setUploadedFiles(newFiles);

        // Call remove callback
        if (onRemove) {
          onRemove(fileToRemove, newFiles);
        }
      }
    },
    [uploadedFiles, onRemove],
  );

  /**
   * Get file status icon
   * @param {string} status - File status
   * @returns {React.ReactNode} Status icon
   */
  const getStatusIcon = status => {
    switch (status) {
      case 'uploading':
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500" />
        );
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Configure dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles: multiple ? maxFiles : 1,
    multiple,
    disabled: disabled || isUploading,
    noClick: false,
    noKeyboard: false,
  });

  // Determine dropzone styling
  const getDropzoneClassName = () => {
    let baseClasses = `
      border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
      transition-all duration-200 ease-in-out
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${className}
    `;

    if (isDragActive) {
      if (isDragAccept) {
        baseClasses += ' border-green-400 bg-green-50 dark:bg-green-900/20';
      } else if (isDragReject) {
        baseClasses += ' border-red-400 bg-red-50 dark:bg-red-900/20';
      } else {
        baseClasses += ' border-orange-400 bg-orange-50 dark:bg-orange-900/20';
      }
    } else {
      baseClasses +=
        ' border-orange-200 dark:border-orange-700 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/10';
    }

    return baseClasses;
  };

  return (
    <div className="w-full">
      {/* Dropzone */}
      <div {...getRootProps()} className={getDropzoneClassName()}>
        <input {...getInputProps()} />

        {children || (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="w-8 h-8 text-orange-400" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isDragActive ? (
                isDragAccept ? (
                  <p>Drop the files here...</p>
                ) : (
                  <p>Some files are not supported</p>
                )
              ) : (
                <div>
                  <p className="font-medium">
                    Drag and drop {multiple ? 'files' : 'a file'} here, or click
                    to select
                  </p>
                  <p className="text-xs mt-1">
                    {acceptedTypes
                      .map(type => type.split('/')[1])
                      .join(', ')
                      .toUpperCase()}{' '}
                    up to {Math.round(maxSize / 1024 / 1024)}MB
                    {multiple && ` (max ${maxFiles} files)`}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-3 space-y-1">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* File Previews */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map(fileObj => (
            <div
              key={fileObj.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              {/* Preview Image */}
              {fileObj.preview && (
                <Image
                  src={fileObj.preview}
                  alt={fileObj.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded"
                />
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {fileObj.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(fileObj.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                {getStatusIcon(fileObj.status)}
                <button
                  onClick={() => removeFile(fileObj.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  disabled={fileObj.status === 'uploading'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
