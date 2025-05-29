import { withApiAuthRequired } from '@/utils/auth';
import { executeQuery } from '@/utils/db';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Get dishes for a restaurant API endpoint
 *
 * This endpoint gets dishes for a restaurant from the database
 * It requires authentication and accepts the following parameters:
 * - id: Restaurant ID (either our internal ID or Google Place ID)
 * - limit: Maximum number of dishes to return (default: 20)
 * - offset: Offset for pagination (default: 0)
 * - sort: Sort order ('popularity', 'rating', 'name', 'price') (default: 'popularity')
 * - order: Sort direction ('asc', 'desc') (default: 'desc')
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const offset = parseInt((req.query.offset as string) || '0', 10);
    const sort = (req.query.sort as string) || 'popularity';
    const order = (req.query.order as string) || 'desc';

    if (!id) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    // Get restaurant ID from database
    const restaurantId = await getRestaurantId(id as string);

    if (!restaurantId) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Get dishes from database
    const dishes = await getRestaurantDishes(
      restaurantId,
      limit,
      offset,
      sort,
      order,
    );

    // Get total count
    const totalCount = await getRestaurantDishesCount(restaurantId);

    // Return the dishes
    return res.status(200).json({
      dishes,
      totalCount,
      hasMore: offset + limit < totalCount,
    });
  } catch (error: unknown) {
    console.error('Error getting restaurant dishes:', error);
    return res.status(500).json({ message: 'Error getting restaurant dishes' });
  }
}

/**
 * Get restaurant ID from database
 *
 * @param id Restaurant ID (either our internal ID or Google Place ID)
 * @returns Restaurant ID or null if not found
 */
async function getRestaurantId(id: string): Promise<string | null> {
  try {
    // Try to get restaurant by our internal ID first
    let query = `
      SELECT restaurant_id
      FROM restaurants
      WHERE restaurant_id = $1
    `;

    let result = await executeQuery(query, [id]);

    // If found, return the ID
    if (result.rows.length > 0) {
      return (result.rows[0] as any).restaurant_id;
    }

    // If not found, try to get by Google Place ID
    query = `
      SELECT restaurant_id
      FROM restaurants
      WHERE google_place_id = $1
    `;

    result = await executeQuery(query, [id]);

    // If found, return the ID
    if (result.rows.length > 0) {
      return (result.rows[0] as any).restaurant_id;
    }

    // If still not found, return null
    return null;
  } catch (error: unknown) {
    console.error('Error getting restaurant ID:', error);
    return null;
  }
}

/**
 * Get restaurant dishes from database
 *
 * @param restaurantId Restaurant ID
 * @param limit Maximum number of dishes to return
 * @param offset Offset for pagination
 * @param sort Sort order ('popularity', 'rating', 'name', 'price')
 * @param order Sort direction ('asc', 'desc')
 * @returns Array of dishes
 */
async function getRestaurantDishes(
  restaurantId: string,
  limit: number = 20,
  offset: number = 0,
  sort: string = 'popularity',
  order: string = 'desc',
): Promise<unknown[]> {
  try {
    // Determine sort column and direction
    let sortColumn = 'd.name';
    const sortDirection = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    switch (sort.toLowerCase()) {
      case 'popularity':
        sortColumn = 'COALESCE(COUNT(r.ranking_id), 0)';
        break;
      case 'rating':
        sortColumn = 'COALESCE(AVG(r.rank), 0)';
        break;
      case 'price':
        sortColumn = 'd.price';
        break;
      case 'name':
      default:
        sortColumn = 'd.name';
        break;
    }

    // Build query
    const query = `
      SELECT
        d.dish_id,
        d.name,
        d.slug,
        d.description,
        d.category,
        d.image_url,
        d.is_vegetarian,
        d.spicy_level,
        d.price,
        COUNT(r.ranking_id) AS total_rankings,
        COALESCE(AVG(r.rank), 0) AS average_rank
      FROM dishes d
      LEFT JOIN dish_rankings r ON d.dish_id = r.dish_id
      WHERE d.restaurant_id = $1
      GROUP BY d.dish_id
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $2 OFFSET $3
    `;

    const result = await executeQuery(query, [restaurantId, limit, offset]);

    // Transform database rows to our format
    return result.rows.map((row: Record<string, unknown>) => ({
      dishId: row.dish_id as string,
      name: row.name as string,
      slug: row.slug as string,
      description: row.description as string,
      category: row.category as string,
      imageUrl: row.image_url as string,
      isVegetarian: row.is_vegetarian as boolean,
      spicyLevel: row.spicy_level as number,
      price: row.price as number,
      totalRankings: parseInt(row.total_rankings as string, 10),
      averageRank: parseFloat(row.average_rank as string),
    }));
  } catch (error: unknown) {
    console.error('Error getting restaurant dishes from database:', error);
    return [];
  }
}

/**
 * Get restaurant dishes count from database
 *
 * @param restaurantId Restaurant ID
 * @returns Total count of dishes
 */
async function getRestaurantDishesCount(restaurantId: string): Promise<number> {
  try {
    const query = `
      SELECT COUNT(*) AS total
      FROM dishes
      WHERE restaurant_id = $1
    `;

    const result = await executeQuery(query, [restaurantId]);

    return parseInt((result.rows[0] as any).total, 10);
  } catch (error: unknown) {
    console.error(
      'Error getting restaurant dishes count from database:',
      error,
    );
    return 0;
  }
}

export default withApiAuthRequired(handler);
