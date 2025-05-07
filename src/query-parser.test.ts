import sut from './query-parser'

describe('Query Parser', () => {

    it('Parse null properties', () => {

        const properties = null

        const answer = sut.parseProperties(properties)

        expect(answer).toBeDefined()

        expect(Object.keys(answer).length).toEqual(0)
        expect(Object.values(answer).length).toEqual(0)
    })

    it('Parse undefined undefined', () => {

        const properties = undefined

        const answer = sut.parseProperties(properties)

        expect(answer).toBeDefined()

        expect(Object.keys(answer).length).toEqual(0)
        expect(Object.values(answer).length).toEqual(0)
    })

    it('Parse empty properties', () => {

        const properties:string[] = []

        const answer = sut.parseProperties(properties)

        expect(answer).toBeDefined()

        expect(Object.keys(answer).length).toEqual(0)
        expect(Object.values(answer).length).toEqual(0)
    })

    it('Parse properties without value', () => {

        const properties:string[] = ['foo']

        const answer = sut.parseProperties(properties)

        expect(answer).toBeDefined()

        expect(Object.keys(answer)).toEqual(['foo'])
        expect(Object.values(answer)).toEqual([undefined])
    })

    it('Parse properties', () => {

        const properties:string[] = ['foo:bar']

        const answer = sut.parseProperties(properties)

        expect(answer).toBeDefined()

        expect(Object.keys(answer)).toEqual(['foo'])
        expect(Object.values(answer)).toEqual(['bar'])
    })

    it('Parse typed properties', () => {

        const properties:string[] = ['married:true','age:33','name:Julius','dob:2025-05-07']

        const answer = sut.parseProperties(properties)

        expect(answer).toBeDefined()

        expect(answer).toEqual({age:33,married:true,name:'Julius', dob: new Date('2025-05-07')})
    })

})

