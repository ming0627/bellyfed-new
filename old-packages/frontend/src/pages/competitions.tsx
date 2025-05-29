import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import React, { useState } from 'react';

const foodCategories = [
  { id: 'category1', name: 'Nasi Lemak' },
  { id: 'category2', name: 'Char Kway Teow' },
  { id: 'category3', name: 'Roti Canai' },
  { id: 'category4', name: 'Laksa' },
  { id: 'category5', name: 'Satay' },
  { id: 'category6', name: 'Burger' },
  { id: 'category7', name: 'Pizza' },
  { id: 'category8', name: 'Sushi' },
];

export default function CompetitionsPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState('competitions');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsContent value="competitions">
        <h2 className="text-2xl font-bold mb-4 text-orange-800 dark:text-orange-200">
          Active Competitions
        </h2>
        {foodCategories.slice(0, 3).map((category, i) => (
          <Card
            key={i}
            className="mb-4 bg-white/80 dark:bg-orange-950/80 backdrop-blur-sm"
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Best {category.name} Challenge
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-orange-500 to-orange-700 text-white"
                >
                  2 days left
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">
                Rank and review the best {category.name.toLowerCase()} in town.
                Top 3 reviewers win exclusive foodie experiences!
              </p>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, j) => (
                    <Avatar key={j} className="border-2 border-background">
                      <AvatarImage
                        src={`https://source.unsplash.com/random/100x100?face&${
                          i * 4 + j
                        }`}
                      />
                      <AvatarFallback className="bg-orange-200 text-orange-800">
                        TR{j + 1}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-sm text-gray-500">128 participants</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Join Competition</Button>
            </CardFooter>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
}
