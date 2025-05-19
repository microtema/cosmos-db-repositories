import { v4 as uuid } from 'uuid'

const cleanUp = (entity: any) => {

    return {...entity, _rid: undefined, _self: undefined, _etag: undefined, _attachments: undefined, _ts: undefined}
}

const create = <O, T>(data: O, supplier?: Function | Object): T => {

    const meta = (typeof supplier === 'function') ? supplier(data) : (supplier || {}) as Object

    return {
        ...data,
        createdDate: new Date(),
        markAsDeleted: false,
        id: uuid(),
        ...meta,
    } as T
}

const update = <O, T>(data: O, supplier?: Function | Object): T => {

    const meta = (typeof supplier === 'function') ? supplier(data) : (supplier || {}) as Object

    return {
        ...data,
        updatedDate: new Date(),
        ...meta,
    } as T
}

export default {
    cleanUp,
    create,
    update
}