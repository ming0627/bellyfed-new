import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface SafeImageProps extends Omit<ImageProps, 'onError' | 'src'> {
  src: string;
  fallbackSrc: string;
}

export function SafeImage({
  src,
  fallbackSrc,
  ...props
}: SafeImageProps): JSX.Element {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;

    img.onerror = () => {
      setImgSrc(fallbackSrc);
    };

    return () => {
      img.onerror = null;
    };
  }, [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={imgSrc}
      placeholder="blur"
      blurDataURL={fallbackSrc}
      priority={false}
      alt={props.alt || 'Image'}
    />
  );
}
