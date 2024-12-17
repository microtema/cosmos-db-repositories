const cleanUp = (entity:any) => {

    return {...entity, _rid: undefined, _self: undefined,  _etag: undefined, _attachments: undefined, _ts: undefined}
}

export default {
    cleanUp
}