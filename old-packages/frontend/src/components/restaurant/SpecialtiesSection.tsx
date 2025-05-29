import { Utensils } from 'lucide-react';

import { ServicesSection } from '@/components/services-section';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ServiceInfo } from '@/types';

interface SpecialtiesSectionProps {
  cuisineTypes: string[];
  services: ServiceInfo[];
}

export function SpecialtiesSection({
  cuisineTypes,
  services,
}: SpecialtiesSectionProps): JSX.Element {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-red-600 flex items-center gap-2">
          <Utensils className="w-5 h-5" />
          Specialties & Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cuisine Types */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Cuisine Types</h4>
            <div className="flex flex-wrap gap-2">
              {cuisineTypes.map((type) => (
                <Badge
                  key={type}
                  variant="outline"
                  className="bg-orange-50 border-orange-200 text-gray-700"
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Services Sections */}
          <ServicesSection services={services} />
        </div>
      </CardContent>
    </Card>
  );
}
