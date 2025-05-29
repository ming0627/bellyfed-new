import { Schedule, DayOfWeek } from '@/types';

export const DEFAULT_SCHEDULE: Schedule[] = [
  {
    locationId: 'loc1',
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: '09:00',
    endTime: '22:00',
    isRecurring: true,
    establishmentId: 'restaurant_jalan_alor',
    id: 'schedule1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    locationId: 'loc1',
    dayOfWeek: DayOfWeek.TUESDAY,
    startTime: '09:00',
    endTime: '22:00',
    isRecurring: true,
    establishmentId: 'restaurant_jalan_alor',
    id: 'schedule2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
