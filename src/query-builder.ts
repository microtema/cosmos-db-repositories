const build = ({searchValue, searchFields, matchFields, orderBy}: {
    searchValue: string,
    searchFields: string[],
    matchFields: any,
    orderBy: string
}) => {

    let query = 'SELECT * FROM c'
    const parameters = []

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

        if (val instanceof Array) {

            if (isISO8601(val[0])) {
                parameters.push({name: '@from_' + it, value: val[0]})
                parameters.push({name: '@to_' + it, value: val[1] || new Date().toISOString()})
            } else {
                parameters.push({name: '@' + it, value: val})
            }
        } else {

            let value = val

            if (value[0] === '!') {
                value = value.substring(1)
            }

            const tokens = it.split('.')

            if (tokens.length > 1) {
                parameters.push({name: '@' + tokens.join('_'), value})
            } else {
                parameters.push({name: '@' + it, value})
            }
        }

    })

    validFields.forEach(it => {

        const val = matchFields[it]

        if (val instanceof Array) {

            if (isISO8601(val[0])) {

                andOperations.push('c.' + it + ' >= @from_' + it)
                andOperations.push('c.' + it + ' <= @to_' + it)

            } else {
                andOperations.push('ARRAY_CONTAINS(@' + it + ', c.' + it + ')')
            }
        } else if (val[0] === '!') {

            andOperations.push('c.' + it + ' != @' + it)
        } else {

            const tokens = it.split('.')

            if (tokens.length > 1) {

                const collectionName = tokens[0]
                const propertyName = tokens[1]

                andOperations.push('ARRAY_CONTAINS(c.' + collectionName + ', {"' + propertyName + '": @' + tokens.join('_') + '}, true)')
            } else {
                andOperations.push('c.' + it + ' = @' + it)
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

    if (orderBy) {

        let property = orderBy
        let direction = 'DESC'
        if (orderBy[0] === '!') {
            property = property.substring(1)
            direction = 'ASC'
        }

        query += ' ORDER BY ' + property.split(',')
            .map(it => it.trim())
            .map(it => 'c.' + it + ' ' + direction)
            .join(', ')
    }

    return {query, parameters}
}


const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

function isISO8601(value: string) {
    return iso8601Regex.test(value);
}

class BuildInstance {

    template = 'SELECT {distinct} {columns} FROM c {orderBy}'
    isDistinct = false
    listOfColumns: Array<string> = []
    sortDirection = ''
    sortProperties: Array<string> = []

    columns(...columns: any[]) {

        columns.forEach(it => this.listOfColumns.push(it))

        return this
    }

    distinct(isDistinct?: true) {

        this.isDistinct = isDistinct === undefined ? true : isDistinct

        console.log('isDistinct', this.isDistinct)

        return this
    }

    sort(...columns: any[]) {
        columns.forEach(it => this.sortProperties.push(it))

        if (columns.length === 0) {
            this.listOfColumns.forEach(it => this.sortProperties.push(it))
        }

        return this
    }

    asc() {
        this.sortDirection = 'ASC'
        return this
    }

    desc() {
        this.sortDirection = 'DESC'
        return this
    }

    build() {

        return this.template
            .replace('{distinct}', this.isDistinct ? 'DISTINCT' : '')
            .replace('{columns}', this.listOfColumns.length ? this.listOfColumns.map(it => 'c.' + it).join(', ') : '*')
            .replace('{orderBy}', this.sortProperties.length ? 'ORDER BY ' + this.sortProperties.map(it => ('c.' + it + ' ' + this.sortDirection).trim()).join(', ') : '')
    }
}

const instance = () => new BuildInstance()

export default {
    build, instance
}