import {URLSearchParams} from "url";

const parseProperties = (properties: string[] | null | undefined | never) => {

    const matchFields: Record<string, any> = {}

    if (!properties || !properties.length) {
        return matchFields
    }

    for (let i = 0; i < properties.length; i++) {

        const tokens = properties[i].split(',')

        for (let j = 0; j < tokens.length; j++) {
            const token = tokens[j]
            const [name, value] = token.split(':')
            matchFields[name] = inferQueryValue(value)
        }
    }

    return matchFields
}

const parse = (query: URLSearchParams, headers: any) => {

    // pageable
    const pageIndex = Math.max(1, Number.parseInt((query.get('page') || '1')))
    const rowsPerPage = Number.parseInt((query.get('limit') || '25'))
    const continuationToken = headers.get('x-ms-continuation')

    const orderBy = query.get('sort')

    const properties = parseProperties(query.getAll('p'))

    const searchValue = (query.get('q') || '').toLowerCase()

    return {pageable: {rowsPerPage, pageIndex, continuationToken}, properties, orderBy, searchValue}
}

/**
 * Infers the type of a single query parameter value.
 * Supports JSON object, number, boolean, date, and string.
 */
export function inferQueryValue(value: string | null | undefined): string | number | boolean | Date | object | undefined {
    if (value == null) return undefined;

    try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && parsed !== null) {
            return parsed;
        }
    } catch (_) {
    }

    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value)) && value.trim() !== '') return Number(value);
    if (!isNaN(Date.parse(value))) return new Date(value);

    return value;
}

export default {
    parseProperties,
    parse
}