/**
 * Typesense dish schema definition
 */

/**
 * Typesense dish schema
 */
export const TYPESENSE_DISH_SCHEMA = {
    name: 'dishes',
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', optional: true },
        { name: 'restaurant_id', type: 'string' },
        { name: 'restaurant_name', type: 'string' },
        { name: 'price', type: 'float', optional: true },
        { name: 'category', type: 'string', optional: true },
        { name: 'tags', type: 'string[]', optional: true },
        { name: 'rating', type: 'float', optional: true },
        { name: 'review_count', type: 'int32', optional: true },
        { name: 'image_url', type: 'string', optional: true },
        { name: 'created_at', type: 'int64' },
        { name: 'updated_at', type: 'int64' },
    ],
    default_sorting_field: 'rating',
};

/**
 * Format dish data for Typesense
 * @param dish Dish data from database
 * @returns Formatted dish data for Typesense
 */
export function formatDishForTypesense(dish: Record<string, unknown>): unknown {
    return {
        id: dish.id as string,
        name: dish.name as string,
        description: (dish.description as string) || '',
        restaurant_id: dish.restaurant_id as string,
        restaurant_name: (dish.restaurant_name as string) || '',
        price: (dish.price as number) || 0,
        category: (dish.category as string) || '',
        tags: (dish.tags as string[]) || [],
        rating: (dish.rating as number) || 0,
        review_count: (dish.review_count as number) || 0,
        image_url: (dish.image_url as string) || '',
        created_at: new Date(dish.created_at as string | number | Date).getTime(),
        updated_at: new Date(dish.updated_at as string | number | Date).getTime(),
    };
}
