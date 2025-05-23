/**
 * Review types for Bellyfed application
 * These types align with the database schema and API responses
 */
/**
 * Visit status enum for reviews
 */
export var VisitStatus;
(function (VisitStatus) {
    VisitStatus["ACCEPTABLE"] = "ACCEPTABLE";
    VisitStatus["NEEDS_IMPROVEMENT"] = "NEEDS_IMPROVEMENT";
    VisitStatus["DISAPPOINTING"] = "DISAPPOINTING";
})(VisitStatus || (VisitStatus = {}));
/**
 * Helper functions for reviews
 */
/**
 * Format visit status to a user-friendly string
 */
export function formatVisitStatus(status) {
    switch (status) {
        case VisitStatus.ACCEPTABLE:
            return 'Acceptable';
        case VisitStatus.NEEDS_IMPROVEMENT:
            return 'Needs Improvement';
        case VisitStatus.DISAPPOINTING:
            return 'Disappointing';
        default:
            return 'Unknown';
    }
}
/**
 * Get color for visit status
 */
export function getVisitStatusColor(status) {
    switch (status) {
        case VisitStatus.ACCEPTABLE:
            return 'green';
        case VisitStatus.NEEDS_IMPROVEMENT:
            return 'yellow';
        case VisitStatus.DISAPPOINTING:
            return 'red';
        default:
            return 'gray';
    }
}
/**
 * Format rank to a user-friendly string
 */
export function formatRank(rank) {
    if (rank === undefined || rank === null)
        return 'Not Ranked';
    return `#${rank}`;
}
//# sourceMappingURL=review.js.map