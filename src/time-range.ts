import {DateTime} from 'luxon'
import timeUtil from './time.utils'

// Default time zone from environment variables or fallback to "Europe/Berlin"
const DEFAULT_ZONE: string = process.env.DEFAULT_ZONE || 'Europe/Berlin'

const parse = (time: string, zone: string = DEFAULT_ZONE) => {

    if (!time) {
        return null
    }
    switch (time.toLowerCase()) {
        case 'today':
            return buildAllDayRange(zone)
        case 'tomorrow':
            return buildTomorrowRange(zone)
        case 'this week':
            return buildAllWeekRange(zone)
        case 'next week':
            return buildNextWeekRange(zone)
        case 'this month':
            return buildAllMonthRange(zone)
        case 'next month':
            return buildNextMonthRange(zone)
    }

    return time.split(',')
        .map(it => it.trim())
        .map(it => timeUtil.toUTC(it, zone))
        .map(it => it.toISOString())
}

const buildAllDayRange = (zone: string) => {

    const now = DateTime.now().setZone(zone);
    const start = now.startOf('day');
    const end = now.endOf('day');

    return buildRange(start, end)
}

const buildTomorrowRange = (zone: string) => {

    const now = DateTime.now().setZone(zone);
    const start = now.plus({days: 1}).startOf('day');
    const end = now.plus({days: 1}).endOf('day');

    return buildRange(start, end)
}

const buildAllWeekRange = (zone: string) => {

    const now = DateTime.now().setZone(zone);
    const start = now.startOf('week')
    const end = now.endOf('week')

    return buildRange(start, end)
}

const buildNextWeekRange = (zone: string) => {

    const now = DateTime.now().setZone(zone);
    const start = now.startOf('week').plus({days: 7}).startOf('day')
    const end = now.endOf('week').plus({days: 7}).endOf('day')

    return buildRange(start, end)
}

const buildAllMonthRange = (zone: string) => {

    const now = DateTime.now().setZone(zone);
    const start = now.startOf('month')
    const end = now.endOf('month')

    return buildRange(start, end)
}

const buildNextMonthRange = (zone: string) => {

    const now = DateTime.now().setZone(zone);
    const start = now.plus({month: 1}).startOf('month')
    const end = now.plus({month: 1}).endOf('month')

    return buildRange(start, end)
}

const buildRange = (start: DateTime, end: DateTime) => {

    return [start.toJSDate().toISOString(), end.toJSDate().toISOString()]
}

export default {parse}