import { motion } from 'framer-motion';
import { ChevronRight, MapPin, Trophy, Utensils } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LucideClientIcon } from '@/components/ui/lucide-icon';

interface TopFoodiesProps {
  reviewers: Array<{
    name: string;
    badge: string;
    reviews: number;
    highlight: boolean;
  }>;
  dishes: Array<{
    dish: string;
    trend: string;
    votes: number;
    highlight: boolean;
  }>;
  locations: Array<{
    area: string;
    new: string;
    restaurants: number;
    highlight: boolean;
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
    <section className="py-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Top Foodies</h2>
          <p className="text-gray-500 mt-1">
            Meet our most active food enthusiasts and their discoveries
          </p>
        </div>
        <Link
          href={getCountryLink('/ranking')}
          className="text-orange-600 hover:text-orange-700 font-medium flex items-center"
        >
          View all rankings
          <LucideClientIcon icon={ChevronRight} className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Reviewers */}
        <motion.div layout>
          <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
                <LucideClientIcon
                  icon={Trophy}
                  className="w-5 h-5 text-orange-500"
                />
                Top {countryName} Reviewers
              </h3>
              <div className="space-y-3">
                {reviewers.map((user, index) => (
                  <motion.div
                    key={user.name}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      user.highlight
                        ? 'bg-gradient-to-r from-orange-100/50 to-transparent'
                        : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${
                        user.highlight
                          ? 'bg-orange-200 text-orange-700'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <motion.span
                          className="font-semibold"
                          animate={{
                            color: user.highlight ? '#C2410C' : '#1F2937',
                            transition: { duration: 0.5 },
                          }}
                        >
                          {user.name}
                        </motion.span>
                        <Badge
                          variant="secondary"
                          className={`transition-colors font-medium ${
                            user.highlight
                              ? 'bg-orange-200 text-orange-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {user.badge}
                        </Badge>
                      </div>
                      <motion.p
                        key={user.reviews}
                        className="text-sm font-medium"
                        animate={{
                          color: user.highlight ? '#C2410C' : '#6B7280',
                          transition: { duration: 0.5 },
                        }}
                      >
                        {user.reviews} reviews
                      </motion.p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trending Dishes */}
        <motion.div layout>
          <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-100">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                <LucideClientIcon
                  icon={Utensils}
                  className="w-5 h-5 text-yellow-500"
                />
                Trending {countryName} Dishes
              </h3>
              <div className="space-y-3">
                {dishes.map((item, index) => (
                  <motion.div
                    key={item.dish}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      item.highlight
                        ? 'bg-gradient-to-r from-amber-100/50 to-transparent'
                        : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${
                        item.highlight
                          ? 'bg-amber-200 text-amber-700'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <motion.span
                          className="font-semibold"
                          animate={{
                            color: item.highlight ? '#B45309' : '#1F2937',
                            transition: { duration: 0.5 },
                          }}
                        >
                          {item.dish}
                        </motion.span>
                        <Badge
                          variant="secondary"
                          className={`transition-colors font-medium ${
                            item.highlight
                              ? 'bg-amber-200 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.trend}
                        </Badge>
                      </div>
                      <motion.p
                        key={item.votes}
                        className="text-sm font-medium"
                        animate={{
                          color: item.highlight ? '#B45309' : '#6B7280',
                          transition: { duration: 0.5 },
                        }}
                      >
                        {item.votes} votes this week
                      </motion.p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Popular Locations */}
        <motion.div layout>
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <LucideClientIcon
                  icon={MapPin}
                  className="w-5 h-5 text-blue-500"
                />
                Popular Areas in {countryName}
              </h3>
              <div className="space-y-3">
                {locations.map((location, index) => (
                  <motion.div
                    key={location.area}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      location.highlight
                        ? 'bg-gradient-to-r from-sky-100/50 to-transparent'
                        : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${
                        location.highlight
                          ? 'bg-sky-200 text-sky-700'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <motion.span
                          className="font-semibold"
                          animate={{
                            color: location.highlight ? '#0369A1' : '#1F2937',
                            transition: { duration: 0.5 },
                          }}
                        >
                          {location.area}
                        </motion.span>
                        <Badge
                          variant="secondary"
                          className={`transition-colors font-medium ${
                            location.highlight
                              ? 'bg-sky-200 text-sky-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {location.new}
                        </Badge>
                      </div>
                      <motion.p
                        key={location.restaurants}
                        className="text-sm font-medium"
                        animate={{
                          color: location.highlight ? '#0369A1' : '#6B7280',
                          transition: { duration: 0.5 },
                        }}
                      >
                        {location.restaurants} restaurants
                      </motion.p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
