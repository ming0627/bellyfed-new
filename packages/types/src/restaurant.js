/**
 * Restaurant types for Bellyfed application
 * These types align with the database schema and Google Maps API responses
 */
/**
 * Helper functions for restaurant data
 */
/**
 * Get day name from day of week number
 */
export function getDayName(dayOfWeek) {
    const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];
    return days[dayOfWeek] || '';
}
/**
 * Format time from "HH:MM:SS" to "HH:MM AM/PM"
 */
export function formatTime(time) {
    if (!time)
        return '';
    try {
        const [hours, minutes] = time.split(':');
        if (!hours)
            return time;
        const hoursNum = parseInt(hours, 10);
        const period = hoursNum >= 12 ? 'PM' : 'AM';
        const hours12 = hoursNum % 12 || 12;
        return `${hours12}:${minutes} ${period}`;
    }
    catch (error) {
        return time;
    }
}
/**
 * Format price level to $ symbols
 */
export function formatPriceLevel(priceLevel) {
    if (priceLevel === undefined || priceLevel === null)
        return 'Price not available';
    switch (priceLevel) {
        case 0:
            return 'Free';
        case 1:
            return '$';
        case 2:
            return '$$';
        case 3:
            return '$$$';
        case 4:
            return '$$$$';
        default:
            return 'Price not available';
    }
}
/**
 * Get formatted opening hours text
 */
export function getFormattedOpeningHours(hours) {
    if (!hours || hours.length === 0)
        return ['Opening hours not available'];
    // Sort hours by day of week
    const sortedHours = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    // Group consecutive days with the same hours
    const groupedHours = [];
    for (const hour of sortedHours) {
        const lastGroup = groupedHours[groupedHours.length - 1];
        if (lastGroup &&
            lastGroup.openTime === hour.openTime &&
            lastGroup.closeTime === hour.closeTime &&
            lastGroup.days[lastGroup.days.length - 1] === hour.dayOfWeek - 1) {
            // Add to existing group if consecutive day with same hours
            lastGroup.days.push(hour.dayOfWeek);
        }
        else {
            // Create new group
            groupedHours.push({
                days: [hour.dayOfWeek],
                openTime: hour.openTime,
                closeTime: hour.closeTime,
            });
        }
    }
    // Format each group
    return groupedHours.map((group) => {
        const firstDay = group.days[0];
        const lastDay = group.days[group.days.length - 1];
        const daysText = group.days.length === 1
            ? getDayName(firstDay !== undefined ? firstDay : 0)
            : `${getDayName(firstDay !== undefined ? firstDay : 0)} - ${getDayName(lastDay !== undefined ? lastDay : 0)}`;
        return `${daysText}: ${formatTime(group.openTime)} - ${formatTime(group.closeTime)}`;
    });
}
//# sourceMappingURL=restaurant.js.map