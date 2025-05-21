export const formatCurrency = value => {
    if (!value) {
        return "$0.00"
    }
    if (typeof value === 'string') {
        if (value.length && value.charAt(0) === '$') {
            return value;
        }
        if (value.length > 1 && value.charAt(1) === '$') {
            return value;
        }
    }
    let parsed = Number.parseFloat(value)
    const negative = parsed < 0
    if (negative) {
        parsed *= -1
    }
    const val = parsed.toFixed(2)
    let formatted = '$' + val.replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
    if (negative) {
        formatted = "(" + formatted + ")"
    }
    return formatted
}

export function formatDate(date) {
    date = toDate(date)
    if (!date) { return '' }
    return date.toLocaleDateString([], {timeZone})
}

/**
 * Format a Date or a numeric timestamp as a date time string in Indiana time.
 */
export function formatDateTime(date) {
    date = toDate(date)
    if (!date) { return '' }
    return date.toLocaleString([], {timeZone})
}

/**
 * Format a Date or a numeric timestamp as a time string in Indiana time.
 */
export function formatTime(date) {
    date = toDate(date)
    if (!date) { return '' }
    return date.toLocaleTimeString([], {timeZone})
}
