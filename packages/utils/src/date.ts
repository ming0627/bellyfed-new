/**
 * Date Utilities
 *
 * This module provides utility functions for formatting and manipulating dates and times.
 * It includes functions for formatting dates in various formats, calculating date differences,
 * and working with time strings.
 */

/**
 * Format a time string (HH:MM) to a 12-hour format with AM/PM
 * @param time Time string in 24-hour format (HH:MM)
 * @returns Formatted time string in 12-hour format (h:MM AM/PM)
 */
export function formatTime(time: string): string {
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    
    if (isNaN(hour) || hour < 0 || hour > 23) {
      throw new Error('Invalid hour value');
    }
    
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  } catch (error: unknown) {
    console.error('Error formatting time:', error);
    return time; // Return the original time string if there's an error
  }
}

/**
 * Format a date object to a string in YYYY-MM-DD format
 * @param date Date object to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDate(date: Date): string {
  try {
    const parts = date.toISOString().split('T');
    return parts[0] || '';
  } catch (error: unknown) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format a date object to a human-readable string
 * @param date Date object to format
 * @param options Intl.DateTimeFormatOptions for customizing the format
 * @param locale Locale string for formatting (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDateHuman(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  locale: string = 'en-US',
): string {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error: unknown) {
    console.error('Error formatting date for human reading:', error);
    return date.toDateString();
  }
}

/**
 * Format a date object to a relative time string (e.g., "2 days ago")
 * @param date Date object to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date): string {
  try {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInSecs < 60) {
      return diffInSecs <= 1 ? 'just now' : `${diffInSecs} seconds ago`;
    } else if (diffInMins < 60) {
      return diffInMins === 1 ? '1 minute ago' : `${diffInMins} minutes ago`;
    } else if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInDays < 30) {
      return diffInDays === 1 ? 'yesterday' : `${diffInDays} days ago`;
    } else if (diffInMonths < 12) {
      return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
    } else {
      return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
    }
  } catch (error: unknown) {
    console.error('Error formatting relative time:', error);
    return 'unknown time ago';
  }
}

/**
 * Parse a date string to a Date object
 * @param dateString Date string to parse
 * @returns Date object or null if the string is invalid
 */
export function parseDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch (error: unknown) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Format a time range from two time strings
 * @param startTime Start time string in 24-hour format (HH:MM)
 * @param endTime End time string in 24-hour format (HH:MM)
 * @returns Formatted time range string
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  try {
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);
    return `${formattedStartTime} - ${formattedEndTime}`;
  } catch (error: unknown) {
    console.error('Error formatting time range:', error);
    return `${startTime} - ${endTime}`;
  }
}

/**
 * Get the day of the week from a date
 * @param date Date object
 * @param format Format of the day ('long' for full name, 'short' for abbreviated)
 * @returns Day of the week string
 */
export function getDayOfWeek(
  date: Date,
  format: 'long' | 'short' = 'long',
): string {
  try {
    const options: Intl.DateTimeFormatOptions = { weekday: format };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error: unknown) {
    console.error('Error getting day of week:', error);
    return '';
  }
}

/**
 * Check if a date is today
 * @param date Date object to check
 * @returns True if the date is today, false otherwise
 */
export function isToday(date: Date): boolean {
  try {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  } catch (error: unknown) {
    console.error('Error checking if date is today:', error);
    return false;
  }
}

/**
 * Format a date for display in a review or comment
 * @param date Date object to format
 * @returns Formatted date string
 */
export function formatReviewDate(date: Date): string {
  try {
    if (isToday(date)) {
      return `Today at ${formatTime(
        `${date.getHours().toString().padStart(2, '0')}:${date
          .getMinutes()
          .toString()
          .padStart(2, '0')}`,
      )}`;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return `Yesterday at ${formatTime(
        `${date.getHours().toString().padStart(2, '0')}:${date
          .getMinutes()
          .toString()
          .padStart(2, '0')}`,
      )}`;
    }

    return formatDateHuman(date, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  } catch (error: unknown) {
    console.error('Error formatting review date:', error);
    return date.toDateString();
  }
}
