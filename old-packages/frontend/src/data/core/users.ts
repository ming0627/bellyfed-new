import { User } from '@/types';

export const currentUser: User = {
  id: 'current-user',
  name: 'Current User',
  email: 'current@example.com',
  avatar: {
    bucket: 'bellyfed-avatars',
    region: 'us-west-2',
    key: 'avatars/default.jpg',
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  bio: 'Food lover and explorer',
  location: 'Singapore',
};
