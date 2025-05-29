import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { reference } = req.query;

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return res
      .status(500)
      .json({ error: 'Google Maps API key not configured' });
  }

  if (!reference || typeof reference !== 'string') {
    return res.status(400).json({ error: 'Photo reference is required' });
  }

  try {
    // Get width and height from query params or use defaults
    const maxWidth = parseInt(req.query.maxwidth as string) || 1200;
    const maxHeight = parseInt(req.query.maxheight as string) || 800;

    // Extract the photo reference ID from the Places API v2 reference
    const photoId = reference.split('/photos/')[1];

    // Construct the Google Places Photos API URL
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&maxheight=${maxHeight}&photo_reference=${photoId}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

    // Fetch the photo
    const response = await fetch(photoUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch photo: ${response.statusText}`);
    }

    // Get the image data and content type
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

    // Send the image data
    res.send(Buffer.from(imageBuffer));
  } catch (error: unknown) {
    console.error('Error fetching photo:', error);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
}
