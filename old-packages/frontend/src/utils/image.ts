interface ImageConfig {
  bucket: string;
  region: string;
  key: string;
}

export const getImageUrl = (image: ImageConfig | undefined): string => {
  const defaultImage =
    'https://bellyfed-assets.s3.ap-southeast-1.amazonaws.com/restaurants/bellyfed.png';

  if (!image) {
    return defaultImage;
  }

  try {
    return `https://${image.bucket}.s3.${image.region}.amazonaws.com/${image.key}`;
  } catch (_error) {
    return defaultImage;
  }
};
