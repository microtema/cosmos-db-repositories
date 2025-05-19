import entityUtil from './entity.utils'

describe('entity Util', () => {

    const sut = entityUtil

    it('cleanup', () => {

        const entity = {
            name: 'foo',
            _rid: 'undefined',
            _self: 'undefined',
            _etag: 'undefined',
            _attachments: 'undefined',
            _ts: 'undefined'
        }

        const answer = sut.cleanUp(entity)

        expect(answer).toBeDefined()
        expect(answer).toEqual({"name": "foo"})
    })

    it('create', () => {

        const entity = {name: 'foo'}

        const answer = sut.create<any, any>(entity)

        expect(answer).toBeDefined()
        expect(answer.id).toBeDefined()
        expect(answer.createdDate).toBeDefined()

        expect(answer).toEqual({"name": "foo", markAsDeleted: false, createdDate: answer.createdDate, id: answer.id})
    })

    it('create with meta as object', () => {

        const entity = {name: 'foo'}

        const answer = sut.create<any, any>(entity, {meta: true})

        expect(answer).toBeDefined()
        expect(answer).toEqual({"name": "foo", markAsDeleted: false, createdDate: answer.createdDate, meta: true, id: answer.id})
    })

    it('create with meta as function', () => {

        const entity = {name: 'foo'}

        const answer = sut.create<any, any>(entity, (e: any) => ({meta: true}))

        expect(answer).toBeDefined()
        expect(answer).toEqual({"name": "foo", markAsDeleted: false, createdDate: answer.createdDate, meta: true, id: answer.id})
    })

    it('create with meta as function', () => {

        const entity = {name: 'foo'}

        const answer = sut.create<any, any>(entity, (e: any) => ({meta: e.name.toUpperCase()}))

        expect(answer).toBeDefined()
        expect(answer).toEqual({"name": "foo", markAsDeleted: false, createdDate: answer.createdDate, meta: "FOO", id: answer.id})
    })

    it('update', () => {

        const entity = {name: 'foo'}

        const answer = sut.update<any, any>(entity)

        expect(answer).toBeDefined()
        expect(answer.updatedDate).toBeDefined()

        expect(answer).toEqual({"name": "foo", updatedDate: answer.updatedDate, id: answer.id})
    })

    it('update with meta as object', () => {

        const entity = {name: 'foo'}

        const answer = sut.update<any, any>(entity, {meta: true})

        expect(answer).toBeDefined()
        expect(answer).toEqual({"name": "foo", updatedDate: answer.updatedDate, meta: true})
    })

    it('update with meta as function', () => {

        const entity = {name: 'foo'}

        const answer = sut.update<any, any>(entity, (e: any) => ({meta: true}))

        expect(answer).toBeDefined()
        expect(answer).toEqual({"name": "foo", updatedDate: answer.updatedDate, meta: true})
    })

    it('update with meta as function', () => {

        const entity = {name: 'foo'}

        const answer = sut.update<any, any>(entity, (e: any) => ({meta: e.name.toUpperCase()}))

        expect(answer).toBeDefined()
        expect(answer).toEqual({"name": "foo", updatedDate: answer.updatedDate, meta: "FOO"})
    })
})

