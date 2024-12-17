const build = ({searchValue, searchFields, matchFields, orderBy}:{searchValue:string, searchFields:string[], matchFields:any, orderBy:string}) => {

    let query = 'SELECT * FROM c'
    const parameters = []

    if (searchValue && searchFields.length) {

        parameters.push({name: '@q', value: searchValue})

        query += ' WHERE ' + searchFields.map((it: string) => 'CONTAINS(LOWER(c.' + it + '), @q)').join(' OR ')
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

    if (validFields.length) {

        validFields.forEach((it:string) => {
            const val = matchFields[it]

            if ( val instanceof Array) {

                if(isISO8601(val[0])) {
                    parameters.push({name: '@from_' + it, value: val[0]})
                    parameters.push({name: '@to_' + it, value: val[1] || new Date().toISOString()})
                }else {
                    parameters.push({name: '@' + it, value: matchFields[it]})
                }
            } else {
                parameters.push({name: '@' + it, value: matchFields[it]})
            }

        })

        query += ((searchValue && searchFields.length) ? ' AND ' : ' WHERE ') + validFields.map(it => {

            const val = matchFields[it]


            if (val instanceof Array) {

                if (isISO8601(val[0])) {

                    return 'c.' + it + ' >= @from_' + it + ' AND c.' + it + ' <= @to_' + it
                }

                return 'ARRAY_CONTAINS(@' + it + ', c.' + it + ')'
            }
            return 'c.' + it + ' = @' + it
        }).join(' AND ')
    }

    if (orderBy) {

        let property = orderBy
        let direction = 'DESC'
        if (orderBy[0] === '!') {
            property = property.substring(1)
            direction = 'ASC'
        }

        query += ' ORDER BY ' + property.split(',').map((it: string) => it.trim()).map((it: string) => 'c.' + it + ' ' + direction).join(', ')
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