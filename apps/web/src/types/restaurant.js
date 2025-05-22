/**
 * Restaurant types
 * This file contains type definitions for restaurant-related functionality
 * 
 * Note: In JavaScript, we're using JSDoc for type annotations
 */

/**
 * @typedef {Object} Restaurant
 * @property {string} id - Restaurant ID
 * @property {string} name - Restaurant name
 * @property {string} description - Restaurant description
 * @property {string} address - Restaurant address
 * @property {string} city - Restaurant city
 * @property {string} state - Restaurant state
 * @property {string} country - Restaurant country
 * @property {string} postalCode - Restaurant postal code
 * @property {number} latitude - Restaurant latitude
 * @property {number} longitude - Restaurant longitude
 * @property {string} phone - Restaurant phone number
 * @property {string} website - Restaurant website
 * @property {string} email - Restaurant email
 * @property {string[]} cuisines - Restaurant cuisines
 * @property {string} priceRange - Restaurant price range
 * @property {number} rating - Restaurant rating
 * @property {number} reviewCount - Restaurant review count
 * @property {string[]} photos - Restaurant photos
 * @property {Object} hours - Restaurant hours
 * @property {string} createdAt - Restaurant creation date
 * @property {string} updatedAt - Restaurant update date
 */

/**
 * @typedef {Object} Dish
 * @property {string} id - Dish ID
 * @property {string} name - Dish name
 * @property {string} description - Dish description
 * @property {number} price - Dish price
 * @property {string[]} photos - Dish photos
 * @property {string[]} ingredients - Dish ingredients
 * @property {string[]} allergens - Dish allergens
 * @property {boolean} isVegetarian - Whether the dish is vegetarian
 * @property {boolean} isVegan - Whether the dish is vegan
 * @property {boolean} isGlutenFree - Whether the dish is gluten-free
 * @property {number} calories - Dish calories
 * @property {number} rating - Dish rating
 * @property {number} reviewCount - Dish review count
 * @property {string} createdAt - Dish creation date
 * @property {string} updatedAt - Dish update date
 */

/**
 * @typedef {Object} RestaurantWithDishes
 * @property {string} id - Restaurant ID
 * @property {string} name - Restaurant name
 * @property {string} description - Restaurant description
 * @property {string} address - Restaurant address
 * @property {string} city - Restaurant city
 * @property {string} state - Restaurant state
 * @property {string} country - Restaurant country
 * @property {string} postalCode - Restaurant postal code
 * @property {number} latitude - Restaurant latitude
 * @property {number} longitude - Restaurant longitude
 * @property {string} phone - Restaurant phone number
 * @property {string} website - Restaurant website
 * @property {string} email - Restaurant email
 * @property {string[]} cuisines - Restaurant cuisines
 * @property {string} priceRange - Restaurant price range
 * @property {number} rating - Restaurant rating
 * @property {number} reviewCount - Restaurant review count
 * @property {string[]} photos - Restaurant photos
 * @property {Object} hours - Restaurant hours
 * @property {string} createdAt - Restaurant creation date
 * @property {string} updatedAt - Restaurant update date
 * @property {Dish[]} dishes - Restaurant dishes
 */

/**
 * @typedef {Object} Review
 * @property {string} id - Review ID
 * @property {string} content - Review content
 * @property {number} rating - Review rating
 * @property {string[]} photos - Review photos
 * @property {string} userId - User ID
 * @property {string} restaurantId - Restaurant ID
 * @property {string} dishId - Dish ID
 * @property {string} createdAt - Review creation date
 * @property {string} updatedAt - Review update date
 */

export const restaurantTypes = {}; // Placeholder export for ESM compatibility
