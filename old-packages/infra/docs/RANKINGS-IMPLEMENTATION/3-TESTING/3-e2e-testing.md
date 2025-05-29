# 3. End-to-End Testing

This document outlines the end-to-end testing plan for the Rankings feature.

## Overview

End-to-end testing will verify that the entire Rankings feature works correctly from the user's perspective. These tests will simulate real user interactions and verify that the system behaves as expected.

## Implementation Tasks

### 1. User Flow Tests

- [ ] Create test for adding a ranking

    - File: `cypress/e2e/rankings/add-ranking.cy.ts`
    - Test the complete flow of adding a ranking
    - Verify that the ranking appears in the user's rankings

- [ ] Create test for updating a ranking

    - File: `cypress/e2e/rankings/update-ranking.cy.ts`
    - Test the complete flow of updating a ranking
    - Verify that the changes are reflected

- [ ] Create test for deleting a ranking
    - File: `cypress/e2e/rankings/delete-ranking.cy.ts`
    - Test the complete flow of deleting a ranking
    - Verify that the ranking is removed

### 2. Navigation Tests

- [ ] Create test for navigating to rankings pages
    - File: `cypress/e2e/rankings/navigation.cy.ts`
    - Test navigation to My Rankings page
    - Test navigation to Dish Rankings page
    - Test navigation to Restaurant Rankings page

### 3. Authentication Tests

- [ ] Create test for authenticated vs. unauthenticated views
    - File: `cypress/e2e/rankings/authentication.cy.ts`
    - Test access to rankings pages when logged in
    - Test access to rankings pages when logged out

## Implementation Details

### User Flow Tests

```typescript
// cypress/e2e/rankings/add-ranking.cy.ts
describe('Add Ranking', () => {
    beforeEach(() => {
        // Log in
        cy.login('testuser@example.com', 'password');

        // Intercept API calls
        cy.intercept('GET', '/api/dishes/slug/pasta-carbonara', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    id: 'dish-123',
                    name: 'Pasta Carbonara',
                    slug: 'pasta-carbonara',
                    restaurantId: 'restaurant-123',
                    restaurantName: 'Italian Restaurant',
                    category: 'Italian',
                    isVegetarian: false,
                    spicyLevel: 0,
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                },
            },
        }).as('getDish');

        cy.intercept('GET', '/api/rankings/my/pasta-carbonara', {
            statusCode: 404,
            body: {
                error: 'Ranking not found',
            },
        }).as('getUserRanking');

        cy.intercept('GET', '/api/rankings/local/pasta-carbonara*', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    dish: {
                        id: 'dish-123',
                        name: 'Pasta Carbonara',
                        slug: 'pasta-carbonara',
                        restaurantId: 'restaurant-123',
                        restaurantName: 'Italian Restaurant',
                        category: 'Italian',
                    },
                    rankings: [],
                    stats: {
                        totalRankings: 0,
                        ranks: {},
                        tasteStatuses: {
                            ACCEPTABLE: 0,
                            SECOND_CHANCE: 0,
                            DISSATISFIED: 0,
                        },
                    },
                },
                meta: {
                    pagination: {
                        page: 1,
                        pageSize: 10,
                        totalPages: 1,
                        totalItems: 0,
                    },
                },
            },
        }).as('getLocalRankings');

        cy.intercept('POST', '/api/rankings/my/pasta-carbonara', {
            statusCode: 201,
            body: {
                success: true,
                data: {
                    ranking: {
                        id: 'ranking-123',
                        userId: 'user-123',
                        dishId: 'dish-123',
                        restaurantId: 'restaurant-123',
                        dishType: 'Italian',
                        rank: 1,
                        tasteStatus: null,
                        notes: 'Great dish!',
                        photos: [],
                        createdAt: '2023-01-01T00:00:00Z',
                        updatedAt: '2023-01-01T00:00:00Z',
                    },
                    dish: {
                        id: 'dish-123',
                        name: 'Pasta Carbonara',
                        slug: 'pasta-carbonara',
                        restaurantId: 'restaurant-123',
                        restaurantName: 'Italian Restaurant',
                        category: 'Italian',
                    },
                },
            },
        }).as('createRanking');

        // Navigate to dish page
        cy.visit('/dish/pasta-carbonara');
        cy.wait('@getDish');
        cy.wait('@getUserRanking');
        cy.wait('@getLocalRankings');
    });

    it('should add a ranking with numerical rank', () => {
        // Click the "Add Your Ranking" button
        cy.contains('button', 'Add Your Ranking').click();

        // Verify that the form is displayed
        cy.contains('Add Ranking for Pasta Carbonara').should('be.visible');

        // Select numerical rank
        cy.get('input[type="radio"][name="rankingType"][value="rank"]').check();
        cy.get('input[type="radio"][name="rank"][value="1"]').check();

        // Add notes
        cy.get('textarea[name="notes"]').type('Great dish!');

        // Submit the form
        cy.contains('button', 'Save').click();

        // Wait for the API call
        cy.wait('@createRanking');

        // Verify that the ranking is displayed
        cy.contains('Your Ranking').should('be.visible');
        cy.contains('Rank: 1').should('be.visible');
        cy.contains('Great dish!').should('be.visible');
    });

    it('should add a ranking with taste status', () => {
        // Click the "Add Your Ranking" button
        cy.contains('button', 'Add Your Ranking').click();

        // Verify that the form is displayed
        cy.contains('Add Ranking for Pasta Carbonara').should('be.visible');

        // Select taste status
        cy.get('input[type="radio"][name="rankingType"][value="tasteStatus"]').check();
        cy.get('input[type="radio"][name="tasteStatus"][value="ACCEPTABLE"]').check();

        // Add notes
        cy.get('textarea[name="notes"]').type('Good dish!');

        // Submit the form
        cy.contains('button', 'Save').click();

        // Wait for the API call
        cy.wait('@createRanking');

        // Verify that the ranking is displayed
        cy.contains('Your Ranking').should('be.visible');
        cy.contains('ACCEPTABLE').should('be.visible');
        cy.contains('Good dish!').should('be.visible');
    });
});
```

### Navigation Tests

```typescript
// cypress/e2e/rankings/navigation.cy.ts
describe('Rankings Navigation', () => {
    beforeEach(() => {
        // Log in
        cy.login('testuser@example.com', 'password');
    });

    it('should navigate to My Rankings page', () => {
        // Intercept API calls
        cy.intercept('GET', '/api/rankings/my*', {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    {
                        id: 'ranking-1',
                        userId: 'user-123',
                        dishId: 'dish-123',
                        dishName: 'Pasta Carbonara',
                        dishSlug: 'pasta-carbonara',
                        restaurantId: 'restaurant-123',
                        restaurantName: 'Italian Restaurant',
                        dishType: 'Italian',
                        rank: 1,
                        notes: 'Great dish!',
                        photos: [],
                        createdAt: '2023-01-01T00:00:00Z',
                        updatedAt: '2023-01-01T00:00:00Z',
                    },
                ],
                meta: {
                    pagination: {
                        page: 1,
                        pageSize: 10,
                        totalPages: 1,
                        totalItems: 1,
                    },
                },
            },
        }).as('getUserRankings');

        // Navigate to My Rankings page
        cy.visit('/');
        cy.contains('My Rankings').click();

        // Verify that the page is loaded
        cy.url().should('include', '/my-rankings');
        cy.contains('h1', 'My Rankings').should('be.visible');

        // Wait for the API call
        cy.wait('@getUserRankings');

        // Verify that rankings are displayed
        cy.contains('Pasta Carbonara').should('be.visible');
        cy.contains('Italian Restaurant').should('be.visible');
        cy.contains('Rank: 1').should('be.visible');
    });

    it('should navigate to Dish Rankings page', () => {
        // Intercept API calls
        cy.intercept('GET', '/api/dishes/slug/pasta-carbonara', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    id: 'dish-123',
                    name: 'Pasta Carbonara',
                    slug: 'pasta-carbonara',
                    restaurantId: 'restaurant-123',
                    restaurantName: 'Italian Restaurant',
                    category: 'Italian',
                    isVegetarian: false,
                    spicyLevel: 0,
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                },
            },
        }).as('getDish');

        cy.intercept('GET', '/api/rankings/my/pasta-carbonara', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    ranking: {
                        id: 'ranking-123',
                        userId: 'user-123',
                        dishId: 'dish-123',
                        restaurantId: 'restaurant-123',
                        dishType: 'Italian',
                        rank: 1,
                        tasteStatus: null,
                        notes: 'Great dish!',
                        photos: [],
                        createdAt: '2023-01-01T00:00:00Z',
                        updatedAt: '2023-01-01T00:00:00Z',
                    },
                    dish: {
                        id: 'dish-123',
                        name: 'Pasta Carbonara',
                        slug: 'pasta-carbonara',
                        restaurantId: 'restaurant-123',
                        restaurantName: 'Italian Restaurant',
                        category: 'Italian',
                    },
                },
            },
        }).as('getUserRanking');

        cy.intercept('GET', '/api/rankings/local/pasta-carbonara*', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    dish: {
                        id: 'dish-123',
                        name: 'Pasta Carbonara',
                        slug: 'pasta-carbonara',
                        restaurantId: 'restaurant-123',
                        restaurantName: 'Italian Restaurant',
                        category: 'Italian',
                    },
                    rankings: [
                        {
                            id: 'ranking-123',
                            userId: 'user-123',
                            username: 'testuser',
                            rank: 1,
                            notes: 'Great dish!',
                            photoCount: 0,
                            createdAt: '2023-01-01T00:00:00Z',
                        },
                    ],
                    stats: {
                        totalRankings: 1,
                        averageRank: 1,
                        ranks: {
                            1: 1,
                            2: 0,
                            3: 0,
                            4: 0,
                            5: 0,
                        },
                        tasteStatuses: {
                            ACCEPTABLE: 0,
                            SECOND_CHANCE: 0,
                            DISSATISFIED: 0,
                        },
                    },
                },
                meta: {
                    pagination: {
                        page: 1,
                        pageSize: 10,
                        totalPages: 1,
                        totalItems: 1,
                    },
                },
            },
        }).as('getLocalRankings');

        // Navigate to Dish Rankings page
        cy.visit('/dish/pasta-carbonara');

        // Wait for the API calls
        cy.wait('@getDish');
        cy.wait('@getUserRanking');
        cy.wait('@getLocalRankings');

        // Verify that the page is loaded
        cy.url().should('include', '/dish/pasta-carbonara');
        cy.contains('h1', 'Pasta Carbonara').should('be.visible');
        cy.contains('Italian Restaurant').should('be.visible');

        // Verify that rankings are displayed
        cy.contains('Your Ranking').should('be.visible');
        cy.contains('Rank: 1').should('be.visible');
        cy.contains('Local Rankings').should('be.visible');
    });

    it('should navigate to Restaurant Rankings page', () => {
        // Intercept API calls
        cy.intercept('GET', '/api/restaurants/restaurant-123', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    id: 'restaurant-123',
                    name: 'Italian Restaurant',
                    address: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    country: 'USA',
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                },
            },
        }).as('getRestaurant');

        cy.intercept('GET', '/api/dishes*', {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    {
                        id: 'dish-123',
                        name: 'Pasta Carbonara',
                        slug: 'pasta-carbonara',
                        restaurantId: 'restaurant-123',
                        restaurantName: 'Italian Restaurant',
                        category: 'Italian',
                        isVegetarian: false,
                        spicyLevel: 0,
                        price: 15.99,
                        createdAt: '2023-01-01T00:00:00Z',
                        updatedAt: '2023-01-01T00:00:00Z',
                    },
                ],
                meta: {
                    pagination: {
                        page: 1,
                        pageSize: 20,
                        totalPages: 1,
                        totalItems: 1,
                    },
                },
            },
        }).as('getDishes');

        cy.intercept('GET', '/api/rankings/my*', {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    {
                        id: 'ranking-123',
                        userId: 'user-123',
                        dishId: 'dish-123',
                        restaurantId: 'restaurant-123',
                        dishType: 'Italian',
                        rank: 1,
                        tasteStatus: null,
                        notes: 'Great dish!',
                        photos: [],
                        createdAt: '2023-01-01T00:00:00Z',
                        updatedAt: '2023-01-01T00:00:00Z',
                    },
                ],
            },
        }).as('getUserRankings');

        // Navigate to Restaurant Rankings page
        cy.visit('/restaurant/restaurant-123');

        // Wait for the API calls
        cy.wait('@getRestaurant');
        cy.wait('@getDishes');
        cy.wait('@getUserRankings');

        // Verify that the page is loaded
        cy.url().should('include', '/restaurant/restaurant-123');
        cy.contains('h1', 'Italian Restaurant').should('be.visible');

        // Verify that dishes are displayed
        cy.contains('Pasta Carbonara').should('be.visible');
        cy.contains('$15.99').should('be.visible');
        cy.contains('Rank: 1').should('be.visible');
    });
});
```

### Authentication Tests

```typescript
// cypress/e2e/rankings/authentication.cy.ts
describe('Rankings Authentication', () => {
    it('should redirect to login when accessing My Rankings page while logged out', () => {
        // Navigate to My Rankings page
        cy.visit('/my-rankings');

        // Verify that the user is redirected to login
        cy.url().should('include', '/login');
        cy.contains('Login').should('be.visible');
    });

    it('should allow access to Dish Rankings page while logged out', () => {
        // Intercept API calls
        cy.intercept('GET', '/api/dishes/slug/pasta-carbonara', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    id: 'dish-123',
                    name: 'Pasta Carbonara',
                    slug: 'pasta-carbonara',
                    restaurantId: 'restaurant-123',
                    restaurantName: 'Italian Restaurant',
                    category: 'Italian',
                    isVegetarian: false,
                    spicyLevel: 0,
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                },
            },
        }).as('getDish');

        cy.intercept('GET', '/api/rankings/my/pasta-carbonara', {
            statusCode: 401,
            body: {
                error: 'Authentication required',
            },
        }).as('getUserRanking');

        cy.intercept('GET', '/api/rankings/local/pasta-carbonara*', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    dish: {
                        id: 'dish-123',
                        name: 'Pasta Carbonara',
                        slug: 'pasta-carbonara',
                        restaurantId: 'restaurant-123',
                        restaurantName: 'Italian Restaurant',
                        category: 'Italian',
                    },
                    rankings: [],
                    stats: {
                        totalRankings: 0,
                        ranks: {},
                        tasteStatuses: {
                            ACCEPTABLE: 0,
                            SECOND_CHANCE: 0,
                            DISSATISFIED: 0,
                        },
                    },
                },
                meta: {
                    pagination: {
                        page: 1,
                        pageSize: 10,
                        totalPages: 1,
                        totalItems: 0,
                    },
                },
            },
        }).as('getLocalRankings');

        // Navigate to Dish Rankings page
        cy.visit('/dish/pasta-carbonara');

        // Wait for the API calls
        cy.wait('@getDish');
        cy.wait('@getUserRanking');
        cy.wait('@getLocalRankings');

        // Verify that the page is loaded
        cy.url().should('include', '/dish/pasta-carbonara');
        cy.contains('h1', 'Pasta Carbonara').should('be.visible');

        // Verify that the "Add Your Ranking" button is not visible
        cy.contains('button', 'Add Your Ranking').should('not.exist');

        // Verify that the login prompt is visible
        cy.contains('Login to add your ranking').should('be.visible');
    });

    it('should show "Add Your Ranking" button when logged in', () => {
        // Log in
        cy.login('testuser@example.com', 'password');

        // Intercept API calls
        cy.intercept('GET', '/api/dishes/slug/pasta-carbonara', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    id: 'dish-123',
                    name: 'Pasta Carbonara',
                    slug: 'pasta-carbonara',
                    restaurantId: 'restaurant-123',
                    restaurantName: 'Italian Restaurant',
                    category: 'Italian',
                    isVegetarian: false,
                    spicyLevel: 0,
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                },
            },
        }).as('getDish');

        cy.intercept('GET', '/api/rankings/my/pasta-carbonara', {
            statusCode: 404,
            body: {
                error: 'Ranking not found',
            },
        }).as('getUserRanking');

        cy.intercept('GET', '/api/rankings/local/pasta-carbonara*', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    dish: {
                        id: 'dish-123',
                        name: 'Pasta Carbonara',
                        slug: 'pasta-carbonara',
                        restaurantId: 'restaurant-123',
                        restaurantName: 'Italian Restaurant',
                        category: 'Italian',
                    },
                    rankings: [],
                    stats: {
                        totalRankings: 0,
                        ranks: {},
                        tasteStatuses: {
                            ACCEPTABLE: 0,
                            SECOND_CHANCE: 0,
                            DISSATISFIED: 0,
                        },
                    },
                },
                meta: {
                    pagination: {
                        page: 1,
                        pageSize: 10,
                        totalPages: 1,
                        totalItems: 0,
                    },
                },
            },
        }).as('getLocalRankings');

        // Navigate to Dish Rankings page
        cy.visit('/dish/pasta-carbonara');

        // Wait for the API calls
        cy.wait('@getDish');
        cy.wait('@getUserRanking');
        cy.wait('@getLocalRankings');

        // Verify that the "Add Your Ranking" button is visible
        cy.contains('button', 'Add Your Ranking').should('be.visible');
    });
});
```

## Testing Strategy

### User Flow Testing

- Test complete user flows from start to finish
- Verify that the UI updates correctly
- Test error handling and edge cases

### Cross-Browser Testing

- Test on Chrome, Firefox, Safari, and Edge
- Test on mobile devices (iOS and Android)
- Test responsive design

### Performance Testing

- Test page load times
- Test API response times
- Test photo upload performance

## Dependencies

- Cypress for end-to-end testing
- Cypress Testing Library for better selectors
- Cypress File Upload for testing file uploads
- Cypress Intercept for mocking API responses

## Estimated Time

- User Flow Tests: 2 days
- Navigation Tests: 1 day
- Authentication Tests: 1 day
- Cross-Browser Testing: 1 day
- Performance Testing: 1 day

Total: 6 days
