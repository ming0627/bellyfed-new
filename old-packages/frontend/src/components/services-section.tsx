import React from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ServiceInfo } from '@/types';

interface ServicesSectionProps {
  services?: ServiceInfo[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
}) => {
  // Early return if services is undefined or empty
  if (!services?.length) {
    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700">Services</h4>
        <div className="text-muted-foreground">
          No services information available.
        </div>
      </div>
    );
  }

  const availableServices = services.filter((service) => service?.available);

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-700">Services</h4>
      <div className="flex flex-wrap gap-2">
        {availableServices.map((service, index) => (
          <TooltipProvider key={`service-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className="bg-orange-50 text-orange-700 hover:bg-orange-100 cursor-help"
                >
                  {service.type}
                </Badge>
              </TooltipTrigger>
              {service.details && (
                <TooltipContent side="bottom" align="center">
                  <p className="text-sm">{service.details}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};
