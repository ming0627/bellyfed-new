import {
  PaymentInfo,
  PaymentType,
  ParkingInfo,
  SeatingInfo,
  WifiInfo,
} from '../types';

// Standard facilities info for establishments
export const standardFacilities = {
  parking: {
    available: true,
    details: 'Street parking available',
  } as ParkingInfo,
  wifi: {
    available: true,
    details: 'Free WiFi for customers',
  } as WifiInfo,
  seating: {
    capacity: 20,
    details: 'Indoor seating',
  } as SeatingInfo,
  payment: {
    methods: [
      PaymentType.CASH,
      PaymentType.TOUCH_N_GO,
      PaymentType.CREDIT_CARD,
    ],
    details: 'All major payment methods accepted',
  } as PaymentInfo,
};
