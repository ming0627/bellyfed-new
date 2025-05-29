// Typesense Dish Schema
// Defines the schema for indexing dishes in Typesense

export const TYPESENSE_DISH_SCHEMA = {
    name: 'dishes',
    fields: [
        { name: 'dish_id', type: 'string' },
        { name: 'restaurant_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', optional: true },
        { name: 'price', type: 'float', optional: true },
        { name: 'dish_type', type: 'string' },
        { name: 'tags', type: 'string[]', optional: true },
        { name: 'is_seasonal', type: 'bool', optional: true },
        { name: 'is_available', type: 'bool', optional: true },
        { name: 'restaurant_name', type: 'string' }, // Denormalized for convenience
        { name: 'average_rank', type: 'float', optional: true },
        { name: 'ranking_count', type: 'int32', optional: true },
        { name: 'created_at', type: 'int64' },
    ],
    default_sorting_field: 'created_at',
};

// Interface for dish data to be indexed in Typesense
export interface TypesenseDish {
    dish_id: string;
    restaurant_id: string;
    name: string;
    description?: string;
    price?: number;
    dish_type: string;
    tags?: string[];
    is_seasonal?: boolean;
    is_available?: boolean;
    restaurant_name: string;
    average_rank?: number;
    ranking_count?: number;
    created_at: number;
}

// Function to format a dish from the database for Typesense
export function formatDishForTypesense(dish: Record<string, unknown>): TypesenseDish {
    return {
        dish_id: dish.dish_id as string,
        restaurant_id: dish.restaurant_id as string,
        name: dish.name as string,
        description: (dish.description as string) || '',
        price: dish.price ? parseFloat(dish.price as string) : undefined,
        dish_type: dish.dish_type as string,
        tags: (dish.tags as string[]) || [],
        is_seasonal: (dish.is_seasonal as boolean) || false,
        is_available: (dish.is_available as boolean) !== false, // Default to true if not specified
        restaurant_name: (dish.restaurant_name as string) || '',
        average_rank: dish.average_rank ? parseFloat(dish.average_rank as string) : undefined,
        ranking_count: dish.ranking_count ? parseInt(dish.ranking_count as string, 10) : undefined,
        created_at: dish.created_at
            ? new Date(dish.created_at as string).getTime()
            : new Date().getTime(),
    };
}
