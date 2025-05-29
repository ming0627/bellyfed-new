# 2. Frontend Testing

This document outlines the testing plan for the frontend components of the Rankings feature.

## Overview

The frontend testing will ensure that the UI components, API integration, and state management work correctly. The tests will cover:

- Unit tests for UI components
- Integration tests for API clients
- Tests for state management
- User interaction tests

## Implementation Tasks

### 1. Component Tests

- [ ] Create tests for RankingForm component

    - File: `src/components/rankings/__tests__/RankingForm.test.tsx`
    - Test form validation
    - Test submission handling
    - Test photo integration

- [ ] Create tests for PhotoUploader component

    - File: `src/components/shared/__tests__/PhotoUploader.test.tsx`
    - Test file selection
    - Test drag and drop
    - Test upload progress

- [ ] Create tests for RankingCard component

    - File: `src/components/rankings/__tests__/RankingCard.test.tsx`
    - Test rendering with different ranking types
    - Test photo gallery integration
    - Test edit and delete functionality

- [ ] Create tests for RankingStats component
    - File: `src/components/rankings/__tests__/RankingStats.test.tsx`
    - Test rendering with different statistics
    - Test percentage calculations

### 2. API Client Tests

- [ ] Create tests for dish API client

    - File: `src/lib/api/__tests__/dishesApi.test.ts`
    - Test success and error handling
    - Test response formatting

- [ ] Create tests for rankings API client

    - File: `src/lib/api/__tests__/rankingsApi.test.ts`
    - Test CRUD operations
    - Test success and error handling

- [ ] Create tests for photo upload API client
    - File: `src/lib/api/__tests__/photoUploadApi.test.ts`
    - Test pre-signed URL generation
    - Test file upload
    - Test progress tracking

### 3. State Management Tests

- [ ] Create tests for Rankings Context

    - File: `src/context/__tests__/RankingsContext.test.tsx`
    - Test reducer functions
    - Test context provider
    - Test actions

- [ ] Create tests for Rankings Hooks
    - File: `src/hooks/__tests__/useRankings.test.ts`
    - Test fetching rankings
    - Test creating/updating/deleting rankings
    - Test error handling

## Implementation Details

### Component Tests

```tsx
// src/components/rankings/__tests__/RankingForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RankingForm } from '../RankingForm';

// Mock dependencies
jest.mock('@/components/shared/PhotoUploader', () => ({
    PhotoUploader: ({ onPhotoUploaded, onPhotoRemoved }) => (
        <div data-testid="photo-uploader">
            <button onClick={() => onPhotoUploaded('https://example.com/photo.jpg')}>
                Upload Photo
            </button>
            <button onClick={() => onPhotoRemoved('https://example.com/photo.jpg')}>
                Remove Photo
            </button>
        </div>
    ),
}));

describe('RankingForm', () => {
    const mockDish = {
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
    };

    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the form with dish information', () => {
        render(<RankingForm dish={mockDish} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        // Check if dish information is displayed
        expect(screen.getByText(/Add Ranking for Pasta Carbonara/i)).toBeInTheDocument();
        expect(screen.getByText(/Restaurant: Italian Restaurant/i)).toBeInTheDocument();

        // Check if form elements are rendered
        expect(screen.getByLabelText(/Ranking Type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Numerical Rank/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Taste Status/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
        expect(screen.getByTestId('photo-uploader')).toBeInTheDocument();

        // Check if buttons are rendered
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    });

    it('should switch between rank and taste status', async () => {
        render(<RankingForm dish={mockDish} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        // Initially, numerical rank should be selected
        const rankRadio = screen.getByLabelText(/Numerical Rank/i);
        const tasteStatusRadio = screen.getByLabelText(/Taste Status/i);

        expect(rankRadio).toBeChecked();
        expect(tasteStatusRadio).not.toBeChecked();
        expect(screen.getByText(/Rank \(1 is best, 5 is worst\)/i)).toBeInTheDocument();

        // Switch to taste status
        userEvent.click(tasteStatusRadio);

        await waitFor(() => {
            expect(rankRadio).not.toBeChecked();
            expect(tasteStatusRadio).toBeChecked();
            expect(screen.getByText(/Taste Status/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Acceptable/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Second Chance/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Dissatisfied/i)).toBeInTheDocument();
        });
    });

    it('should handle form submission with rank', async () => {
        render(<RankingForm dish={mockDish} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        // Select rank 1
        userEvent.click(screen.getByLabelText('1'));

        // Add notes
        userEvent.type(screen.getByLabelText(/Notes/i), 'Great dish!');

        // Upload a photo
        userEvent.click(screen.getByText('Upload Photo'));

        // Submit the form
        userEvent.click(screen.getByRole('button', { name: /Save/i }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                dishId: 'dish-123',
                restaurantId: 'restaurant-123',
                dishType: 'Italian',
                rank: 1,
                tasteStatus: undefined,
                notes: 'Great dish!',
                photoUrls: ['https://example.com/photo.jpg'],
            });
        });
    });

    it('should handle form submission with taste status', async () => {
        render(<RankingForm dish={mockDish} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        // Switch to taste status
        userEvent.click(screen.getByLabelText(/Taste Status/i));

        await waitFor(() => {
            expect(screen.getByLabelText(/Acceptable/i)).toBeInTheDocument();
        });

        // Select Acceptable
        userEvent.click(screen.getByLabelText(/Acceptable/i));

        // Add notes
        userEvent.type(screen.getByLabelText(/Notes/i), 'Good dish!');

        // Submit the form
        userEvent.click(screen.getByRole('button', { name: /Save/i }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                dishId: 'dish-123',
                restaurantId: 'restaurant-123',
                dishType: 'Italian',
                rank: undefined,
                tasteStatus: 'ACCEPTABLE',
                notes: 'Good dish!',
                photoUrls: [],
            });
        });
    });

    it('should handle cancel button click', () => {
        render(<RankingForm dish={mockDish} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        userEvent.click(screen.getByRole('button', { name: /Cancel/i }));

        expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should pre-fill form with existing ranking', () => {
        const existingRanking = {
            rank: 2,
            notes: 'Existing notes',
            photos: [
                { id: 'photo-1', photoUrl: 'https://example.com/photo1.jpg' },
                { id: 'photo-2', photoUrl: 'https://example.com/photo2.jpg' },
            ],
        };

        render(
            <RankingForm
                dish={mockDish}
                existingRanking={existingRanking}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />
        );

        // Check if form is pre-filled
        expect(screen.getByText(/Edit Ranking for Pasta Carbonara/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Numerical Rank/i)).toBeChecked();
        expect(screen.getByLabelText('2')).toBeChecked();
        expect(screen.getByLabelText(/Notes/i)).toHaveValue('Existing notes');

        // Check if update button is shown
        expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
    });
});
```

### API Client Tests

```tsx
// src/lib/api/__tests__/rankingsApi.test.ts
import {
    getUserRankings,
    getUserRankingForDish,
    createRanking,
    updateRanking,
    deleteRanking,
    getLocalRankings,
    getGlobalRankings,
} from '../rankingsApi';
import apiClient from '../client';

// Mock dependencies
jest.mock('../client');

describe('Rankings API Client', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getUserRankings', () => {
        it('should fetch user rankings', async () => {
            // Mock response
            const mockResponse = {
                data: {
                    success: true,
                    data: [
                        {
                            id: 'ranking-1',
                            userId: 'user-123',
                            dishId: 'dish-123',
                            rank: 1,
                            notes: 'Great dish!',
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
            };

            // Mock apiClient.get
            (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

            // Call the function
            const result = await getUserRankings();

            // Assertions
            expect(apiClient.get).toHaveBeenCalledWith('/rankings/my', { params: {} });
            expect(result).toEqual(mockResponse.data);
        });

        it('should handle error', async () => {
            // Mock apiClient.get to throw an error
            (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('API error'));

            // Call the function and expect it to throw
            await expect(getUserRankings()).rejects.toThrow('API error');
        });
    });

    describe('createRanking', () => {
        it('should create a ranking', async () => {
            // Mock data
            const dishSlug = 'pasta-carbonara';
            const rankingData = {
                dishId: 'dish-123',
                restaurantId: 'restaurant-123',
                rank: 1,
                notes: 'Great dish!',
            };

            // Mock response
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        ranking: {
                            id: 'ranking-123',
                            userId: 'user-123',
                            dishId: 'dish-123',
                            rank: 1,
                            notes: 'Great dish!',
                        },
                        dish: {
                            id: 'dish-123',
                            name: 'Pasta Carbonara',
                            slug: 'pasta-carbonara',
                        },
                    },
                },
            };

            // Mock apiClient.post
            (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            // Call the function
            const result = await createRanking(dishSlug, rankingData);

            // Assertions
            expect(apiClient.post).toHaveBeenCalledWith(`/rankings/my/${dishSlug}`, rankingData);
            expect(result).toEqual(mockResponse.data);
        });

        it('should handle error', async () => {
            // Mock data
            const dishSlug = 'pasta-carbonara';
            const rankingData = {
                dishId: 'dish-123',
                restaurantId: 'restaurant-123',
                rank: 1,
                notes: 'Great dish!',
            };

            // Mock apiClient.post to throw an error
            (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error('API error'));

            // Call the function and expect it to throw
            await expect(createRanking(dishSlug, rankingData)).rejects.toThrow('API error');
        });
    });

    // Additional tests for other functions...
});
```

### State Management Tests

```tsx
// src/context/__tests__/RankingsContext.test.tsx
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { RankingsProvider, useRankingsContext } from '../RankingsContext';
import { getUserRankings } from '@/lib/api/rankingsApi';

// Mock dependencies
jest.mock('@/lib/api/rankingsApi');

// Test component that uses the context
const TestComponent = () => {
    const { state, addRanking, updateRanking, deleteRanking } = useRankingsContext();

    return (
        <div>
            <div data-testid="loading">{state.loading.toString()}</div>
            <div data-testid="error">{state.error || 'null'}</div>
            <div data-testid="rankings-count">{state.userRankings.length}</div>
            <button
                onClick={() =>
                    addRanking({
                        id: 'ranking-123',
                        userId: 'user-123',
                        dishId: 'dish-123',
                        restaurantId: 'restaurant-123',
                        rank: 1,
                        notes: 'Added ranking',
                        photos: [],
                        createdAt: '2023-01-01T00:00:00Z',
                        updatedAt: '2023-01-01T00:00:00Z',
                    })
                }
            >
                Add Ranking
            </button>
            <button
                onClick={() =>
                    updateRanking({
                        id: 'ranking-123',
                        userId: 'user-123',
                        dishId: 'dish-123',
                        restaurantId: 'restaurant-123',
                        rank: 2,
                        notes: 'Updated ranking',
                        photos: [],
                        createdAt: '2023-01-01T00:00:00Z',
                        updatedAt: '2023-01-01T00:00:00Z',
                    })
                }
            >
                Update Ranking
            </button>
            <button onClick={() => deleteRanking('ranking-123')}>Delete Ranking</button>
        </div>
    );
};

describe('RankingsContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch rankings on mount', async () => {
        // Mock getUserRankings
        (getUserRankings as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: [
                {
                    id: 'ranking-1',
                    userId: 'user-123',
                    dishId: 'dish-123',
                    restaurantId: 'restaurant-123',
                    rank: 1,
                    notes: 'Great dish!',
                    photos: [],
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                },
            ],
        });

        render(
            <RankingsProvider>
                <TestComponent />
            </RankingsProvider>
        );

        // Initially loading
        expect(screen.getByTestId('loading')).toHaveTextContent('true');

        // After loading
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
            expect(screen.getByTestId('error')).toHaveTextContent('null');
            expect(screen.getByTestId('rankings-count')).toHaveTextContent('1');
        });

        expect(getUserRankings).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetching rankings', async () => {
        // Mock getUserRankings to throw an error
        (getUserRankings as jest.Mock).mockRejectedValueOnce(new Error('API error'));

        render(
            <RankingsProvider>
                <TestComponent />
            </RankingsProvider>
        );

        // After error
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
            expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch rankings');
            expect(screen.getByTestId('rankings-count')).toHaveTextContent('0');
        });
    });

    it('should add a ranking', async () => {
        // Mock getUserRankings
        (getUserRankings as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: [],
        });

        render(
            <RankingsProvider>
                <TestComponent />
            </RankingsProvider>
        );

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
        });

        // Add a ranking
        act(() => {
            screen.getByText('Add Ranking').click();
        });

        // Check if ranking was added
        expect(screen.getByTestId('rankings-count')).toHaveTextContent('1');
    });

    it('should update a ranking', async () => {
        // Mock getUserRankings
        (getUserRankings as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: [
                {
                    id: 'ranking-123',
                    userId: 'user-123',
                    dishId: 'dish-123',
                    restaurantId: 'restaurant-123',
                    rank: 1,
                    notes: 'Original ranking',
                    photos: [],
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                },
            ],
        });

        render(
            <RankingsProvider>
                <TestComponent />
            </RankingsProvider>
        );

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
            expect(screen.getByTestId('rankings-count')).toHaveTextContent('1');
        });

        // Update the ranking
        act(() => {
            screen.getByText('Update Ranking').click();
        });

        // Check if ranking count is still 1 (updated, not added)
        expect(screen.getByTestId('rankings-count')).toHaveTextContent('1');
    });

    it('should delete a ranking', async () => {
        // Mock getUserRankings
        (getUserRankings as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: [
                {
                    id: 'ranking-123',
                    userId: 'user-123',
                    dishId: 'dish-123',
                    restaurantId: 'restaurant-123',
                    rank: 1,
                    notes: 'Ranking to delete',
                    photos: [],
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                },
            ],
        });

        render(
            <RankingsProvider>
                <TestComponent />
            </RankingsProvider>
        );

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
            expect(screen.getByTestId('rankings-count')).toHaveTextContent('1');
        });

        // Delete the ranking
        act(() => {
            screen.getByText('Delete Ranking').click();
        });

        // Check if ranking was deleted
        expect(screen.getByTestId('rankings-count')).toHaveTextContent('0');
    });
});
```

## Testing Strategy

### Unit Tests

- Test each component in isolation
- Mock dependencies
- Test user interactions
- Test success and error cases

### Integration Tests

- Test API clients with mock responses
- Test state management with real components
- Test user flows

### Test Coverage

- Aim for at least 80% code coverage
- Focus on critical components and user interactions

## Dependencies

- Jest for testing framework
- React Testing Library for component testing
- MSW (Mock Service Worker) for API mocking
- jest-mock-extended for mocking TypeScript interfaces

## Estimated Time

- Component Tests: 3 days
- API Client Tests: 1 day
- State Management Tests: 2 days

Total: 6 days
