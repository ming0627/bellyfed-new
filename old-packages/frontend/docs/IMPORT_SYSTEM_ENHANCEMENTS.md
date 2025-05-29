# Bellyfed Import System Enhancements

This document outlines recommendations for expanding the Bellyfed bulk data import system beyond restaurants and dishes to support additional data types and improve performance.

## 1. Additional Import Types

### 1.1 Menu Imports

Menus represent a collection of dishes organized by categories, which can be imported as a separate entity.

**Schema Modifications:**

```prisma
// Menu model
model Menu {
  id             String    @id @default(uuid()) @map("menu_id")
  restaurantId   String    @map("restaurant_id")
  name           String
  description    String?
  type           String?   // e.g., "Lunch", "Dinner", "Brunch"
  availability   Json?     // Days and times when the menu is available
  isActive       Boolean   @default(true) @map("is_active")
  startDate      DateTime? @map("start_date")
  endDate        DateTime? @map("end_date")
  categories     Json?     // Array of category names and descriptions
  dataSource     String?   @default("USER_CREATED") @map("data_source")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  // Relations
  restaurant     Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  menuItems      MenuItem[]
  importedFrom   ImportedMenu[]

  @@index([restaurantId])
  @@map("menus")
}

// MenuItem model
model MenuItem {
  id             String    @id @default(uuid()) @map("menu_item_id")
  menuId         String    @map("menu_id")
  dishId         String?   @map("dish_id")
  name           String
  description    String?
  price          Decimal?  @db.Decimal(10, 2)
  category       String?
  position       Int?      // For ordering items within a category
  isAvailable    Boolean   @default(true) @map("is_available")
  specialTags    Json?     @map("special_tags") // e.g., "Spicy", "Vegetarian", "Gluten-Free"
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  // Relations
  menu           Menu      @relation(fields: [menuId], references: [id], onDelete: Cascade)
  dish           Dish?     @relation(fields: [dishId], references: [id])

  @@index([menuId])
  @@index([dishId])
  @@map("menu_items")
}

// Imported Menu model
model ImportedMenu {
  id             String    @id @default(uuid()) @map("import_id")
  menuId         String    @map("menu_id")
  restaurantId   String    @map("restaurant_id")
  sourceId       String    @map("source_id")
  externalId     String    @map("external_id")
  importDate     DateTime  @default(now()) @map("import_date")
  lastUpdated    DateTime  @default(now()) @map("last_updated")
  rawData        Json?     @map("raw_data")
  status         String    @default("ACTIVE")
  confidenceScore Decimal? @map("confidence_score") @db.Decimal(5, 2)
  matchMethod    String?   @map("match_method")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  // Relations
  menu           Menu @relation(fields: [menuId], references: [id], onDelete: Cascade)
  source         ExternalDataSource @relation(fields: [sourceId], references: [id], onDelete: Cascade)

  @@unique([menuId, sourceId], name: "unique_menu_source")
  @@map("imported_menus")
}
```

### 1.2 Review Imports

Importing reviews from external sources can enrich the platform with more user feedback.

**Schema Modifications:**

```prisma
// Add to the existing Review model
model Review {
  // ... existing fields

  externalSource String?   @map("external_source")
  externalId     String?   @map("external_id")
  verificationStatus String? @map("verification_status")

  // Add relation to ImportedReview
  importedFrom   ImportedReview?
}

// Imported Review model
model ImportedReview {
  id             String    @id @default(uuid()) @map("import_id")
  reviewId       String    @unique @map("review_id")
  restaurantId   String    @map("restaurant_id")
  sourceId       String    @map("source_id")
  externalId     String    @map("external_id")
  externalAuthor String?   @map("external_author")
  importDate     DateTime  @default(now()) @map("import_date")
  lastUpdated    DateTime  @default(now()) @map("last_updated")
  rawData        Json?     @map("raw_data")
  status         String    @default("ACTIVE")
  sentimentScore Decimal?  @map("sentiment_score") @db.Decimal(5, 2)
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  // Relations
  review         Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  source         ExternalDataSource @relation(fields: [sourceId], references: [id], onDelete: Cascade)

  @@index([restaurantId])
  @@index([sourceId])
  @@index([externalId])
  @@map("imported_reviews")
}
```

### 1.3 Special Offers and Promotions

Import special offers, deals, and promotions from external sources.

**Schema Modifications:**

```prisma
// Special Offer model
model SpecialOffer {
  id             String    @id @default(uuid()) @map("offer_id")
  restaurantId   String    @map("restaurant_id")
  title          String
  description    String
  discountType   String    @map("discount_type") // "Percentage", "FixedAmount", "BuyOneGetOne", etc.
  discountValue  Decimal?  @db.Decimal(10, 2) @map("discount_value")
  startDate      DateTime  @map("start_date")
  endDate        DateTime  @map("end_date")
  isActive       Boolean   @default(true) @map("is_active")
  termsConditions String?  @map("terms_conditions")
  redemptionCode String?   @map("redemption_code")
  imageUrl       String?   @map("image_url")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  // Relations
  restaurant     Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  importedFrom   ImportedOffer?

  @@index([restaurantId])
  @@index([startDate, endDate])
  @@map("special_offers")
}

// Imported Offer model
model ImportedOffer {
  id             String    @id @default(uuid()) @map("import_id")
  offerId        String    @unique @map("offer_id")
  restaurantId   String    @map("restaurant_id")
  sourceId       String    @map("source_id")
  externalId     String    @map("external_id")
  importDate     DateTime  @default(now()) @map("import_date")
  lastUpdated    DateTime  @default(now()) @map("last_updated")
  rawData        Json?     @map("raw_data")
  status         String    @default("ACTIVE")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  // Relations
  offer          SpecialOffer @relation(fields: [offerId], references: [id], onDelete: Cascade)
  source         ExternalDataSource @relation(fields: [sourceId], references: [id], onDelete: Cascade)

  @@index([restaurantId])
  @@index([sourceId])
  @@map("imported_offers")
}
```

## 2. Server Actions Modifications

### 2.1 Enhanced Import Job Creation

```typescript
// Add to imports.ts
export async function createMenuImportJob(formData: FormData) {
  // Similar to createImportJob but with jobType = 'MENU'
}

export async function createReviewImportJob(formData: FormData) {
  // Similar to createImportJob but with jobType = 'REVIEW'
}

export async function createOfferImportJob(formData: FormData) {
  // Similar to createImportJob but with jobType = 'OFFER'
}
```

### 2.2 Import Type Enum

```typescript
// Update the ImportEventType enum in outbox/index.ts
export enum ImportEventType {
  // Existing types
  IMPORT_JOB_CREATED = 'IMPORT_JOB_CREATED',
  IMPORT_JOB_UPDATED = 'IMPORT_JOB_UPDATED',
  IMPORT_JOB_COMPLETED = 'IMPORT_JOB_COMPLETED',
  IMPORT_JOB_FAILED = 'IMPORT_JOB_FAILED',
  IMPORT_BATCH_CREATED = 'IMPORT_BATCH_CREATED',
  IMPORT_BATCH_COMPLETED = 'IMPORT_BATCH_COMPLETED',
  IMPORT_BATCH_FAILED = 'IMPORT_BATCH_FAILED',
  RESTAURANT_IMPORTED = 'RESTAURANT_IMPORTED',
  DISH_IMPORTED = 'DISH_IMPORTED',

  // New types
  MENU_IMPORTED = 'MENU_IMPORTED',
  REVIEW_IMPORTED = 'REVIEW_IMPORTED',
  OFFER_IMPORTED = 'OFFER_IMPORTED',
}
```

## 3. Lambda Function Modifications

### 3.1 Batch Processor Enhancements

```typescript
// Add to batch-processor/index.ts
async function processMenuData(
  data: any[],
  sourceId: string,
  dbCredentials: any,
) {
  // Similar to processRestaurantData but for menus
}

async function processReviewData(
  data: any[],
  sourceId: string,
  dbCredentials: any,
) {
  // Similar to processRestaurantData but for reviews
}

async function processOfferData(
  data: any[],
  sourceId: string,
  dbCredentials: any,
) {
  // Similar to processRestaurantData but for offers
}

// Update the handler function to handle new job types
if (job.jobType === 'MENU') {
  const results = await processMenuData(
    importEvent.data,
    job.sourceId,
    dbCredentials,
  );
  // ...
} else if (job.jobType === 'REVIEW') {
  const results = await processReviewData(
    importEvent.data,
    job.sourceId,
    dbCredentials,
  );
  // ...
} else if (job.jobType === 'OFFER') {
  const results = await processOfferData(
    importEvent.data,
    job.sourceId,
    dbCredentials,
  );
  // ...
}
```

### 3.2 EventBridge Rules

```typescript
// Add to import-stack.ts
const menuImportRule = new events.Rule(this, 'MenuImportRule', {
  eventBus,
  ruleName: `menu-import-rule-${environment}`,
  description: 'Rule for menu import events',
  eventPattern: {
    source: ['bellyfed.import'],
    detailType: ['MENU_IMPORTED'],
  },
});

const reviewImportRule = new events.Rule(this, 'ReviewImportRule', {
  eventBus,
  ruleName: `review-import-rule-${environment}`,
  description: 'Rule for review import events',
  eventPattern: {
    source: ['bellyfed.import'],
    detailType: ['REVIEW_IMPORTED'],
  },
});

const offerImportRule = new events.Rule(this, 'OfferImportRule', {
  eventBus,
  ruleName: `offer-import-rule-${environment}`,
  description: 'Rule for offer import events',
  eventPattern: {
    source: ['bellyfed.import'],
    detailType: ['OFFER_IMPORTED'],
  },
});

// Add targets
menuImportRule.addTarget(new targets.SqsQueue(this.importQueue));
reviewImportRule.addTarget(new targets.SqsQueue(this.importQueue));
offerImportRule.addTarget(new targets.SqsQueue(this.importQueue));
```

## 4. Performance Optimizations

### 4.1 Batch Size Tuning

- Implement dynamic batch sizing based on data complexity
- Add configuration for batch size in environment variables
- Implement backoff strategy for failed batches

### 4.2 Parallel Processing

- Implement parallel processing of batches using AWS Step Functions
- Use SQS FIFO queues for ordered processing when necessary
- Implement fan-out pattern for large imports

### 4.3 Database Optimizations

- Implement bulk insert operations for better performance
- Use database transactions for atomic operations
- Implement connection pooling for database operations

### 4.4 Monitoring and Alerting

- Add custom metrics for import performance
- Create dashboards for import system health
- Implement alerting for failed imports and performance degradation

## 5. Next Steps

1. Implement schema changes for new import types
2. Update Server Actions to support new import types
3. Enhance Lambda functions to process new data types
4. Add EventBridge rules for new event types
5. Implement performance optimizations
6. Update documentation and user interface
