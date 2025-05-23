'use client';

/**
 * Calendar Component
 * 
 * A date picker calendar component based on react-day-picker.
 */

import * as React from 'react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { format } from 'date-fns';

import { buttonVariants } from './button.js';
import { cn } from '../utils.js';

/**
 * Calendar props interface
 */
export type CalendarProps = DayPickerProps & {
  /**
   * Whether to show a footer with today's date
   */
  showFooter?: boolean;
  
  /**
   * Custom footer content
   */
  footerContent?: React.ReactNode;
};

/**
 * Calendar component
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showFooter = false,
  footerContent,
  ...props
}: CalendarProps): React.ReactElement {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md',
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-8 w-8 p-0 font-normal aria-selected:opacity-100',
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside:
          'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      footer={
        showFooter ? (
          <div className="pt-3 text-center text-sm text-muted-foreground">
            {footerContent || `Today is ${format(new Date(), 'PPP')}`}
          </div>
        ) : null
      }
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

/**
 * DateRangePicker props interface
 */
export interface DateRangePickerProps {
  /**
   * The selected date range
   */
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  
  /**
   * Callback when the date range changes
   */
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  
  /**
   * Additional class name
   */
  className?: string;
  
  /**
   * Number of months to display
   */
  numberOfMonths?: number;
  
  /**
   * Whether to show a footer with the selected range
   */
  showRangeFooter?: boolean;
  
  /**
   * Minimum date that can be selected
   */
  minDate?: Date;
  
  /**
   * Maximum date that can be selected
   */
  maxDate?: Date;
  
  /**
   * Disabled dates
   */
  disabledDates?: Date[];
}

/**
 * DateRangePicker component
 * 
 * A specialized calendar for selecting date ranges
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
  numberOfMonths = 2,
  showRangeFooter = true,
  minDate,
  maxDate,
  disabledDates,
}: DateRangePickerProps): React.ReactElement {
  const { from, to } = dateRange;
  
  // Format the selected range for display
  const rangeFooter = React.useMemo(() => {
    if (!from) return 'Select start date';
    if (!to) return 'Select end date';
    
    return `${format(from, 'PPP')} - ${format(to, 'PPP')}`;
  }, [from, to]);
  
  return (
    <Calendar
      mode="range"
      defaultMonth={from}
      selected={{ from, to }}
      onSelect={(range) => {
        if (!range) {
          onDateRangeChange({ from: undefined, to: undefined });
          return;
        }
        
        onDateRangeChange({
          from: range.from,
          to: range.to,
        });
      }}
      numberOfMonths={numberOfMonths}
      className={className}
      showFooter={showRangeFooter}
      footerContent={rangeFooter}
      disabled={[
        ...(disabledDates || []),
        ...(minDate ? [{ before: minDate }] : []),
        ...(maxDate ? [{ after: maxDate }] : []),
      ]}
    />
  );
}
