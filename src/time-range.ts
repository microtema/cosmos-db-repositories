import {DateTime} from 'luxon'


const parse = (time: string) => {

    if (!time) {
        return null
    }
    switch (time.toLowerCase()) {
        case 'today':
            return buildAllDayRange()
        case 'tomorrow':
            return buildTomorrowRange()
        case 'this week':
            return buildAllWeekRange()
        case 'next week':
            return buildNextWeekRange()
        case 'this month':
            return buildAllMonthRange()
        case 'next month':
            return buildNextMonthRange()
    }

    return time
}

function buildAllDayRange() {

    const now = DateTime.now();
    const start = now.startOf('day');
    const end = now.endOf('day');

    return [start.toISO(), end.toISO()]
}

function buildTomorrowRange() {

    const now = DateTime.now();
    const start = now.plus({days: 1}).startOf('day');
    const end = now.plus({days: 1}).endOf('day');

    return [start.toISO(), end.toISO()]
}

function buildAllWeekRange() {

    const now = DateTime.now();
    const start = now.startOf('week')
    const end = now.endOf('week')

    return [start.toISO(), end.toISO()]
}

function buildNextWeekRange() {

    const now = DateTime.now()
    const start = now.startOf('week').plus({days: 7}).startOf('day')
    const end = now.endOf('week').plus({days: 7}).endOf('day')

    return [start.toISO(), end.toISO()]
}

function buildAllMonthRange() {

    const now = DateTime.now()
    const start = now.startOf('month')
    const end = now.endOf('month')

    return [start.toISO(), end.toISO()]
}

function buildNextMonthRange() {

    const now = DateTime.now()
    const start = now.plus({month: 1}).startOf('month')
    const end = now.plus({month: 1}).endOf('month')

    return [start.toISO(), end.toISO()]
}

export default {parse}