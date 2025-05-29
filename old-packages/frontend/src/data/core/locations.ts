import { Location, LocationInfo } from '../../types';

// KL outlet location info
const klLocationInfo: LocationInfo = {
  address: 'Lot 123, Level 3, Pavilion Kuala Lumpur',
  city: 'Kuala Lumpur',
  state: 'Wilayah Persekutuan',
  country: 'Malaysia',
  postalCode: '55100',
  coordinates: {
    latitude: 3.1488,
    longitude: 101.7133,
  },
};

// PJ outlet location info
const pjLocationInfo: LocationInfo = {
  address: '1 Utama Shopping Centre, Level G',
  city: 'Petaling Jaya',
  state: 'Selangor',
  country: 'Malaysia',
  postalCode: '47800',
  coordinates: {
    latitude: 3.1502,
    longitude: 101.6158,
  },
};

// KL outlet location
export const klOutletLocation: Location = {
  name: 'Pavilion KL Outlet',
  info: klLocationInfo,
};

// PJ outlet location
export const pjOutletLocation: Location = {
  name: '1 Utama Outlet',
  info: pjLocationInfo,
};
