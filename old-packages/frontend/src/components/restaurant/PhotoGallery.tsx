import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface PhotoGalleryProps {
  photos: string[];
  restaurantName: string;
}

export function PhotoGallery({
  photos,
  restaurantName,
}: PhotoGalleryProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleNext = (): void => {
    setIsLoading(true);
    setCurrentIndex((prevIndex: number) => (prevIndex + 1) % photos.length);
  };

  const handlePrev = (): void => {
    setIsLoading(true);
    setCurrentIndex(
      (prevIndex: number) => (prevIndex - 1 + photos.length) % photos.length,
    );
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        No photos available
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}
        <Image
          src={photos[currentIndex]}
          alt={`${restaurantName} - Photo ${currentIndex + 1}`}
          fill
          className="object-cover"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* Navigation buttons */}
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <button
          onClick={handlePrev}
          className="p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75"
          aria-label="Previous photo"
        >
          ←
        </button>
        <button
          onClick={handleNext}
          className="p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75"
          aria-label="Next photo"
        >
          →
        </button>
      </div>

      {/* Photo counter */}
      <div className="absolute bottom-4 right-4 px-3 py-1 text-white bg-black bg-opacity-50 rounded-full">
        {currentIndex + 1} / {photos.length}
      </div>
    </div>
  );
}
