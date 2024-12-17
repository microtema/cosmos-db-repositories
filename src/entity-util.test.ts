import entityUtil from './entity.utils'

describe('entity Util', () => {

    const sut = entityUtil

    it('cleanup', () => {

        const entity = {name: 'foo', _rid: 'undefined', _self: 'undefined',  _etag: 'undefined', _attachments: 'undefined', _ts: 'undefined'}

        const answer = sut.cleanUp(entity)

        expect(answer).toBeDefined()
        expect(answer).toEqual({"name": "foo"})

    })
})

