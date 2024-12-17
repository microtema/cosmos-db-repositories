import repository from './repository'

describe('repository', () => {

    const sut = repository

    it('get', async () => {

        expect(sut.get).toBeDefined()
    })
})

