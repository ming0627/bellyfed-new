import React from 'react';
import DishCard from '../components/dishes/DishCard.js';

/**
 * Test page for DishCard component
 */
export default function TestDishCardPage() {
  // Test data that matches the structure from TopRatedDishes
  const testDish = {
    id: '1',
    name: 'Test Nasi Lemak Special',
    restaurant: 'Test Restaurant',
    rating: 4.8,
    reviewCount: 120,
    imageUrl: 'https://images.unsplash.com/photo-1628517394226-4f0c0f9a8b79?q=80&w=300&h=200&fit=crop',
    price: 'RM 15.90',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          DishCard Component Test
        </h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Test Data:
          </h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
            {JSON.stringify(testDish, null, 2)}
          </pre>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            DishCard Component:
          </h2>
          <div className="max-w-md">
            <DishCard dish={testDish} />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Instructions:
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Open browser developer console (F12)</li>
            <li>Check for any JavaScript errors</li>
            <li>Look for console.log messages from DishCard component</li>
            <li>Verify the component renders without "Element type is invalid" error</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
