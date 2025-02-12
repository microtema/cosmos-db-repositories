import timeRange from './time-range'
import timeUtil from './time.utils'
import {DateTime} from 'luxon'

describe('Time Range', () => {

    const sut = timeRange

    it('today', () => {

        const time = 'today'

        const answer = sut.parse(time) as string[]

        expect(answer).toBeDefined()
        expect(answer.length).toEqual(2)

        const [from, to] = answer

        expect(from).toBeDefined()
        expect(timeUtil.isDateTimeFormat(from)).toEqual(true)
        expect(DateTime.fromISO(from)).toBeDefined()

        expect(to).toBeDefined()
        expect(DateTime.fromISO(to)).toBeDefined()

    })

    it('all', () => {

        const timeRanges = [
            'yesterday', 'today', 'tomorrow',
            'last week', 'this week', 'next week',
            'last month', 'this month', 'next month',
            'last quarter', 'this quarter', 'next quarter',
            '1 quarter', '2 quarter', '3 quarter', '4 quarter'
        ]

        timeRanges.forEach(it => {
            const answer = sut.parse(it)

            expect(answer).toBeDefined()
            expect(answer?.length).toEqual(2)
            console.log(it, ' -> ', answer)
        })

    })

    it('today with custom zone', () => {

        const time = 'today'
        const zone = 'Europe/Berlin'

        const answer = sut.parse(time, zone)

        expect(answer).toEqual(sut.parse(time))

    })

    it('custom', () => {

        const time = '2025-01-02,2025-03-02'

        const answer = sut.parse(time) as string[]

        expect(answer).toBeDefined()
        expect(answer.length).toEqual(2)

        const [from, to] = answer

        expect(from).toBeDefined()
        expect(from).toEqual('2025-01-01T23:00:00.000Z')

        expect(to).toBeDefined()
        expect(to).toEqual('2025-03-01T23:00:00.000Z')
    })

    it('custom with custom zone', () => {

        const time = '2025-01-02, 2025-03-02'
        const zone = 'Europe/Berlin'

        const answer = sut.parse(time, zone) as string[]

        expect(answer).toBeDefined()
        expect(answer.length).toEqual(2)

        const [from, to] = answer

        expect(from).toBeDefined()
        expect(from).toEqual('2025-01-01T23:00:00.000Z')

        expect(to).toBeDefined()
        expect(to).toEqual('2025-03-01T23:00:00.000Z')
    })
})

