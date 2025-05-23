/**
 * Typesense Dish Schema
 * 
 * This file defines the schema for the dishes collection in Typesense
 * and provides utility functions for formatting dish data.
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
    { name: 'dish_type', type: 'string' },
    { name: 'restaurant_id', type: 'string' },
    { name: 'restaurant_name', type: 'string' },
    { name: 'price', type: 'float' },
    { name: 'tags', type: 'string[]', optional: true },
    { name: 'image_url', type: 'string', optional: true },
    { name: 'average_rank', type: 'float' },
    { name: 'ranking_count', type: 'int32' },
    { name: 'is_available', type: 'bool' },
    { name: 'is_seasonal', type: 'bool', optional: true },
    { name: 'created_at', type: 'string' },
    { name: 'updated_at', type: 'string', optional: true },
  ],
  default_sorting_field: 'average_rank',
};

/**
 * Dish data interface from database
 */
export interface DishData {
  dish_id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  price: number;
  dish_type: string;
  tags?: string[];
  is_seasonal?: boolean;
  is_available: boolean;
  created_at: string;
  restaurant_name: string;
  average_rank: number;
  ranking_count: number;
  image_url?: string;
  updated_at?: string;
}

/**
 * Typesense dish document interface
 */
export interface TypesenseDishDocument {
  id: string;
  name: string;
  description?: string;
  dish_type: string;
  restaurant_id: string;
  restaurant_name: string;
  price: number;
  tags?: string[];
  image_url?: string;
  average_rank: number;
  ranking_count: number;
  is_available: boolean;
  is_seasonal?: boolean;
  created_at: string;
  updated_at?: string;
}

/**
 * Format dish data for Typesense
 * @param dish Dish data from database
 * @returns Formatted dish data for Typesense
 */
export function formatDishForTypesense(dish: DishData): TypesenseDishDocument {
  return {
    id: dish.dish_id,
    name: dish.name,
    description: dish.description || '',
    dish_type: dish.dish_type,
    restaurant_id: dish.restaurant_id,
    restaurant_name: dish.restaurant_name || '',
    price: dish.price || 0,
    tags: dish.tags || [],
    image_url: dish.image_url || '',
    average_rank: dish.average_rank || 0,
    ranking_count: dish.ranking_count || 0,
    is_available: dish.is_available || false,
    is_seasonal: dish.is_seasonal || false,
    created_at: dish.created_at,
    updated_at: dish.updated_at,
  };
}
