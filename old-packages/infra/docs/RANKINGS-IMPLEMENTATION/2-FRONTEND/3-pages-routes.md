# 3. Pages and Routes Implementation

This document outlines the implementation plan for the pages and routes required for the Rankings feature.

## Overview

The pages and routes will provide the user interface for navigating and interacting with the Rankings feature. These pages will use the core components developed in the previous step.

## Implementation Tasks

### 1. My Rankings Page

- [ ] Create My Rankings page
    - File: `src/pages/my-rankings.tsx`
    - Implement page to display all user rankings
    - Add filtering and sorting options
    - Include pagination

### 2. Dish Rankings Page

- [ ] Create Dish Rankings page
    - File: `src/pages/dish/[slug].tsx`
    - Implement page to display rankings for a specific dish
    - Add tabs for local and global rankings
    - Include user's ranking if it exists

### 3. Restaurant Rankings Page

- [ ] Create Restaurant Rankings page
    - File: `src/pages/restaurant/[id].tsx`
    - Implement page to display rankings for dishes at a restaurant
    - Add filtering and sorting options
    - Include user's rankings if they exist

## Implementation Details

### My Rankings Page

```tsx
// src/pages/my-rankings.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import {
    Container,
    Typography,
    Box,
    Tabs,
    Tab,
    TextField,
    MenuItem,
    Grid,
    CircularProgress,
    Alert,
    Pagination,
} from '@mui/material';
import { getUserRankings } from '@/lib/api/rankingsApi';
import { RankingCard } from '@/components/rankings/RankingCard';
import { UserRanking } from '@/types/ranking';
import { Dish } from '@/types/dish';
import { useRouter } from 'next/router';

interface RankingWithDish {
    ranking: UserRanking;
    dish: Dish;
}

const MyRankingsPage: NextPage = () => {
    const router = useRouter();
    const [rankings, setRankings] = useState<RankingWithDish[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState('all'); // 'all', 'rank', 'taste'
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [restaurantFilter, setRestaurantFilter] = useState('');
    const [dishTypeFilter, setDishTypeFilter] = useState('');

    // Get unique restaurant names and dish types for filtering
    const restaurants = [...new Set(rankings.map((item) => item.dish.restaurantName))];
    const dishTypes = [...new Set(rankings.map((item) => item.ranking.dishType).filter(Boolean))];

    // Fetch rankings
    useEffect(() => {
        const fetchRankings = async () => {
            setLoading(true);
            setError(null);

            try {
                const params: any = {
                    page,
                    pageSize: 10,
                    sortBy,
                    sortOrder,
                };

                if (restaurantFilter) {
                    params.restaurant = restaurantFilter;
                }

                if (dishTypeFilter) {
                    params.dishType = dishTypeFilter;
                }

                const response = await getUserRankings(params);

                if (response.success) {
                    setRankings(
                        response.data.map((ranking) => ({
                            ranking,
                            dish: {
                                id: ranking.dishId,
                                name: ranking.dishName,
                                slug: ranking.dishSlug,
                                restaurantId: ranking.restaurantId,
                                restaurantName: ranking.restaurantName,
                                category: ranking.dishType,
                                isVegetarian: false, // Default value
                                spicyLevel: 0, // Default value
                                createdAt: '',
                                updatedAt: '',
                            },
                        }))
                    );

                    if (response.meta?.pagination) {
                        setTotalPages(response.meta.pagination.totalPages);
                    }
                }
            } catch (err) {
                console.error('Error fetching rankings:', err);
                setError('Failed to load rankings. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, [page, sortBy, sortOrder, restaurantFilter, dishTypeFilter]);

    // Handle page change
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    // Handle filter change
    const handleFilterChange = (event: React.SyntheticEvent, newValue: string) => {
        setFilter(newValue);
    };

    // Handle sort change
    const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSortBy(event.target.value);
    };

    // Handle sort order change
    const handleSortOrderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSortOrder(event.target.value);
    };

    // Handle restaurant filter change
    const handleRestaurantFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRestaurantFilter(event.target.value);
        setPage(1); // Reset to first page
    };

    // Handle dish type filter change
    const handleDishTypeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDishTypeFilter(event.target.value);
        setPage(1); // Reset to first page
    };

    // Filter rankings based on selected filter
    const filteredRankings = rankings.filter((item) => {
        if (filter === 'all') return true;
        if (filter === 'rank') return item.ranking.rank !== undefined;
        if (filter === 'taste') return item.ranking.tasteStatus !== undefined;
        return true;
    });

    // Handle edit ranking
    const handleEditRanking = (dishSlug: string) => {
        router.push(`/dish/${dishSlug}`);
    };

    // Handle delete ranking
    const handleDeleteRanking = async (rankingId: string) => {
        // Implementation for deleting a ranking
        // This would call the deleteRanking API and update the UI
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                My Rankings
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mb: 4 }}>
                <Tabs value={filter} onChange={handleFilterChange} sx={{ mb: 2 }}>
                    <Tab label="All Rankings" value="all" />
                    <Tab label="Numerical Rankings" value="rank" />
                    <Tab label="Taste Status" value="taste" />
                </Tabs>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            select
                            label="Restaurant"
                            value={restaurantFilter}
                            onChange={handleRestaurantFilterChange}
                            fullWidth
                            size="small"
                        >
                            <MenuItem value="">All Restaurants</MenuItem>
                            {restaurants.map((restaurant) => (
                                <MenuItem key={restaurant} value={restaurant}>
                                    {restaurant}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            select
                            label="Dish Type"
                            value={dishTypeFilter}
                            onChange={handleDishTypeFilterChange}
                            fullWidth
                            size="small"
                        >
                            <MenuItem value="">All Types</MenuItem>
                            {dishTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                select
                                label="Sort By"
                                value={sortBy}
                                onChange={handleSortChange}
                                fullWidth
                                size="small"
                            >
                                <MenuItem value="createdAt">Date Added</MenuItem>
                                <MenuItem value="updatedAt">Last Updated</MenuItem>
                                <MenuItem value="rank">Rank</MenuItem>
                            </TextField>

                            <TextField
                                select
                                label="Order"
                                value={sortOrder}
                                onChange={handleSortOrderChange}
                                fullWidth
                                size="small"
                            >
                                <MenuItem value="asc">Ascending</MenuItem>
                                <MenuItem value="desc">Descending</MenuItem>
                            </TextField>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : filteredRankings.length === 0 ? (
                <Alert severity="info">
                    No rankings found. Start ranking dishes to see them here!
                </Alert>
            ) : (
                <>
                    {filteredRankings.map((item) => (
                        <RankingCard
                            key={item.ranking.id}
                            ranking={item.ranking}
                            dish={item.dish}
                            onEdit={() => handleEditRanking(item.dish.slug)}
                            onDelete={() => handleDeleteRanking(item.ranking.id)}
                            showDishInfo={true}
                        />
                    ))}

                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default MyRankingsPage;
```

### Dish Rankings Page

```tsx
// src/pages/dish/[slug].tsx
import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import {
    Container,
    Typography,
    Box,
    Tabs,
    Tab,
    Button,
    Dialog,
    CircularProgress,
    Alert,
    Pagination,
} from '@mui/material';
import { getDishBySlug } from '@/lib/api/dishesApi';
import {
    getUserRankingForDish,
    getLocalRankings,
    getGlobalRankings,
    createRanking,
    updateRanking,
    deleteRanking,
} from '@/lib/api/rankingsApi';
import { RankingForm } from '@/components/rankings/RankingForm';
import { RankingCard } from '@/components/rankings/RankingCard';
import { RankingStats } from '@/components/rankings/RankingStats';
import { Dish } from '@/types/dish';
import { UserRanking, RankingInput } from '@/types/ranking';
import { useRouter } from 'next/router';

interface DishRankingsPageProps {
    slug: string;
}

const DishRankingsPage: NextPage<DishRankingsPageProps> = ({ slug }) => {
    const router = useRouter();
    const [dish, setDish] = useState<Dish | null>(null);
    const [userRanking, setUserRanking] = useState<UserRanking | null>(null);
    const [rankings, setRankings] = useState<any[]>([]);
    const [stats, setStats] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [rankingType, setRankingType] = useState<'local' | 'global'>('local');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch dish and rankings
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch dish
                const dishResponse = await getDishBySlug(slug);

                if (dishResponse.success) {
                    setDish(dishResponse.data);

                    // Fetch user's ranking
                    try {
                        const userRankingResponse = await getUserRankingForDish(slug);
                        if (userRankingResponse.success) {
                            setUserRanking(userRankingResponse.data.ranking);
                        }
                    } catch (err) {
                        // User might not have a ranking yet, which is fine
                        console.log('No user ranking found');
                    }

                    // Fetch rankings based on selected type
                    const rankingsResponse =
                        rankingType === 'local'
                            ? await getLocalRankings(slug, { page, pageSize: 10 })
                            : await getGlobalRankings(slug, { page, pageSize: 10 });

                    if (rankingsResponse.success) {
                        setRankings(rankingsResponse.data.rankings);
                        setStats(rankingsResponse.data.stats);

                        if (rankingsResponse.meta?.pagination) {
                            setTotalPages(rankingsResponse.meta.pagination.totalPages);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching dish data:', err);
                setError('Failed to load dish data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, rankingType, page]);

    // Handle ranking type change
    const handleRankingTypeChange = (event: React.SyntheticEvent, newValue: 'local' | 'global') => {
        setRankingType(newValue);
        setPage(1); // Reset to first page
    };

    // Handle page change
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    // Handle form open
    const handleFormOpen = () => {
        setFormOpen(true);
    };

    // Handle form close
    const handleFormClose = () => {
        setFormOpen(false);
    };

    // Handle form submit
    const handleFormSubmit = async (data: RankingInput) => {
        try {
            if (!dish) return;

            if (userRanking) {
                // Update existing ranking
                const response = await updateRanking(slug, data);
                if (response.success) {
                    setUserRanking(response.data.ranking);
                    setFormOpen(false);

                    // Refresh rankings
                    const rankingsResponse =
                        rankingType === 'local'
                            ? await getLocalRankings(slug, { page, pageSize: 10 })
                            : await getGlobalRankings(slug, { page, pageSize: 10 });

                    if (rankingsResponse.success) {
                        setRankings(rankingsResponse.data.rankings);
                        setStats(rankingsResponse.data.stats);
                    }
                }
            } else {
                // Create new ranking
                const response = await createRanking(slug, data);
                if (response.success) {
                    setUserRanking(response.data.ranking);
                    setFormOpen(false);

                    // Refresh rankings
                    const rankingsResponse =
                        rankingType === 'local'
                            ? await getLocalRankings(slug, { page, pageSize: 10 })
                            : await getGlobalRankings(slug, { page, pageSize: 10 });

                    if (rankingsResponse.success) {
                        setRankings(rankingsResponse.data.rankings);
                        setStats(rankingsResponse.data.stats);
                    }
                }
            }
        } catch (err) {
            console.error('Error saving ranking:', err);
            throw err;
        }
    };

    // Handle delete ranking
    const handleDeleteRanking = async () => {
        try {
            if (!dish) return;

            const response = await deleteRanking(slug);
            if (response.success) {
                setUserRanking(null);

                // Refresh rankings
                const rankingsResponse =
                    rankingType === 'local'
                        ? await getLocalRankings(slug, { page, pageSize: 10 })
                        : await getGlobalRankings(slug, { page, pageSize: 10 });

                if (rankingsResponse.success) {
                    setRankings(rankingsResponse.data.rankings);
                    setStats(rankingsResponse.data.stats);
                }
            }
        } catch (err) {
            console.error('Error deleting ranking:', err);
            setError('Failed to delete ranking. Please try again.');
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error || !dish) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error || 'Dish not found'}
                </Alert>
                <Button onClick={() => router.back()}>Go Back</Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                {dish.name}
            </Typography>

            <Typography variant="h6" color="text.secondary" gutterBottom>
                {dish.restaurantName}
            </Typography>

            {dish.description && (
                <Typography variant="body1" paragraph>
                    {dish.description}
                </Typography>
            )}

            <Box sx={{ mb: 4 }}>
                {userRanking ? (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Your Ranking
                        </Typography>
                        <RankingCard
                            ranking={userRanking}
                            dish={dish}
                            onEdit={handleFormOpen}
                            onDelete={handleDeleteRanking}
                            showDishInfo={false}
                        />
                    </Box>
                ) : (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleFormOpen}
                        sx={{ mb: 3 }}
                    >
                        Add Your Ranking
                    </Button>
                )}

                <Tabs value={rankingType} onChange={handleRankingTypeChange} sx={{ mb: 3 }}>
                    <Tab label="Local Rankings" value="local" />
                    <Tab label="Global Rankings" value="global" />
                </Tabs>

                {stats && <RankingStats stats={stats} isLocal={rankingType === 'local'} />}
            </Box>

            <Typography variant="h6" gutterBottom>
                {rankingType === 'local' ? 'Local' : 'Global'} Rankings
            </Typography>

            {rankings.length === 0 ? (
                <Alert severity="info">No {rankingType} rankings found for this dish yet.</Alert>
            ) : (
                <>
                    {rankings.map((ranking) => (
                        <Box key={ranking.id} sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                {ranking.username}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                {ranking.rank !== undefined ? (
                                    <Typography>
                                        Rank: <strong>{ranking.rank}</strong>
                                    </Typography>
                                ) : (
                                    <Typography>
                                        Taste Status:{' '}
                                        <strong>{ranking.tasteStatus?.replace('_', ' ')}</strong>
                                    </Typography>
                                )}
                            </Box>
                            {ranking.notes && (
                                <Typography variant="body2" paragraph>
                                    {ranking.notes}
                                </Typography>
                            )}
                            {ranking.photoCount > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    {ranking.photoCount}{' '}
                                    {ranking.photoCount === 1 ? 'photo' : 'photos'}
                                </Typography>
                            )}
                        </Box>
                    ))}

                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                    )}
                </>
            )}

            {/* Ranking Form Dialog */}
            <Dialog open={formOpen} onClose={handleFormClose} maxWidth="md" fullWidth>
                <Box sx={{ p: 3 }}>
                    <RankingForm
                        dish={dish}
                        existingRanking={userRanking || undefined}
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormClose}
                    />
                </Box>
            </Dialog>
        </Container>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params as { slug: string };

    return {
        props: {
            slug,
        },
    };
};

export default DishRankingsPage;
```

I'll continue with the Restaurant Rankings Page in the next file due to length constraints.

## Testing

- [ ] Write unit tests for My Rankings page

    - Test filtering and sorting
    - Test pagination
    - Test rendering with different data

- [ ] Write unit tests for Dish Rankings page
    - Test local vs. global rankings
    - Test user ranking interaction
    - Test form integration

## Dependencies

- Next.js for page routing
- Material UI for UI components
- API clients from previous step
- Core components from previous step

## Estimated Time

- My Rankings Page: 1.5 days
- Dish Rankings Page: 1.5 days
- Testing: 1 day

Total: 4 days
