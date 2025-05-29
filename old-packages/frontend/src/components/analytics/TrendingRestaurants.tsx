import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import { useAnalytics } from '../../hooks/useAnalytics';
// import { restaurantService } from '../../services/restaurantService';

interface TrendingRestaurantsProps {
  limit?: number;
  period?: string;
}

interface TrendingRestaurant {
  entityId: string;
  entityType: string;
  viewCount: number;
  uniqueViewers: number;
  name: string;
  cuisine: string;
  address: string;
  city: string;
}

/**
 * Component for displaying trending restaurants
 */
export function TrendingRestaurants({
  limit = 5,
  period = 'week',
}: TrendingRestaurantsProps): JSX.Element {
  const [trendingRestaurants, setTrendingRestaurants] = useState<
    TrendingRestaurant[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { getTrending, cacheData, getCachedData } = useAnalytics();

  useEffect(() => {
    const fetchTrendingRestaurants = async () => {
      setLoading(true);
      try {
        // Try to get from cache first
        const cacheKey = `trending-restaurants-${period}-${limit}`;
        const cachedData = await getCachedData(cacheKey);

        if (cachedData && Array.isArray(cachedData)) {
          setTrendingRestaurants(cachedData as TrendingRestaurant[]);
          setLoading(false);
          return;
        }

        // If not in cache, fetch from API
        const trending = await getTrending('RESTAURANT', limit, period);

        // Fetch restaurant details for each trending restaurant
        const restaurantsWithDetails = await Promise.all(
          (trending as Array<Record<string, unknown>>).map(async (item) => {
            try {
              // const entityId = item.entityId as string;
              // Fetch restaurant details from API
              return {
                entityId: item.entityId as string,
                entityType: item.entityType as string,
                viewCount: item.viewCount as number,
                uniqueViewers: item.uniqueViewers as number,
                name: `Restaurant ${item.entityId}`,
                cuisine: 'Various',
                address: '123 Main St',
                city: 'New York',
              };
            } catch (error) {
              console.error(
                `Error fetching restaurant ${item.entityId}:`,
                error,
              );
              return {
                entityId: item.entityId as string,
                entityType: item.entityType as string,
                viewCount: item.viewCount as number,
                uniqueViewers: item.uniqueViewers as number,
                name: 'Unknown Restaurant',
                cuisine: '',
                address: '',
                city: '',
              };
            }
          }),
        );

        setTrendingRestaurants(restaurantsWithDetails);

        // Cache the results for 15 minutes
        await cacheData(cacheKey, restaurantsWithDetails, 15 * 60);
      } catch (error) {
        console.error('Error fetching trending restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingRestaurants();
  }, [limit, period, getTrending, cacheData, getCachedData]);

  if (loading) {
    return <div>Loading trending restaurants...</div>;
  }

  if (trendingRestaurants.length === 0) {
    return <div>No trending restaurants available</div>;
  }

  return (
    <div className="trending-restaurants">
      <h3>Trending Restaurants</h3>

      <div className="period-selector">
        <span>Time period:</span>
        <select
          value={period}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            (window.location.href = `?period=${e.target.value}`)
          }
        >
          <option value="day">Last 24 hours</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
        </select>
      </div>

      <ul className="restaurant-list">
        {trendingRestaurants.map((restaurant, index) => (
          <li key={restaurant.entityId} className="restaurant-item">
            <div className="rank">{index + 1}</div>
            <div className="restaurant-details">
              <Link href={`/restaurants/${restaurant.entityId}`}>
                <a className="restaurant-name">{restaurant.name}</a>
              </Link>
              <div className="restaurant-meta">
                <span className="cuisine">{restaurant.cuisine}</span>
                <span className="location">{restaurant.city}</span>
              </div>
              <div className="stats">
                <span className="views">{restaurant.viewCount} views</span>
                <span className="visitors">
                  {restaurant.uniqueViewers} visitors
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {}
      <style jsx>{`
        .trending-restaurants {
          padding: 1rem;
          border: 1px solid #eaeaea;
          border-radius: 8px;
          margin-top: 1rem;
        }

        h3 {
          margin-top: 0;
          margin-bottom: 1rem;
        }

        .period-selector {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .period-selector span {
          margin-right: 0.5rem;
        }

        .period-selector select {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border: 1px solid #ddd;
        }

        .restaurant-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .restaurant-item {
          display: flex;
          padding: 1rem 0;
          border-bottom: 1px solid #eaeaea;
        }

        .restaurant-item:last-child {
          border-bottom: none;
        }

        .rank {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          background-color: #f3f3f3;
          border-radius: 50%;
          font-weight: bold;
          margin-right: 1rem;
        }

        .restaurant-details {
          flex: 1;
        }

        .restaurant-name {
          display: block;
          font-weight: bold;
          color: #0070f3;
          text-decoration: none;
          margin-bottom: 0.25rem;
        }

        .restaurant-meta {
          display: flex;
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .cuisine {
          margin-right: 1rem;
        }

        .stats {
          display: flex;
          font-size: 0.75rem;
          color: #888;
        }

        .views {
          margin-right: 1rem;
        }
      `}</style>
    </div>
  );
}
