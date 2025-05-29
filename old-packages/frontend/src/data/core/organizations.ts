import {
  BrandInfo,
  ContactInfo,
  LocationInfo,
  Organization,
} from '../../types';
import { Region, Territory } from '../../constants/regions';

// Brand information
export const mixueBrandInfo: BrandInfo = {
  logo: {
    bucket: 'brand-assets',
    region: 'ap-southeast-1',
    key: 'brands/mixue/logo.png',
  },
  primaryColor: '#00A0E9',
  secondaryColor: '#FFFFFF',
  slogan: 'I Love You, Mixue!',
  foundedYear: 1997,
  foundedLocation: 'Zhengzhou, China',
  story:
    'Founded in 1997, Mixue has grown from a small ice cream shop to a global beverage chain.',
  values: ['Quality', 'Innovation', 'Customer Satisfaction'],
  awards: [
    {
      year: 2020,
      title: 'Best Franchise Brand',
    },
  ],
  socialMedia: [
    {
      platform: 'Facebook',
      handle: '@mixuemy',
      url: 'https://facebook.com/mixuemy',
    },
    {
      platform: 'Instagram',
      handle: '@mixue.my',
      url: 'https://instagram.com/mixue.my',
    },
  ],
};

// Common contact info for all Mixue outlets
export const mixueContactInfo: ContactInfo = {
  email: 'info@mixue.my',
  phone: '+60123456789',
  website: 'https://mixue.my',
};

// Headquarters location
export const headquartersLocation: LocationInfo = {
  address: 'Zhengzhou City, Henan Province',
  city: 'Zhengzhou',
  state: 'Henan',
  country: 'China',
  postalCode: '450000',
  coordinates: {
    latitude: 34.7472,
    longitude: 113.625,
  },
};

// Organization info (Mixue Group)
export const mixueOrganization: Organization = {
  id: 'org_mixue_global',
  name: 'Mixue Global',
  description: 'Global operations of Mixue Ice Cream & Tea',
  brandInfo: mixueBrandInfo,
  headquarters: headquartersLocation,
  operatingRegions: [Region.ASIA, Region.SOUTHEAST_ASIA, Region.EAST_ASIA],
  territories: [Territory.GLOBAL, Territory.CHINA, Territory.MALAYSIA],
  contact: mixueContactInfo,
  website: 'https://mixue.global',
  createdAt: '2018-01-01T00:00:00Z',
  updatedAt: '2023-06-15T12:00:00Z',
};

// Nasi Lemak franchise organization
export const nasiLemakMakTimOrganization: Organization = {
  id: 'nasi-lemak-mak-tim',
  name: 'Nasi Lemak Mak Tim',
  description:
    'A beloved Malaysian food establishment known for its authentic Nasi Lemak.',
  brandInfo: {
    logo: {
      bucket: 'brand-assets',
      region: 'ap-southeast-1',
      key: 'nasi-lemak-mak-tim/logo.png',
    },
    primaryColor: '#FF9900',
    secondaryColor: '#006633',
    slogan: 'The Original Taste of Malaysia',
    foundedYear: 1985,
    foundedLocation: 'Kuala Lumpur, Malaysia',
    story:
      'Started by Mak Tim in a small stall, now a household name in Malaysian cuisine.',
    values: [
      'Quality ingredients',
      'Traditional recipes',
      'Customer satisfaction',
    ],
  },
  headquarters: {
    address: 'Jalan Tun Razak',
    city: 'Kuala Lumpur',
    state: 'Wilayah Persekutuan',
    country: 'Malaysia',
    postalCode: '56100',
  },
  contact: {
    email: 'info@nasilemakmaktim.com',
    phone: '+60123456789',
    website: 'https://nasilemakmaktim.com',
  },
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-06-15T12:00:00Z',
};
