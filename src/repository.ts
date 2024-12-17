import {Container, CosmosClient} from '@azure/cosmos'
import entityUtils from './entity.utils'

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

const get = async (id: string, partition: string) => {

    const container = await containerInstance()

    const {resource} = await container.item(id, partition).read()

    return entityUtils.cleanUp(resource)
}

const update = async (item: any) => {

    const container = await containerInstance()

    const {resource} = await container.items.upsert(item)

    return entityUtils.cleanUp(resource)
}


const remove = async (id: string, partition: string) => {

    const container = await containerInstance()

    const {resource} = await container.item(id, partition).delete()

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
        map: (converter: any) => {
            data.content = data.content.map(converter)
        }
    }

    return data
}

const fetchTotalCount = async (querySpec: any, container: any) => {

    const {query, parameters} = querySpec

    const tokens = query.split("WHERE")

    let totalQuery = "SELECT VALUE COUNT(1) FROM c "

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
    get, query, save, update, remove
}