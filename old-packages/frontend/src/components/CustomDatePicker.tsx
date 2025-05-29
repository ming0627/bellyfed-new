import { format, addYears, addMonths, setDate, parse, isValid } from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import React, { useState, useRef, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  onBlur: () => void;
  error?: string;
  touched?: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selected,
  onChange,
  onBlur,
  error,
  touched,
}) => {
  const [currentDate, setCurrentDate] = useState(selected || new Date());
  const [inputValue, setInputValue] = useState(
    selected ? format(selected, 'yyyy-MM-dd') : '',
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleYearChange = (increment: number): void => {
    setCurrentDate((prevDate) => addYears(prevDate, increment));
  };

  const handleMonthChange = (increment: number): void => {
    setCurrentDate((prevDate) => addMonths(prevDate, increment));
  };

  const handleDateSelect = (day: number): void => {
    const newDate = setDate(currentDate, day);
    onChange(newDate);
    setInputValue(format(newDate, 'yyyy-MM-dd'));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    let formattedValue = '';

    if (value.length <= 4) {
      formattedValue = value;
    } else if (value.length <= 6) {
      formattedValue = `${value.slice(0, 4)}-${value.slice(4)}`;
    } else {
      formattedValue = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
    }

    setInputValue(formattedValue);

    const parsedDate = parse(formattedValue, 'yyyy-MM-dd', new Date());
    if (isValid(parsedDate)) {
      onChange(parsedDate);
      setCurrentDate(parsedDate);
    } else {
      onChange(null);
    }
  };

  const handleInputFocus = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, []);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex">
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={onBlur}
              placeholder="YYYY-MM-DD"
              maxLength={10}
              className={cn(
                'w-full pr-10',
                touched && error && 'border-red-500',
              )}
            />
            <Button
              variant={'outline'}
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => {
                inputRef.current?.focus();
                handleInputFocus();
              }}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" sideOffset={5}>
          <div className="p-2">
            <div className="flex justify-between items-center mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleYearChange(-10)}
                title="Minus 10 years"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleYearChange(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold">
                {format(currentDate, 'yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleYearChange(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleYearChange(10)}
                title="Plus 10 years"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMonthChange(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold">
                {format(currentDate, 'MMMM')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMonthChange(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const isSelected =
                  selected &&
                  day === selected.getDate() &&
                  currentDate.getMonth() === selected.getMonth() &&
                  currentDate.getFullYear() === selected.getFullYear();

                return (
                  <Button
                    key={day}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateSelect(day)}
                    className={cn(
                      'h-8 w-8 p-0',
                      isSelected
                        ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                        : 'hover:bg-muted',
                    )}
                  >
                    {day}
                  </Button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {touched && error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default CustomDatePicker;
