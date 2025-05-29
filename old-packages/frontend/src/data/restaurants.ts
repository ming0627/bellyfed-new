import {
  EstablishmentType,
  FoodEstablishment,
  PaymentType,
  ServiceType,
} from '@/types';

export const restaurants: FoodEstablishment[] = [
  {
    id: '1',
    name: 'Village Park Restaurant',
    type: EstablishmentType.RESTAURANT,
    /* description: 'Famous for its Nasi Lemak and traditional Malaysian dishes', */
    cuisineTypes: ['Malaysian', 'Halal'],
    priceRange: '$$',
    contact: {
      phone: '+60312345678',
      email: 'info@villagepark.com',
      website: 'https://villagepark.com',
    },
    facilities: {
      parking: {
        available: true,
        details: 'Free parking available',
      },
      wifi: {
        available: true,
        details: 'Free WiFi for customers',
      },
      seating: {
        capacity: 100,
        details: 'Indoor and outdoor seating available',
      },
      payment: {
        methods: [PaymentType.CASH, PaymentType.CARD, PaymentType.E_WALLET],
        details: 'All major cards accepted',
      },
    },
    services: [
      {
        type: ServiceType.DINE_IN,
        available: true,
        details: 'Comfortable dining area with air conditioning',
      },
      {
        type: ServiceType.TAKEOUT,
        available: true,
        details: 'Call ahead for faster pickup',
      },
      {
        type: ServiceType.DELIVERY,
        available: true,
        details: 'Available through food delivery apps',
      },
    ],
    isCurrentlyOperating: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'Ah Weng Koh',
    type: EstablishmentType.RESTAURANT,
    /* description: 'Traditional kopitiam serving authentic Malaysian Chinese cuisine', */
    cuisineTypes: ['Chinese', 'Malaysian'],
    priceRange: '$',
    contact: {
      phone: '+60387654321',
      email: 'contact@ahwengkoh.com',
    },
    facilities: {
      parking: {
        available: true,
        details: 'Street parking available',
      },
      wifi: {
        available: false,
      },
      seating: {
        capacity: 50,
        details: 'Traditional kopitiam style seating',
      },
      payment: {
        methods: [PaymentType.CASH, PaymentType.E_WALLET],
        details: 'Cash and e-wallet only',
      },
    },
    services: [
      {
        type: ServiceType.DINE_IN,
        available: true,
        details: 'Traditional kopitiam atmosphere',
      },
      {
        type: ServiceType.TAKEOUT,
        available: true,
        details: 'Quick takeaway service',
      },
    ],
    isCurrentlyOperating: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    name: "Raju's Corner",
    type: EstablishmentType.RESTAURANT,
    /* description: 'Popular Indian restaurant known for its Roti Canai and Mamak dishes', */
    cuisineTypes: ['Indian', 'Malaysian', 'Halal'],
    priceRange: '$',
    contact: {
      phone: '+60391234567',
      email: 'info@rajuscorner.com',
    },
    facilities: {
      parking: {
        available: true,
        details: 'Limited parking available',
      },
      wifi: {
        available: true,
        details: 'Free WiFi available',
      },
      seating: {
        capacity: 80,
        details: 'Indoor and outdoor seating',
      },
      payment: {
        methods: [PaymentType.CASH, PaymentType.CARD, PaymentType.E_WALLET],
        details: 'All payment methods accepted',
      },
    },
    services: [
      {
        type: ServiceType.DINE_IN,
        available: true,
        details: '24-hour dining service',
      },
      {
        type: ServiceType.TAKEOUT,
        available: true,
        details: 'Takeaway available',
      },
      {
        type: ServiceType.DELIVERY,
        available: true,
        details: 'Delivery through partner services',
      },
      {
        type: ServiceType.CATERING,
        available: true,
        details: 'Catering for events and parties',
      },
    ],
    isCurrentlyOperating: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];
