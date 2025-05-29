import { EstablishmentType, FoodEstablishment } from '../types';
import { mixueOrganization } from './core/organizations';
import { standardFacilities } from './core/facilities';
import { klOutletLocation, pjOutletLocation } from './core/locations';

// Mixue establishment with multiple locations
export const mixueEstablishment: FoodEstablishment = {
  id: 'est_mixue_my',
  name: 'Mixue Malaysia',
  type: EstablishmentType.RESTAURANT,
  description: 'Malaysian operations of Mixue Ice Cream & Tea',
  cuisineTypes: ['Beverages', 'Desserts'],
  priceRange: '$',
  organization: mixueOrganization,
  facilities: standardFacilities,
  isCurrentlyOperating: true,
  locations: [klOutletLocation, pjOutletLocation],
  contact: {
    phone: '+60 3-2118 8888',
    email: 'support@mixue.my',
    website: 'https://mixue.my',
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};
