import timeUtil from './time.utils'

const build = ({searchValue, searchFields, matchFields, orderBy}: {
    searchValue: string,
    searchFields: string[],
    matchFields: any,
    orderBy: string
}) => {

    let query: string = 'SELECT * FROM c'
    const parameters: any[] = []

    const andOperations: string[] = []
    const orOperations: string[] = []

    if (searchValue && searchFields.length) {

        parameters.push({name: '@q', value: searchValue})

        searchFields.forEach(it => orOperations.push('CONTAINS(LOWER(c.' + it + '), @q)'))
    }

    const validFields = Object.keys(matchFields).filter(it => {

        const val = matchFields[it]

        if (val === undefined || val === null || val.length === 0) {
            return false
        }

        if (val instanceof Array) {
            return val.filter(it => it !== null && it !== undefined && it.length > 0).length > 0
        }

        return true
    })


    validFields.forEach(it => {

        const val = matchFields[it]
        let key = it.split('.').join('_')

        if (key[0] === '!') {
            key = key.substring(1)
        }

        if (val instanceof Array) {

            if (timeUtil.isDateTimeFormat(val[0])) {
                parameters.push({name: '@from_' + key, value: timeUtil.toUTC(val[0])})
                parameters.push({name: '@to_' + key, value: timeUtil.toUTC(val[1] || new Date().toISOString())})
            } else {
                parameters.push({name: '@' + key, value: val})
            }
        } else {

            let value = val

            if (value[0] === '!') {
                value = value.substring(1)
            }

            if (timeUtil.isDateTimeFormat(value)) {
                parameters.push({name: '@' + key, value: timeUtil.toUTC(value)})
            } else {
                parameters.push({name: '@' + key, value})
            }
        }

    })

    validFields.forEach(it => {

        const val = matchFields[it]
        const key = it.split('.').join('_')

        let columnName = it
        let valueName = key

        if (it[0] === '!') {
            columnName = it.substring(1)
            valueName = key.substring(1)
        }

        if (val instanceof Array) {

            if (timeUtil.isDateTimeFormat(val[0])) {

                if (it[0] === '!') {

                    andOperations.push('(NOT IS_DEFINED(c.' + columnName + ') OR (c.' + columnName + ' >= @from_' + valueName + ') AND c.' + columnName + ' <= @to_' + valueName + ')')
                } else {

                    andOperations.push('c.' + it + ' >= @from_' + valueName)
                    andOperations.push('c.' + it + ' <= @to_' + valueName)
                }

            } else {
                andOperations.push('ARRAY_CONTAINS(@' + valueName + ', c.' + it + ')')
            }
        } else if (val[0] === '!') {

            andOperations.push('c.' + it + ' != @' + valueName)
        } else {

            const tokens = it.split('.')

            if (tokens.length > 1) {

                const collectionName = tokens[0]
                const propertyName = tokens[1]

                andOperations.push('ARRAY_CONTAINS(c.' + collectionName + ', {"' + propertyName + '": @' + valueName + '}, true)')
            } else {
                andOperations.push('c.' + it + ' = @' + valueName)
            }
        }
    })

    if (orOperations.length || andOperations.length) {

        query += ' WHERE 1=1'
    }

    if (orOperations.length) {

        if (orOperations.length === 1) {
            query += ' AND ' + orOperations.join(' OR ')
        } else {
            query += ' AND (' + orOperations.join(' OR ') + ')'
        }
    }

    if (andOperations.length) {

        query += ' AND ' + andOperations.join(' AND ')
    }

    const orderByProperties = parseOrderProperties(orderBy)

    if (orderByProperties.length) {

        query += ' ORDER BY ' + orderByProperties
            .map(it => {

                if (it.collection) {

                    if (it.optional) {
                        /*
                        CASE
                            WHEN IS_DEFINED(c.projects) THEN ARRAY_LENGTH(c.projects)
                            ELSE 0
                        END
                         */
                        return 'CASE WHEN IS_DEFINED(c.' + it.property + ') THEN ARRAY_LENGTH(c.' + it.property + ') ELSE 0 END ' + it.direction
                    }

                    // ARRAY_LENGTH(c.projects)
                    return 'ARRAY_LENGTH(c.' + it.property + ') ' + it.direction
                }

                return 'c.' + it.property + ' ' + it.direction
            })
            .join(', ')
    }

    return {query, parameters}
}

export const parseOrderProperties = (orderBy: string | undefined | null) => {

    if (!orderBy || !orderBy.trim().length) {
        return []
    }

    return orderBy.split(',').map(parseOrderProperty)
}

export const parseOrderProperty = (orderBy: string | undefined | null) => {

    if (!orderBy || !orderBy.trim().length) {
        return {property: orderBy}
    }

    // [!projects]

    let property = orderBy

    const collection = property[0] === '[' && property[property.length - 1] === ']'
    if (collection) {
        property = property.substring(1, property.length - 1)
    }

    const direction = property[0] === '!' ? 'ASC' : 'DESC'

    if (property[0] === '!') {
        property = property.substring(1)
    }

    const optional = property[property.length - 1] === '?'

    if (optional) {
        property = property.substring(0, property.length - 1)
    }

    return {
        property,
        optional,
        collection,
        direction
    }
}

class BuildInstance {

    private template = 'SELECT{top}{distinct} {columns} FROM c{where} {orderBy}'
    private isDistinct = false
    private topValue = 0
    private listOfColumns: Array<string> = []
    private whereQuery = ''
    private sortDirection = ''
    private sortProperties: Array<string> = []

    public columns(...columns: any[]) {

        columns.forEach(it => this.listOfColumns.push(it))

        return this
    }

    public distinct(isDistinct?: true) {

        this.isDistinct = isDistinct === undefined ? true : isDistinct

        return this
    }

    public sort(...columns: any[]) {
        columns.forEach(it => this.sortProperties.push(it))

        if (columns.length === 0) {
            this.listOfColumns.forEach(it => this.sortProperties.push(it))
        }

        return this
    }

    public asc() {
        this.sortDirection = 'ASC'
        return this
    }

    public top(top: number) {
        this.topValue = top
        return this
    }

    public where(where: string) {
        this.whereQuery = where
        return this
    }

    public desc() {
        this.sortDirection = 'DESC'
        return this
    }


    public build() {

        return this.template
            .replace('{top}', this.topValue ? ' TOP ' + this.topValue : '')
            .replace('{distinct}', this.isDistinct ? ' DISTINCT' : '')
            .replace('{columns}', this.listOfColumns.length ? this.listOfColumns.map(it => 'c.' + it).join(', ') : '*')
            .replace('{where}', this.whereQuery ? ' WHERE ' + this.whereQuery : '')
            .replace('{orderBy}', this.sortProperties.length ? 'ORDER BY ' + this.sortProperties.map(it => ('c.' + it + ' ' + this.sortDirection).trim()).join(', ') : '')
    }
}

const instance = () => new BuildInstance()

export default {
    build, instance
}