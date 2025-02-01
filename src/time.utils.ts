import {DateTime} from "luxon"

// Default time zone from environment variables or fallback to "Europe/Berlin"
const DEFAULT_ZONE: string = process.env.DEFAULT_ZONE || "Europe/Berlin";

/**
 * Convert a local datetime string to a JavaScript `Date` object in UTC.
 * @param localDateTime - ISO string representing the local datetime.
 * @param zone - Optional: Override time zone (defaults to process.env.ZONE).
 * @returns JavaScript `Date` object in UTC.
 */
const toUTC = (localDateTime: string, zone: string = DEFAULT_ZONE): Date => {

    const isISO = true

    const utcDate = DateTime[isISO ? 'fromISO' : 'fromSQL'](localDateTime, {zone}).toUTC();
    if (!utcDate.isValid) throw new Error("Invalid date format provided.");
    return utcDate.toJSDate(); // Returns a JavaScript Date object
};

/**
 * Convert a UTC datetime (from CosmosDB) to local time as a `Date` object.
 * @param utcDateTime - JavaScript `Date` object or ISO string.
 * @param zone - Optional: Override time zone (defaults to process.env.ZONE).
 * @returns JavaScript `Date` object in local time.
 */
const toLocalTime = (utcDateTime: Date | string, zone: string = DEFAULT_ZONE): Date => {
    const dt = typeof utcDateTime === "string"
        ? DateTime.fromISO(utcDateTime, {zone: "utc"}) // If input is a string
        : DateTime.fromJSDate(utcDateTime).setZone("utc"); // If input is a Date object

    if (!dt.isValid) throw new Error("Invalid date format provided.");
    return dt.setZone(zone).toJSDate(); // Convert to JavaScript Date object
}

const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

const isISO8601 = (value: string)=> {
    return iso8601Regex.test(value);
}

const dateRegex = /^\d{4}-\d{2}-\d{2}?$/;

const isDateFormat = (value: string)=> {
    return dateRegex.test(value);
}

const isDateTimeFormat = (value: string)=> {
    return isISO8601(value) || isDateFormat(value)
}

export default {toUTC, toLocalTime, isISO8601, isDateFormat, isDateTimeFormat}
