/**
 * Get the current user timezone from localStorage
 * @returns {string} The timezone string
 */
const getUserTimezone = () => {
    try {
        const stored = localStorage.getItem("user_timezone");
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.value || "UTC";
        }
    } catch {
        // If parsing fails, use UTC
    }
    return "UTC";
};

/**
 * Format a date string to a localized date/time string using the user's selected timezone
 * @param {string|Date} dateString - The date to format
 * @param {object} options - Formatting options (same as toLocaleString options)
 * @returns {string} Formatted date string
 */
export const formatDateWithTimezone = (dateString, options = {}) => {
    if (!dateString) return "—";

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "—";

        // Get timezone from localStorage (fallback to UTC if not set)
        const timezone = getUserTimezone();

        const defaultOptions = {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: timezone,
        };

        const mergedOptions = { ...defaultOptions, ...options };

        return date.toLocaleString("en-US", mergedOptions);
    } catch (error) {
        console.error("Error formatting date:", error);
        return "—";
    }
};

/**
 * Format a date string to a date-only string using the user's selected timezone
 * @param {string|Date} dateString - The date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDateOnly = (dateString, options = {}) => {
    if (!dateString) return "—";

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "—";

        const timezone = getUserTimezone();

        const defaultOptions = {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: timezone,
        };

        const mergedOptions = { ...defaultOptions, ...options };

        return date.toLocaleDateString("en-US", mergedOptions);
    } catch (error) {
        console.error("Error formatting date:", error);
        return "—";
    }
};

/**
 * Format a date string to a time-only string using the user's selected timezone
 * @param {string|Date} dateString - The date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted time string
 */
export const formatTimeOnly = (dateString, options = {}) => {
    if (!dateString) return "—";

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "—";

        const timezone = getUserTimezone();

        const defaultOptions = {
            hour: "2-digit",
            minute: "2-digit",
            second: options.showSeconds ? "2-digit" : undefined,
            timeZone: timezone,
        };

        const mergedOptions = { ...defaultOptions, ...options };
        // Remove undefined values
        Object.keys(mergedOptions).forEach(
            (key) => mergedOptions[key] === undefined && delete mergedOptions[key]
        );

        return date.toLocaleTimeString("en-US", mergedOptions);
    } catch (error) {
        console.error("Error formatting time:", error);
        return "—";
    }
};

/**
 * React hook version - uses localStorage for timezone
 */
export const useFormatDate = () => {
    const timezone = getUserTimezone();

    const formatDate = (dateString, options = {}) => {
        if (!dateString) return "—";

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "—";

            const defaultOptions = {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: timezone,
            };

            const mergedOptions = { ...defaultOptions, ...options };

            return date.toLocaleString("en-US", mergedOptions);
        } catch (error) {
            console.error("Error formatting date:", error);
            return "—";
        }
    };

    const formatDateOnly = (dateString, options = {}) => {
        if (!dateString) return "—";

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "—";

            const defaultOptions = {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: timezone,
            };

            const mergedOptions = { ...defaultOptions, ...options };

            return date.toLocaleDateString("en-US", mergedOptions);
        } catch (error) {
            console.error("Error formatting date:", error);
            return "—";
        }
    };

    const formatTimeOnly = (dateString, options = {}) => {
        if (!dateString) return "—";

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "—";

            const defaultOptions = {
                hour: "2-digit",
                minute: "2-digit",
                second: options.showSeconds ? "2-digit" : undefined,
                timeZone: timezone,
            };

            const mergedOptions = { ...defaultOptions, ...options };
            Object.keys(mergedOptions).forEach(
                (key) => mergedOptions[key] === undefined && delete mergedOptions[key]
            );

            return date.toLocaleTimeString("en-US", mergedOptions);
        } catch (error) {
            console.error("Error formatting time:", error);
            return "—";
        }
    };

    return { formatDate, formatDateOnly, formatTimeOnly };
};

