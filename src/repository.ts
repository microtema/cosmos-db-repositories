import {Container, CosmosClient, FeedOptions, OperationInput, SqlQuerySpec, UpsertOperationInput} from '@azure/cosmos'
import entityUtils from './entity.utils'
import {v4 as uuid} from 'uuid'
import {timeDuration} from "./time.utils";

let container: Container

const containerInstance = async () => {

    if (!container) {

        const endpoint = process.env.AZURE_DATASOURCE_URL as string;
        const key = process.env.AZURE_DATASOURCE_KEY as string;
        const databaseId = process.env.AZURE_DATASOURCE_DATABASE_ID as string;
        const containerId = process.env.AZURE_DATASOURCE_CONTAINER_ID as string;

        container = new CosmosClient({endpoint, key}).database(databaseId).container(containerId)
    }

    return container
}

const save = async (item: any) => {

    const container = await containerInstance()

    const {resource} = await container.items.create(item)

    return entityUtils.cleanUp(resource)
}

function chunk<T>(array: T[], size: number): T[][] {
    return Array.from({length: Math.ceil(array.length / size)}, (_, i) =>
        array.slice(i * size, i * size + size)
    )
}

const bulk = async (operations: UpsertOperationInput[]) => {

    const BULK_CHUNK_SIZE = 100
    const partitionKey = process.env.AZURE_DATASOURCE_PARTITION_KEY as string
    let importDataCount = 0
    let importDataFailedCount = 0
    const failed :any[] = []
    const token = uuid()
    const startDate = new Date()

    console.log('Start migrate (' + operations.length + ') users at ', startDate.toISOString())

    // Group by partition key
    const groups = new Map<string, UpsertOperationInput[]>()

    for (const item of operations) {

        const pk = item.resourceBody[partitionKey] as string
        item.partitionKey = pk

        if (!groups.has(pk)) {
            groups.set(pk, [])
        }

        groups.get(pk)!.push(item)
    }

    const container = await containerInstance()

    for (const [partitionKey, groupItems] of groups) {
        const chunks = chunk(groupItems, BULK_CHUNK_SIZE)

        let groupImportDataCount = 0
        let groupImportDataFailedCount = 0

        for (const chunkItems of chunks) {

            const response = await container.items.bulk(chunkItems)

            let chunkImportDataCount = 0
            let chunkImportDataFailedCount = 0

            response.forEach((res, i) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    chunkImportDataCount++
                    groupImportDataCount++
                    importDataCount++
                } else {
                    chunkImportDataFailedCount++
                    groupImportDataFailedCount++
                    importDataFailedCount++

                    failed.push(chunkItems[i].resourceBody)

                    console.error(`Failed upsert for item [${chunkItems[i]?.resourceBody?.id}] with statusCode: ${res.statusCode}`)
                }
            })

            console.log(`Partition [${partitionKey}] Summary: ${groupImportDataCount} succeeded, ${groupImportDataFailedCount} failed of ${groupItems.length} total items`)
        }
    }

    const now = new Date()

    const duration = timeDuration(startDate.getTime(), now.getTime())

    return {
            total: operations.length,
            imported: importDataCount,
            failed,
            duration,
            token,
            message: 'Data import [' + importDataCount + '] successfully completed and [' + importDataFailedCount + '] failed'
    }
}

const get = async (id: string, partitionKey: string) => {

    const container = await containerInstance()

    const {resource} = await container.item(id, partitionKey).read()

    return entityUtils.cleanUp(resource)
}

const update = async (updatedData: any) => {

    const container = await containerInstance()

    const id = updatedData.id
    const partitionKey  = updatedData[process.env.AZURE_DATASOURCE_PARTITION_KEY as string]

    const { resource: existingItem } = await container.item(id, partitionKey).read();

    // Merge the updates into the existing item
    const updatedItem = {
        ...existingItem,
        ...updatedData, // Override with new data
    }

    const {resource} = await container.item(id, partitionKey).replace(updatedItem)

    return entityUtils.cleanUp(resource)
}


const remove = async (id: string, partitionKey: string) => {

    const container = await containerInstance()

    const {resource} = await container.item(id, partitionKey).delete()

    return entityUtils.cleanUp(resource)
}

const query = async (querySpec: any, pageRequest: any) => {

    const pageable = {pageIndex: 1, rowsPerPage: 25, ...(pageRequest || {})}
    const {pageIndex, rowsPerPage} = pageable

    const container = await containerInstance()

    const totalItems = await fetchTotalCount(querySpec, container) // Total item count

    // Iterate through pages until the desired pageIndex is reached
    const {results, continuationToken} = await fetchResults(querySpec, pageable, container)

    const data = {
        pageIndex,
        rowsPerPage,
        totalItems,
        continuationToken,
        totalPages: Math.ceil(totalItems / rowsPerPage),
        content: results.map(entityUtils.cleanUp),
        map: (converter: any) => data.content = data.content.map(converter)
    }

    return data
}

const nativeQuery = async (query: string | SqlQuerySpec, options?: FeedOptions) => {

    const container = await containerInstance()

    const queryIterator = container.items.query(query, options)

    // Fetch results for the current page
    const {resources: results} = await queryIterator.fetchAll()

    return results || []
}

const fetchTotalCount = async (querySpec: any, container: any) => {

    const {query, parameters} = querySpec

    const tokens = query.split("WHERE")

    let totalQuery = 'SELECT VALUE COUNT(1) FROM c '

    if (tokens.length > 1) {
        totalQuery += 'WHERE' + tokens[1]
    }

    const totalQuerySpec = {query: totalQuery.trim(), parameters}

    const {resources} = await container.items.query(totalQuerySpec).fetchAll()

    return resources ? resources[0] : 0 // Single value for the total count
}

const fetchPaginatedResults = async (querySpec: any, rowsPerPage: number, continuationToken = null, container: any) => {

    // Calculate the offset based on pageIndex and rowsPerPage
    const options = {
        maxItemCount: rowsPerPage, // Limit items per page
        continuationToken, // Token for the next page
    }

    const queryIterator = container.items.query(querySpec, options)

    // Fetch results for the current page
    const {resources: results, continuationToken: nextToken} = await queryIterator.fetchNext()

    return {results: results || [], nextToken}
}

const fetchResults = async (querySpec: any, pageable: any, container: any) => {

    const {pageIndex, rowsPerPage} = pageable

    let continuationToken = null
    let currentPageIndex = 1 // 1 base page index
    let pageResults = []

    // Iterate through pages until the desired pageIndex is reached
    do {
        const {results, nextToken} = await fetchPaginatedResults(querySpec, rowsPerPage, continuationToken, container)

        continuationToken = nextToken

        if (currentPageIndex === pageIndex) {
            pageResults = results
            break;
        }
        currentPageIndex++;
    } while (continuationToken)

    return {results: pageResults, continuationToken}
}

export default {
    get, query, save, update, remove, bulk, nativeQuery, containerInstance
}