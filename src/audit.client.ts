import {EventGridPublisherClient, AzureKeyCredential} from '@azure/eventgrid'
import {diff} from 'deep-diff'
import {v4 as uuid} from 'uuid'

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

let eventClient: EventGridPublisherClient<'EventGrid'>

const clientInstance = () => {

    if (!eventClient) {

        const topicEndpoint = process.env.AZURE_DATAGRID_TOPIC_URL!
        const topicKey = process.env.AZURE_DATAGRID_TOPIC_KEY!
        const inputSchema = 'EventGrid'

        eventClient = new EventGridPublisherClient(topicEndpoint, inputSchema, new AzureKeyCredential(topicKey))
    }

    return eventClient
}

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

    await clientInstance().send([event])
}


export default {publishEvent}