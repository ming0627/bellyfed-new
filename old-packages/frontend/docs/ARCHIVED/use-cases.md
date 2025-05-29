# Food Establishment Use Cases

This document outlines the various types of food establishments supported in our system and their implementations.

## 1. Food Courts

### 1.1 Modern Food Court (Sunway Velocity Case)

A modern food court setup typically found in shopping malls.

**Key Characteristics:**

- Multiple stalls with mixed ownership (franchise and independent)
- Centralized seating and facilities
- Standard mall operating hours
- Modern payment methods

**Implementation Details:**

```typescript
interface FoodCourt {
  name: string;
  location: Location;
  operatingHours: {
    startTime: TimeString;
    endTime: TimeString;
  };
  stalls: FoodEstablishment[];
  facilities: {
    parking?: ParkingInfo;
    wifi?: WifiInfo;
    seating?: SeatingInfo;
    payment?: PaymentInfo;
  };
}
```

**Example Stalls:**

- Franchise: Mixue (Desserts)
- Independent: Nasi Lemak Rose
- Independent: Uncle's Chicken Rice

### 1.2 Kopitiam (Old Town White Coffee Case)

Traditional Malaysian coffee shop setup with modern franchise management.

**Key Characteristics:**

- Operated by a main franchise (e.g., Old Town)
- Mix of franchise-operated and tenant stalls
- Extended operating hours (early morning to late night)
- Traditional kopitiam atmosphere with modern amenities

**Implementation Details:**

```typescript
// Uses the same FoodCourt interface but with specific business rules:
- Main organization must be present
- Operating hours typically 7am-11pm
- Must have signature beverage stall
```

**Example Stalls:**

- Franchise: Old Town White Coffee (Beverages)
- Tenant: Local Food Stalls
- Tenant: Specialty Dishes

## 2. Mobile Vendors

### 2.1 Food Trucks

Mobile food establishments that can operate in different locations.

**Key Characteristics:**

- Vehicle information
- Location tracking
- Flexible operating hours
- Event participation

**Implementation Details:**

```typescript
interface MobileVendorInfo {
  vehicleInfo: {
    registrationNumber: string;
    make: string;
    model: string;
    year: string;
  };
  tracking?: VendorTracking;
  schedules: VendorSchedule[];
}
```

### 2.2 Pasar Malam Stalls

Night market stalls that operate on specific days at specific locations.

**Key Characteristics:**

- Fixed schedule at specific markets
- Simple setup
- Cash-focused operations
- Part of larger market events

**Implementation Details:**

```typescript
interface MobileVendorInfo {
  marketId: string;
  marketInfo: {
    stallNumber: string;
    category: string;
  };
  schedules: VendorSchedule[];
}
```

## 3. Shared Components

### 3.1 Stationary Vendor Info

Used by food court and kopitiam stalls.

```typescript
interface StationaryVendorInfo {
  stallNumber: string;
  floor?: string;
  section?: string;
  operatingHours: {
    startTime: TimeString;
    endTime: TimeString;
  };
  category?: string;
}
```

### 3.2 Common Facilities

Shared facilities information used across different establishment types.

```typescript
interface Facilities {
  parking?: ParkingInfo;
  wifi?: WifiInfo;
  seating?: SeatingInfo;
  payment?: PaymentInfo;
}
```

## 4. Business Rules

### 4.1 Food Courts

- Must have defined operating hours
- Must have at least one stall
- Must have seating facilities
- Must have defined payment methods

### 4.2 Kopitiams

- Must have a main organization
- Must have extended operating hours
- Must have at least one beverage stall
- Must support both cash and modern payments

### 4.3 Food Trucks

- Must have valid vehicle information
- Must have defined regular spots or events
- Must have tracking information
- Must have contact methods

### 4.4 Pasar Malam Stalls

- Must have market association
- Must have defined operating schedule
- Must have stall number
- Must have category

## 5. Testing Strategy

Each establishment type has specific test cases:

1. **Basic Information**

   - Name, location, operating hours
   - Contact information
   - Facilities

2. **Stall/Vendor Validation**

   - Correct type assignment
   - Required information present
   - Operating hours compliance
   - Payment methods

3. **Organization/Franchise**

   - Proper association
   - Brand compliance
   - Standard facilities

4. **Specific Business Rules**
   - Operating hours
   - Required facilities
   - Category-specific requirements

## 6. Future Considerations

1. **Hybrid Operations**

   - Vendors operating in multiple formats
   - Seasonal location changes
   - Pop-up operations

2. **Digital Integration**

   - Online ordering
   - Delivery services
   - Digital payment systems

3. **Compliance**
   - Health certificates
   - Food safety ratings
   - Operating permits
