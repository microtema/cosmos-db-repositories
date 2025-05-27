import {EventGridPublisherClient, AzureKeyCredential} from '@azure/eventgrid'

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

const send = (event:any) => clientInstance().send(event)

export default {send}