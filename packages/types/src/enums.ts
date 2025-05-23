/**
 * Enums for the application
 * This file contains enum definitions used throughout the application
 */

/**
 * Establishment types
 */
export enum EstablishmentType {
  RESTAURANT = 'RESTAURANT',
  FOOD_COURT_STALL = 'FOOD_COURT_STALL',
  FOOD_TRUCK = 'FOOD_TRUCK',
  POP_UP_STALL = 'POP_UP_STALL',
  GHOST_KITCHEN = 'GHOST_KITCHEN',
}

/**
 * Service types
 */
export enum ServiceType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY',
  DRIVE_THRU = 'DRIVE_THRU',
  OUTDOOR_SEATING = 'OUTDOOR_SEATING',
  RESERVATIONS = 'RESERVATIONS',
  CATERING = 'CATERING',
  PRIVATE_DINING = 'PRIVATE_DINING',
}

/**
 * Days of the week
 */
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

// VisitStatus is already defined in review.ts
