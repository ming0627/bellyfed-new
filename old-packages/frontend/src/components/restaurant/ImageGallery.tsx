import { ImageIcon } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { S3Object } from '@/types';
import { getImageUrl } from '@/utils/image';

const DEFAULT_IMAGE =
  'https://bellyfed-assets.s3.ap-southeast-1.amazonaws.com/restaurants/bellyfed.png';

interface ImageGalleryProps {
  mainImage?: S3Object;
}

export function ImageGallery({ mainImage }: ImageGalleryProps): JSX.Element {
  return (
    <Card className="mb-4 sm:mb-6 overflow-hidden bg-white shadow-lg">
      <CardContent className="p-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          <div className="col-span-2 row-span-2 relative aspect-[4/3]">
            <Image
              src={getImageUrl(mainImage) || DEFAULT_IMAGE}
              alt="Restaurant interior"
              fill
              className="object-cover hover:brightness-90 transition-all duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="secondary"
                className="bg-white/90 text-red-600 hover:bg-white"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                View All Photos
              </Button>
            </div>
          </div>
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="relative aspect-square hidden sm:block group"
            >
              <Image
                src={DEFAULT_IMAGE}
                alt={`Food item ${item}`}
                fill
                className="object-cover group-hover:brightness-90 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
