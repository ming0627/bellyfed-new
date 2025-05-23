import React from 'react';
import { getCountryStaticPaths, getCountryStaticProps } from '@bellyfed/utils';
import { Container, PageHeader, Card } from '@bellyfed/ui';
import { Compass } from 'lucide-react';

export default function ExplorePage({ country }) {
  return (
    <Container>
      <PageHeader
        title="Explore"
        description="Discover new dishes, restaurants, and food experiences"
        icon={<Compass className="w-8 h-8 text-primary-500" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">Trending Dishes</h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Explore the most popular dishes in your area
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">New Restaurants</h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Discover newly added restaurants
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">Food Collections</h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Browse curated collections of dishes and restaurants
          </p>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Vegetarian', 'Seafood', 'Fast Food', 'Fine Dining'].map((category) => (
            <Card key={category} className="p-4 text-center hover:border-primary-500 transition-colors cursor-pointer">
              {category}
            </Card>
          ))}
        </div>
      </div>
    </Container>
  );
}

// Generate static paths for all supported countries
export const getStaticPaths = () => getCountryStaticPaths();

// Get static props with country information
export const getStaticProps = ({ params }) => getCountryStaticProps(params);
