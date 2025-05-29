import {
  AdditionalInfo,
  PaymentType,
  ParkingInfo,
  WifiInfo,
  SeatingInfo,
  PaymentInfo,
} from '../../types';

// Individual facility configurations for better reusability and type safety
export const defaultParking: ParkingInfo = {
  available: true,
  details: 'Available at shopping mall',
};

export const defaultWifi: WifiInfo = {
  available: true,
  details: 'Free Wi-Fi for customers',
};

export const defaultSeating: SeatingInfo = {
  capacity: 30,
  details: 'Indoor and outdoor seating available',
};

export const defaultPayment: PaymentInfo = {
  methods: [
    PaymentType.CASH,
    PaymentType.CREDIT_CARD,
    PaymentType.DEBIT_CARD,
    PaymentType.GRABPAY,
  ],
  details: 'All major payment methods accepted',
};

// Standard facilities configuration with type safety
export const standardFacilities: AdditionalInfo = {
  parking: defaultParking,
  wifi: defaultWifi,
  seating: defaultSeating,
  payment: defaultPayment,
};
