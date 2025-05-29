import { FoodEstablishment } from '@/types';
import { Container, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export default function FavoritesPage(): JSX.Element {
  const { data: restaurants, isLoading } = useQuery<FoodEstablishment[]>({
    queryKey: ['favorites'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!restaurants?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">No favorites yet</h1>
        <p className="text-gray-500">
          Start adding restaurants to your favorites!
        </p>
      </div>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Favorites
      </Typography>
    </Container>
  );
}
