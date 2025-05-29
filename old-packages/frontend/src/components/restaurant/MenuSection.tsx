import { useQuery } from '@tanstack/react-query';
import { DollarSign, Flame } from 'lucide-react';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';

import { DishVoting } from '@/components/dish/DishVoting';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DishTag, FoodEstablishment, MenuItem } from '@/types';

interface MenuSectionProps {
  restaurantId: string;
}

export function MenuSection({ restaurantId }: MenuSectionProps): JSX.Element {
  const { data: restaurant } = useQuery<FoodEstablishment>({
    queryKey: ['restaurant', restaurantId],
  });

  if (!restaurant?.menus?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No menu available.</p>
        </CardContent>
      </Card>
    );
  }

  // Generate a unique ID for dishes that don't have one
  const generateDishId = (dish: MenuItem): string => {
    return dish.id || `dish-${uuidv4()}`;
  };

  // Render spicy level indicators
  const renderSpicyLevel = (level?: number): JSX.Element | null => {
    if (!level) return null;

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: level }).map((_, i) => (
          <Flame key={i} className="w-4 h-4 text-red-500" />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {restaurant.menus.map((menu) => (
        <div key={menu.title || menu.id}>
          <h3 className="text-lg font-semibold mb-4">{menu.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menu.sections?.map((section) => (
              <div key={section.id || section.title} className="space-y-4">
                <h4 className="font-medium text-gray-700">{section.title}</h4>
                {section.description && (
                  <p className="text-sm text-gray-500">{section.description}</p>
                )}
                <div className="space-y-4">
                  {section.items?.map((item) => (
                    <Card
                      key={item.id || item.name}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row">
                        {item.image && (
                          <div className="w-full md:w-1/3 h-32 md:h-auto relative">
                            <Image
                              src={
                                typeof item.image === 'string'
                                  ? item.image
                                  : `https://${item.image.bucket}.s3.${item.image.region}.amazonaws.com/${item.image.key}`
                              }
                              alt={item.name}
                              width={300}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-semibold">{item.name}</h5>
                              <div className="flex items-center gap-2 mt-1">
                                {item.price && (
                                  <div className="flex items-center text-gray-700">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    {item.price.toFixed(2)}
                                  </div>
                                )}
                                {renderSpicyLevel(item.spicyLevel)}
                                {item.dietaryOptions?.isVegetarian && (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200"
                                  >
                                    Vegetarian
                                  </Badge>
                                )}
                                {item.dishTags?.includes(DishTag.SIGNATURE) && (
                                  <Badge
                                    variant="outline"
                                    className="bg-orange-50 text-orange-700 border-orange-200"
                                  >
                                    Signature
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-sm text-gray-600 mt-2">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Dish Voting Component */}
                          <div className="mt-4">
                            <DishVoting
                              dishId={generateDishId(item)}
                              dishName={item.name}
                              restaurantId={restaurantId}
                              restaurantName={restaurant.name || ''}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
