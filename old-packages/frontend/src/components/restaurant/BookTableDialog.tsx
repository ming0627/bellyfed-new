import { format } from 'date-fns';
import { CalendarIcon, Minus, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { FoodEstablishment } from '@/types';

interface BookTableDialogProps {
  restaurant: FoodEstablishment;
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

export function BookTableDialog({
  restaurant,
  isOpen,
  onClose,
  embedded = false,
}: BookTableDialogProps): JSX.Element {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const generateTimeSlots = (): string[] => {
    const currentSchedule = restaurant.schedules?.find((s) => {
      const today = new Date();
      const dayOfWeek = today
        .toLocaleString('en-US', { weekday: 'long' })
        .toUpperCase();
      return s.dayOfWeek === dayOfWeek;
    });

    if (!currentSchedule) return [];

    const [startHour] = currentSchedule.startTime.split(':').map(Number);
    const [endHour] = currentSchedule.endTime.split(':').map(Number);

    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const Content = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'justify-start text-left font-normal',
                !date && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Time</label>
        <Select value={time} onValueChange={setTime}>
          <SelectTrigger>
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            {generateTimeSlots().map((slot) => (
              <SelectItem key={slot} value={slot}>
                {slot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Number of Guests
        </label>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setGuests(Math.max(1, guests - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium">{guests}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setGuests(Math.min(10, guests + 1))}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Name</label>
        <Input
          id="name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          placeholder="Your name"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPhone(e.target.value)
          }
          placeholder="Your phone number"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Email</label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          placeholder="Your email"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Special Requests (Optional)
        </label>
        <Input
          id="specialRequests"
          value={specialRequests}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSpecialRequests(e.target.value)
          }
          placeholder="Any special requests?"
        />
      </div>

      <Button
        className="w-full"
        disabled={!date || !time || !name || !phone || !email}
        onClick={() => {
          console.log({
            date,
            time,
            guests,
            name,
            phone,
            email,
            specialRequests,
          });
          onClose();
        }}
      >
        Book Table
      </Button>
    </div>
  );

  if (embedded) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Book a Table</h2>
        <Content />
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book a Table at {restaurant.name}</DialogTitle>
          <DialogDescription>
            Select your preferred date and time for dining.
          </DialogDescription>
        </DialogHeader>
        <Content />
      </DialogContent>
    </Dialog>
  );
}
