import {diff} from 'deep-diff'
import {v4 as uuid} from 'uuid'
import eventClient from './event.client'

interface DocumentKey {
    name: string;
    rowId: string;
    partitionKey: string;
}

export const AuditOperation = {
    INSERT: 'insert',
    UPDATE: 'update',
    DELETE: 'delete',
    SOFT_DELETE: 'soft-delete',
} as const

export type AuditOperationType = typeof AuditOperation[keyof typeof AuditOperation]

const publishEvent = async (eventType: AuditOperationType, userId: string, document: DocumentKey, before?: any, after?: any) => {

    const changes = before && after ? diff(before, after) : undefined
    const eventTime = new Date()

    const data = {
        userId,
        documentId: document.rowId,
        documentKey: document.partitionKey,
        documentType: document.name,
        changes,
        before,
        after
    }

    const event = {
        id: uuid(),
        eventTime,
        eventType,
        subject: 'Audit',
        dataVersion: '1.0',
        data
    }

    await eventClient.send([event])
}


export default {publishEvent}