import timeRange from './time-range'
import {DateTime} from "luxon";

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
})

