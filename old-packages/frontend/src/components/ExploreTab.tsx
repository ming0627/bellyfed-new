import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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

export function ExploreTab(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const filteredCategories = foodCategories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Explore Food Categories</h1>
      <Input
        type="search"
        placeholder="Search categories..."
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchTerm(e.target.value)
        }
        className="w-full mb-6"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map((category) => (
          <Card
            key={category.id}
            onClick={() => router.push(`/menu-item-rankings/${category.id}`)}
          >
            <Image
              src="/bellyfed.png"
              alt={category.name}
              width={300}
              height={300}
              className="w-full h-40 object-cover"
            />
            <CardContent className="p-2">
              <h3 className="font-semibold text-sm">{category.name}</h3>
              <p className="text-xs text-gray-500">1000+ reviews</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
