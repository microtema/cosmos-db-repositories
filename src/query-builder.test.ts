import queryBuilder from './query-builder'

describe('Query Builder', () => {

    const sut = queryBuilder

    it('build nested query spec', () => {

        const searchValue = ''
        const orderBy = 'firstName'
        const jobTitle = 'Consultant'
        const type = 'internal'
        const project = 'Microtema'

        const searchFields = ['displayName', 'givenName', 'surname', 'mail', 'jobTitle']
        const matchFields = {jobTitle, type, 'projects.name': project, markAsDeleted: false}

        const answer = sut.build({searchValue, searchFields, matchFields, orderBy})

        expect(answer).toBeDefined()
        expect(answer.parameters).toEqual([ {
            "name": "@jobTitle",
            "value": "Consultant",
        }, {
            "name": "@type",
            "value": "internal",
        }, {
            "name": "@projects_name",
            "value": "Microtema",
        }, {
            "name": "@markAsDeleted",
            "value": false,
        }])
        expect(answer.query).toEqual('SELECT * FROM c WHERE 1=1 AND c.jobTitle = @jobTitle AND c.type = @type AND ARRAY_CONTAINS(c.projects, {"name": @projects_name}, true) AND c.markAsDeleted = @markAsDeleted ORDER BY c.firstName DESC')
    })

    it('build query spec', () => {

        const searchValue = ''
        const searchFields: string[] = []
        const matchFields = {}
        const orderBy = ''

        const answer = sut.build({searchValue, searchFields, matchFields, orderBy})

        expect(answer).toBeDefined()
        expect(answer.parameters).toEqual([])
        expect(answer.query).toEqual("SELECT * FROM c")
    })

    it('build timestamp range query spec', () => {

        const searchValue = ''
        const searchFields: string[] = []
        const matchFields = {updatedDate: ['2025-01-17T22:18:54.245Z', '2025-01-17T22:18:54.245Z']}
        const orderBy = ''

        const answer = sut.build({searchValue, searchFields, matchFields, orderBy})

        expect(answer).toBeDefined()
        expect(answer.parameters).toEqual([{
            "name": "@from_updatedDate",
            "value": "2025-01-17T22:18:54.245Z",
        }, {
            "name": "@to_updatedDate",
            "value": "2025-01-17T22:18:54.245Z",
        }])
        expect(answer.query).toEqual("SELECT * FROM c WHERE 1=1 AND c.updatedDate >= @from_updatedDate AND c.updatedDate <= @to_updatedDate")
    })

    it('build timestamp query spec', () => {

        const searchValue = ''
        const searchFields: string[] = []
        const matchFields = {startDate: '2025-01-17T22:18:54.245Z'}
        const orderBy = ''

        const answer = sut.build({searchValue, searchFields, matchFields, orderBy})

        expect(answer).toBeDefined()
        expect(answer.parameters).toEqual([{
            "name": "@startDate",
            "value": "2025-01-17T22:18:54.245Z",
        }])
        expect(answer.query).toEqual("SELECT * FROM c WHERE 1=1 AND c.startDate = @startDate")
    })

    it('build or, and orderBy query spec', () => {

        const searchValue = 'foo'
        const searchFields = ['firstName']
        const matchFields = {age: '30'}
        const orderBy = 'name'

        const answer = sut.build({searchValue, searchFields, matchFields, orderBy})

        expect(answer).toBeDefined()
        expect(answer.parameters).toEqual([{"name": "@q", "value": "foo"}, {"name": "@age", "value": "30"}])
        expect(answer.query).toEqual("SELECT * FROM c WHERE 1=1 AND CONTAINS(LOWER(c.firstName), @q) AND c.age = @age ORDER BY c.name DESC")
    })

    it('build ors, and and orderBy query spec', () => {

        const searchValue = 'foo'
        const searchFields = ['firstName', 'lastName']
        const matchFields = {age: '30', mail: 'info@mail.com'}
        const orderBy = 'name'

        const answer = sut.build({searchValue, searchFields, matchFields, orderBy})

        expect(answer).toBeDefined()
        expect(answer.parameters).toEqual([{
            "name": "@q",
            "value": "foo"
        }, {
            "name": "@age",
            "value": "30",
        }, {
            "name": "@mail",
            "value": "info@mail.com",
        }])
        expect(answer.query).toEqual("SELECT * FROM c WHERE 1=1 AND (CONTAINS(LOWER(c.firstName), @q) OR CONTAINS(LOWER(c.lastName), @q)) AND c.age = @age AND c.mail = @mail ORDER BY c.name DESC")
    })

    it('build or, and and orderBy multiple query spec', () => {

        const searchValue = 'foo'
        const searchFields = ['firstName', 'lastName']
        const matchFields = {age: '30', mail: 'info@mail.com'}
        const orderBy = 'firstName,lastName'

        const answer = sut.build({searchValue, searchFields, matchFields, orderBy})

        expect(answer).toBeDefined()
        expect(answer.parameters).toEqual([{
            "name": "@q",
            "value": "foo"
        }, {
            "name": "@age",
            "value": "30",
        }, {
            "name": "@mail",
            "value": "info@mail.com",
        }])
        expect(answer.query).toEqual("SELECT * FROM c WHERE 1=1 AND (CONTAINS(LOWER(c.firstName), @q) OR CONTAINS(LOWER(c.lastName), @q)) AND c.age = @age AND c.mail = @mail ORDER BY c.firstName DESC, c.lastName DESC")
    })

    it('build or, and and orderBy multiple query ASC spec', () => {

        const searchValue = 'foo'
        const searchFields = ['firstName', 'lastName']
        const matchFields = {age: '30', mail: 'info@mail.com'}
        const orderBy = '!firstName,lastName'

        const answer = sut.build({searchValue, searchFields, matchFields, orderBy})

        expect(answer).toBeDefined()
        expect(answer.parameters).toEqual([{
            "name": "@q",
            "value": "foo"
        }, {
            "name": "@age",
            "value": "30",
        }, {
            "name": "@mail",
            "value": "info@mail.com",
        }])
        expect(answer.query).toEqual("SELECT * FROM c WHERE 1=1 AND (CONTAINS(LOWER(c.firstName), @q) OR CONTAINS(LOWER(c.lastName), @q)) AND c.age = @age AND c.mail = @mail ORDER BY c.firstName ASC, c.lastName ASC")
    })
})

