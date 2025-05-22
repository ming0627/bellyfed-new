import React from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Utensils, MapPin } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

interface TopFoodiesProps {
  reviewers: Array<{
    name: string;
    reviews: number;
    badge: string;
    highlight?: boolean;
  }>;
  dishes: Array<{
    name: string;
    votes: number;
    trend: string;
    highlight?: boolean;
  }>;
  locations: Array<{
    name: string;
    restaurants: number;
    new: string;
    highlight?: boolean;
  }>;
  countryName: string;
  getCountryLink: (path: string) => string;
}

export function TopFoodies({
  reviewers,
  dishes,
  locations,
  countryName,
  getCountryLink,
}: TopFoodiesProps): JSX.Element {
  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Reviewers */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <LucideClientIcon icon={Trophy} className="w-5 h-5 mr-2" />
                <h3 className="font-semibold">
                  Top Reviewers in {countryName}
                </h3>
              </div>
              <Link
                href={getCountryLink('/social')}
                className="text-sm text-blue-100 hover:text-white flex items-center"
              >
                View All
                <LucideClientIcon icon={ArrowRight} className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-100">
              {reviewers.map((reviewer, index) => (
                <li
                  key={index}
                  className={`py-3 flex items-center justify-between ${
                    reviewer.highlight ? 'animate-pulse bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm w-5">
                      {index + 1}
                    </span>
                    <span className="ml-3 font-medium">{reviewer.name}</span>
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {reviewer.badge}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-900 font-semibold">
                      {reviewer.reviews}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">reviews</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Top Dishes */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <LucideClientIcon icon={Utensils} className="w-5 h-5 mr-2" />
                <h3 className="font-semibold">Top Dishes in {countryName}</h3>
              </div>
              <Link
                href={getCountryLink('/dish-restaurants')}
                className="text-sm text-orange-100 hover:text-white flex items-center"
              >
                View All
                <LucideClientIcon icon={ArrowRight} className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-100">
              {dishes.map((dish, index) => (
                <li
                  key={index}
                  className={`py-3 flex items-center justify-between ${
                    dish.highlight ? 'animate-pulse bg-orange-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm w-5">
                      {index + 1}
                    </span>
                    <span className="ml-3 font-medium">{dish.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-900 font-semibold">
                      {dish.votes}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">votes</span>
                    <span className="ml-2 text-xs text-green-600">
                      {dish.trend}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <LucideClientIcon icon={MapPin} className="w-5 h-5 mr-2" />
                <h3 className="font-semibold">Top Areas in {countryName}</h3>
              </div>
              <Link
                href={getCountryLink('/restaurants')}
                className="text-sm text-green-100 hover:text-white flex items-center"
              >
                View All
                <LucideClientIcon icon={ArrowRight} className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-100">
              {locations.map((location, index) => (
                <li
                  key={index}
                  className={`py-3 flex items-center justify-between ${
                    location.highlight ? 'animate-pulse bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm w-5">
                      {index + 1}
                    </span>
                    <span className="ml-3 font-medium">{location.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-900 font-semibold">
                      {location.restaurants}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      restaurants
                    </span>
                    <span className="ml-2 text-xs text-green-600">
                      {location.new}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
