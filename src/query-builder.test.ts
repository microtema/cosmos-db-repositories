import queryBuilder from './query-builder'

describe('Query Builder', () => {

    const sut = queryBuilder

    it('build query spec', () => {

        const searchValue = 'foo'
        const searchFields = ['firstName']
        const matchFields = {age:'30'}
        const orderBy = 'name'

        const answer = sut.build({searchValue, searchFields, matchFields, orderBy})

        expect(answer).toBeDefined()
        expect(answer.parameters).toEqual([{"name": "@q", "value": "foo"}, {"name": "@age", "value": "30"}])
        expect(answer.query).toEqual("SELECT * FROM c WHERE CONTAINS(LOWER(c.firstName), @q) AND c.age = @age ORDER BY c.name DESC")
    })
})

