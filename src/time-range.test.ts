import timeRange from './time-range'
import {DateTime, Zone} from 'luxon'

describe('Time Range', () => {

    const sut = timeRange

    it('today', () => {

        const time = 'today'

        const answer = sut.parse(time) as string[]

        expect(answer).toBeDefined()
        expect(answer.length).toEqual(2)

        const [from, to] = answer

        expect(from).toBeDefined()
        expect(DateTime.fromISO(from)).toBeDefined()

        expect(to).toBeDefined()
        expect(DateTime.fromISO(to)).toBeDefined()

    })

    it('custom', () => {

        const time = 'start,end'

        const answer = sut.parse(time) as string[]

        expect(answer).toBeDefined()
        expect(answer.length).toEqual(2)

        const [from, to] = answer

        expect(from).toBeDefined()
        expect(from).toEqual('start')

        expect(to).toBeDefined()
        expect(to).toEqual('end')
    })

    it('custom with trim', () => {

        const time = 'start, end'

        const answer = sut.parse(time) as string[]

        expect(answer).toBeDefined()
        expect(answer.length).toEqual(2)

        const [from, to] = answer

        expect(from).toBeDefined()
        expect(from).toEqual('start')

        expect(to).toBeDefined()
        expect(to).toEqual('end')
    })
})

