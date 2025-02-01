import timeUtil from './time.utils'

describe('Time Utils', () => {

    const sut = timeUtil

    it('toUTC', () => {

        const time = '2025-02-01'

        const answer = sut.toUTC(time)

        expect(answer).toBeDefined()
        expect(answer).toEqual(new Date('2025-02-01T00:00:00'))
    })

    it('toUTC with  default zone', () => {

        const time = '2025-02-01'
        process.env.DEFAULT_ZONE = 'Europe/Berlin'

        const answer = sut.toUTC(time)

        expect(answer).toBeDefined()
        expect(answer).toEqual(new Date('2025-02-01T00:00:00'))
    })


    it('toUTC with custom zone', () => {

        const time = '2025-02-01'

        const answer = sut.toUTC(time, 'Europe/London')

        expect(answer).toBeDefined()
        expect(answer).toEqual(new Date('2025-02-01T00:00:00.000Z'))
    })

    it('from toUTC to toLocalTime', () => {

        const time = '2025-02-01'

        const answer = sut.toLocalTime(time)

        expect(answer).toBeDefined()
        expect(answer).toEqual(new Date(time))
    })

    it('toLocalTime', () => {

        const time = '2025-02-01'

        const utc = sut.toUTC(time)

        const answer = sut.toLocalTime(utc)

        expect(answer).toBeDefined()
        expect(answer).toEqual(utc)
    })
})