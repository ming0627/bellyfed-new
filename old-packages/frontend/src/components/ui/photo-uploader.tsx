import { Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { uploadPhoto } from '@/services/photoUploadService';

// Custom toast
interface PhotoUploaderProps {
  photos: string[];
  maxPhotos?: number;
  onPhotoAdded: (photoUrl: string) => void;
  onPhotoRemoved: (photoUrl: string) => void;
}

export function PhotoUploader({
  photos,
  maxPhotos = 5,
  onPhotoAdded,
  onPhotoRemoved,
}: PhotoUploaderProps): React.ReactElement {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if we've reached the maximum number of photos
    if (photos.length >= maxPhotos) {
      toast({
        title: 'Maximum photos reached',
        description: `You can only upload a maximum of ${maxPhotos} photos.`,
        variant: 'destructive',
      });
      return;
    }

    const file = files[0];

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload the photo
      const photoUrl = await uploadPhoto(file, (progress: number) => {
        setUploadProgress(progress);
      });

      // Add the photo URL to the list
      onPhotoAdded(photoUrl);

      toast({
        title: 'Photo uploaded',
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Upload failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setPreviewUrl(null);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemovePhoto = (photoUrl: string): void => {
    onPhotoRemoved(photoUrl);
  };

  const handleCancelUpload = (): void => {
    setIsUploading(false);
    setUploadProgress(0);
    setPreviewUrl(null);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Photos</span>
        <span className="text-xs text-gray-500">
          {photos.length} of {maxPhotos} photos
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Existing Photos */}
        {photos.map((photoUrl, index) => (
          <div
            key={index}
            className="relative aspect-square bg-gray-100 rounded-md overflow-hidden group"
          >
            <Image
              src={photoUrl}
              alt={`Photo ${index + 1}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => handleRemovePhoto(photoUrl)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Preview */}
        {previewUrl && (
          <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center">
              <Progress value={uploadProgress} className="w-3/4 h-2 mb-2" />
              <span className="text-white text-xs font-medium">
                {uploadProgress}%
              </span>
              {isUploading && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={handleCancelUpload}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {!isUploading && photos.length < maxPhotos && !previewUrl && (
          <Button
            variant="outline"
            className="aspect-square flex flex-col items-center justify-center border-dashed border-2"
            onClick={handleUploadClick}
          >
            <Upload className="h-6 w-6 mb-1" />
            <span className="text-xs">Upload</span>
          </Button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={isUploading || photos.length >= maxPhotos}
      />

      <p className="text-xs text-gray-500">
        Add photos of the dish to help others recognize it. Maximum {maxPhotos}{' '}
        photos.
      </p>
    </div>
  );
}
