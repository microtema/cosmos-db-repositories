import {DateTime} from 'luxon'
import timeUtil from './time.utils'

// Default time zone from environment variables or fallback to "Europe/Berlin"
const DEFAULT_ZONE: string = process.env.DEFAULT_ZONE || 'Europe/Berlin'

const parse = (time: string, zone: string = DEFAULT_ZONE) => {

    if (!time) {
        return null
    }
    switch (time.toLowerCase()) {
        case 'yesterday':
            return buildYesterdayRange(zone)
        case 'today':
            return buildAllDayRange(zone)
        case 'tomorrow':
            return buildTomorrowRange(zone)
        case 'this week':
            return buildAllWeekRange(zone)
        case 'last week':
            return buildLastWeekRange(zone)
        case 'next week':
            return buildNextWeekRange(zone)
        case 'weekly':
            return buildWeeklyRange(zone)
        case 'this month':
            return buildAllMonthRange(zone)
        case 'last month':
            return buildLastMonthRange(zone)
        case 'next month':
            return buildNextMonthRange(zone)
        case 'this quarter':
            return buildThisQuarterRange(zone)
        case 'next quarter':
            return buildNextQuarterRange(zone)
        case 'last quarter':
            return buildLastQuarterRange(zone)
        case '1 quarter':
            return build1QuarterRange(zone)
        case '2 quarter':
            return build2QuarterRange(zone)
        case '3 quarter':
            return build3QuarterRange(zone)
        case '4 quarter':
            return build4QuarterRange(zone)
        case 'all':
            return buildRange(DateTime.now().setZone(zone).minus({year: 10}).startOf('day'), DateTime.now().setZone(zone).plus({year: 10}).endOf('day'))
    }

    return time.split(',')
        .map(it => it.trim())
        .map(it => timeUtil.toUTC(it, zone))
        .map(it => it.toISOString())
}

const buildYesterdayRange = (zone: string) => {

    const now = DateTime.now().setZone(zone)
    const start = now.startOf('day').minus({day: 1})
    const end = start.endOf('day')

    return buildRange(start, end)
}

const buildAllDayRange = (zone: string) => {

    const now = DateTime.now().setZone(zone)
    const start = now.startOf('day')
    const end = start.endOf('day')

    return buildRange(start, end)
}

const buildTomorrowRange = (zone: string) => {

    const now = DateTime.now().setZone(zone)
    const start = now.plus({days: 1}).startOf('day')
    const end = start.endOf('day')

    return buildRange(start, end)
}

const buildAllWeekRange = (zone: string) => {

    const now = DateTime.now().setZone(zone)
    const start = now.startOf('week')
    const end = start.endOf('week')

    return buildRange(start, end)
}

const buildLastWeekRange = (zone: string) => {

    const now = DateTime.now().setZone(zone)
    const start = now.minus({month: 1}).startOf('week')
    const end = start.endOf('week')

    return buildRange(start, end)
}

const buildNextWeekRange = (zone: string) => {

    const now = DateTime.now().setZone(zone)
    const start = now.plus({month: 1}).startOf('week')
    const end = start.endOf('week')

    return buildRange(start, end)
}

const   buildWeeklyRange = (zone: string) => {

    const now = DateTime.now().setZone(zone)

    // Find this week's Tuesday at 09:00
    const thisTuesday = now.set({ weekday: 2, hour: 8, minute: 0, second: 0, millisecond: 0 })

    // If we're before this Tuesday 10:00, shift to last week
    const end = now < thisTuesday ? thisTuesday.minus({ weeks: 1 }) : thisTuesday

    // Start is previous Tuesday at 08:00
    const start = end.minus({ weeks: 1 }).set({ hour: 9, minute: 0 })

    return buildRange(start, end)
}

const buildAllMonthRange = (zone: string) => {

    const now = DateTime.now().setZone(zone)
    const start = now.startOf('month')
    const end = start.endOf('month')

    return buildRange(start, end)
}

const buildNextMonthRange = (zone: string) => {

    const now = DateTime.now().setZone(zone);
    const start = now.plus({month: 1}).startOf('month')
    const end = start.endOf('month')

    return buildRange(start, end)
}

const buildLastMonthRange = (zone: string) => {

    const now = DateTime.now().setZone(zone);
    const start = now.minus({month: 1}).startOf('month')
    const end = start.endOf('month')

    return buildRange(start, end)
}

const buildThisQuarterRange = (zone: string) => {

    const now = DateTime.now().setZone(zone)

    const quarter = now.quarter

    switch (quarter) {
        case 1:
            return build1QuarterRange(zone)
        case 2:
            return build2QuarterRange(zone)
        case 3:
            return build3QuarterRange(zone)
        case 4:
            return build4QuarterRange(zone)
    }

    throw new Error('Unsupported quarter index: ' + quarter)
}

const buildLastQuarterRange = (zone: string) => {

    const now = DateTime.now().setZone(zone)

    const quarter = now.quarter

    switch (quarter) {
        case 1:
            return buildLastQuarterFromLastYearRange(zone)
        case 2:
            return build1QuarterRange(zone)
        case 3:
            return build2QuarterRange(zone)
        case 4:
            return build3QuarterRange(zone)
    }

    throw new Error('Unsupported quarter index: ' + quarter)
}

const buildNextQuarterRange = (zone: string) => {

    const now = DateTime.now().setZone(zone)

    const quarter = now.quarter

    switch (quarter) {
        case 1:
            return build2QuarterRange(zone)
        case 2:
            return build3QuarterRange(zone)
        case 3:
            return build4QuarterRange(zone)
        case 4:
            return buildNextQuarterFromNextYearRange(zone)
    }

    throw new Error('Unsupported quarter index: ' + quarter)
}

const buildLastQuarterFromLastYearRange = (zone: string) => {

    const now = DateTime.now().setZone(zone)
    const start = now.endOf('year').minus({year: 1})
    const end = start.plus({month: 3})

    return buildRange(start, end)
}

const buildNextQuarterFromNextYearRange = (zone: string) => {

    const now = DateTime.now().setZone(zone)
    const start = now.endOf('year')
    const end = start.plus({month: 3})

    return buildRange(start, end)
}

const build1QuarterRange = (zone: string) => {

    const now = DateTime.now().setZone(zone)
    const start = now.startOf('year')
    const end = start.plus({month: 3})

    return buildRange(start, end)
}

const build2QuarterRange = (zone: string) => {

    const now = DateTime.now().setZone(zone)
    const start = now.startOf('year').plus({month: 3})
    const end = start.plus({month: 3})

    return buildRange(start, end)
}

const build3QuarterRange = (zone: string) => {

    const now = DateTime.now().setZone(zone)
    const start = now.startOf('year').plus({month: 6})
    const end = start.plus({month: 3})

    return buildRange(start, end)
}

const build4QuarterRange = (zone: string) => {

    const now = DateTime.now().setZone(zone);
    const start = now.startOf('year').plus({month: 9})
    const end = start.plus({month: 3})

    return buildRange(start, end)
}


const buildRange = (start: DateTime, end: DateTime) => {

    return [start.toJSDate().toISOString(), end.toJSDate().toISOString()]
}

export default {parse}