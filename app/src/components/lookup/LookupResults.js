import React, {Component} from 'react'
import _ from 'lodash'
import {Button, Col, InlineAlert, Input, Pagination, PaginationItem, Row, Select, Table} from 'rivet-react'
import {formatCurrency, formatDate, formatDateTime, formatTime} from './util'
import {Tooltip} from 'react-tooltip'

import 'react-tooltip/dist/react-tooltip.css'

const getConverter = (summaryField) => {
    if (summaryField.converter) {
        return summaryField.converter
    }

    const defaultConverter = (v) => v
    const typeConverters = {
        boolean: (v) => v ? 'Yes' : 'No',
        currency: (v) => formatCurrency(v),
        date: formatDate,
        datetime: formatDateTime,
        time: formatTime,
    }
    return typeConverters[summaryField.type] || defaultConverter
}

const getFilterDisplayConverter = (summaryField) => {
    if (summaryField.filterDisplayConverter) {
        return summaryField.filterDisplayConverter
    }

    return (value) => value
}

const getShow = (summaryField) => {
    const { show = true } = summaryField

    if (_.isFunction(show)) {
        return show
    }

    return () => show
}

class LookupResults extends Component {
    constructor(props) {
        super(props);
        const { defaultShowFilters, defaultUsePaging = true } = props;
        this.state = {
            showExportBottom: defaultUsePaging,
            showExportTop: !defaultUsePaging,
            showFilters: defaultShowFilters !== undefined ? defaultShowFilters : true,
            filters: {},
            sort: {},
            paging: defaultUsePaging,
            page: 1,
            pageSize: 20
        }
    }

    componentDidMount() {
        const {defaultSortDirection, defaultSortField, resultFields} = this.props
        if (defaultSortField) {
            this.setSort(defaultSortField, defaultSortDirection)
        }

        let filters
        _.forEach(resultFields, rf => {
            if (rf.defaultFilterValue) {
                filters = filters || {};
                filters[rf.field] = rf.defaultFilterValue
            }
        })

        if (filters) {
            this.setState({filters})
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (!state.resources || (props.resources.length !== state.resources.length)) {
            const initialFilters = !props.initialFilters ? state.filters : props.initialFilters
            const filteredResources = applyFiltersAux(initialFilters, props.resources, props.resultFields)
            return {
                resources: props.resources,
                filteredResources,
                filters: {...initialFilters}
            }
        }
        return null
    }

    toggleFilters() {
        this.setState({showFilters: !this.state.showFilters})
    }

    setSort(field, direction) {

        const sort = {
            field,
            direction: direction ? direction : (this.state.sort.field === field && this.state.sort.direction === 'asc')
                ? 'desc' : 'asc'
        }

        this.setState({
            sort,
            page: 1,
            pageSize: 20
        })
    }

    applySort(sort, resources) {
        if (!sort.field) {
            return resources
        }

        let filteredResources
        let resultFields = this.props.resultFields
        const sortField = _.find(resultFields, {field: sort.field})
        if (!sortField) {
            return resources
        }
        if (sortField.translateDateFormat) {
            const translatedFieldName = sort.field + 'Translated'
            filteredResources = _.map(resources, resource => {
                const fieldValue = resource[sort.field]
                const dateParts = (fieldValue || '').split('/')
                let translatedFormat = dateParts[2] + '-' + dateParts[0] + '-' + dateParts[1]
                return {...resource, [translatedFieldName]: translatedFormat}
            })
            filteredResources = _.orderBy(filteredResources, [translatedFieldName], [sort.direction])
        } else if (sortField.sortField) {
            filteredResources = _.orderBy(resources, [sortField.sortField], [sort.direction])
        } else {
            filteredResources = _.orderBy(resources, [sort.field], [sort.direction])
        }

        return filteredResources
    }

    applyFilters(filters, resources) {
        let filteredResources = applyFiltersAux(filters, resources, this.props.resultFields)

        if (this.props.onReturn) {
            const activeField = _.find(this.props.resultFields, {field: 'active'})
            if (activeField) {
                filteredResources = _.filter(newState.filteredResources, resource => resource.active)
            }
        }

        return filteredResources
    }

    buildHeaderRow(resultFields, onReturn, actionLinkGenerator) {
        return <tr>
            {onReturn && <th className="returnColumn"></th>}
            {!onReturn && actionLinkGenerator && <th>Actions</th>}
            {resultFields.map((summaryField) => {
                    return <th key={`resource-entry-header-${summaryField.field}`} width={summaryField.width}
                                onClick={() => this.setSort(summaryField.field)}>
                            <div className="resultHeader">
                                <div className="fieldTitle">{summaryField.fieldTitle}</div>
                                <div data-cy={`resultHeader-${summaryField.field}-sort`}>
                                    {this.state.sort.field !== summaryField.field &&
                                        <i className="sortIcon" data-tip="Sort Ascending">
                                            <rvt-icon class="rvt-p-all-xxs" name="arrow-down"/>
                                        </i>}
                                    {this.state.sort.field === summaryField.field && this.state.sort.direction === 'asc' &&
                                        <i className="sortIcon current" data-tip="Sort Descending">
                                            <rvt-icon class="rvt-p-all-xxs" name="arrow-down"/>
                                        </i>}
                                    {this.state.sort.field === summaryField.field && this.state.sort.direction === 'desc' &&
                                        <i className="sortIcon current" data-tip="Sort Ascending">
                                            <rvt-icon class="rvt-p-all-xxs" name="arrow-up"/>
                                        </i>}
                                </div>
                            </div>
                        </th>
                }
            )}
        </tr>
    }

    setFilterValue(field, e) {
        let newState = this.state
        newState.filters[field] = e.target.value
        newState.page = 1
        newState.pageSize = 20

        this.setState(newState)
    }

    getFilterControl(summaryField, resources) {
        if (summaryField.noFilter) {
            return null;
        }

        if (summaryField.getFilterValues) {
            const filterOptions = summaryField.getFilterValues(resources)
            return <Select id={`filter-${summaryField.field}`} className="filterControl" type="text" value={this.state.filters[summaryField.field]}
                           onChange={(e) => this.setFilterValue(summaryField.field, e)} label={`Filter ${summaryField.fieldTitle}`}>
                <option value=""></option>
                {filterOptions.map((option, i) => <option key={option} value={option}>{option}</option>)}
            </Select>
        }

        if (summaryField.filterByValues) {
            const filterOptions = (_.reject(_.uniq(_.map(resources, r => _.get(r, summaryField.field))), v => v === '' || v === undefined || v == null) || []).sort()
            return <Select id={`filter-${summaryField.field}`} className="filterControl" type="text" value={this.state.filters[summaryField.field]}
                           onChange={(e) => this.setFilterValue(summaryField.field, e)} label={`Filter ${summaryField.fieldTitle}`}>
                <option value=""></option>
                {filterOptions.map((option, i) => <option key={option} value={option}>{getFilterDisplayConverter(summaryField)(option, resources)}</option>)}
            </Select>
        }

        if (summaryField.type === 'boolean') {
            return <Select id={`filter-${summaryField.field}`} className="filterControl" type="text" value={this.state.filters[summaryField.field]}
                           onChange={(e) => this.setFilterValue(summaryField.field, e)} label={`Filter ${summaryField.fieldTitle}`}>
                <option value=""></option>
                <option value="true">Yes</option>
                <option value="false">No</option>
            </Select>
        }

        return <Input id={`filter-${summaryField.field}`} className="filterControl" placeholder="Filter" value={this.state.filters[summaryField.field]}
                      onChange={(e) => this.setFilterValue(summaryField.field, e)} label={`Filter ${summaryField.fieldTitle}`}/>
    }

    buildFilterRow(resultFields, onReturn, actionLinkGenerator, resources) {
        return <tr id="filter-row">
            {(onReturn || actionLinkGenerator) && <td></td>}
            {resultFields.map( (summaryField) =>
                <td key={`resource-entry-filter-${summaryField.field}`}>
                    {this.getFilterControl(summaryField, resources)}
                </td>
            )}
        </tr>
    }

    buildDataRow(resultFields, onReturn, actionLinkGenerator, navigateToPage, dispatch, resource, index, previousResource, rowStyler) {
        const rowStyle = rowStyler ? rowStyler(resource, index, previousResource) : ''

        return <tr id={`data-results[${index}]`} key={`resource-entry-${index}`} onClick={() => onReturn && onReturn(resource)}
                   className={`${onReturn ? 'resultsHover': ''} ${rowStyle}`}>
            {onReturn && <td className="returnColumn">{resource.active && <i className="fas fa-arrow-circle-left" data-tip="Return Value"></i>}</td>}
            {!onReturn && actionLinkGenerator && <td>{actionLinkGenerator(resource, navigateToPage, dispatch, previousResource)}</td>}
            {resultFields.map( (summaryField) =>
                <td id={`data-results[${index}].${summaryField.field}`} key={`resource-entry-${index}-${summaryField.field}`}
                    className={`${summaryField.noWrap ? 'noWrap' : ''} ${summaryField.type === 'currency' ? 'rvt-text-right' : ''} ${summaryField.className ? summaryField.className : ''}`}>
                    {getConverter(summaryField)(_.get(resource, summaryField.field), resource, false, previousResource)}
                </td>
            )}
        </tr>
    }

    buildCountMessage(resources) {
        const resourceCount = resources.length
        const { paging, page, pageSize} = this.state
        const totalPages = Math.ceil(resourceCount / pageSize)

        const startPageIndex = (page - 1) * pageSize +  1
        const endPageIndex = (page) * pageSize

        const pageMessage = paging && totalPages > 1 ? `${startPageIndex}-${endPageIndex} of ` : ''

        let message = <>Displaying {pageMessage} <span data-cy="filter-results-count">{resourceCount}</span> Results</>
        return <>{message}{this.buildFiltersMessage()}</>
    }

    buildFiltersMessage() {
        const filterBy = this.props.filterBy
        // hasValues is false if filterBy is missing values in all of its fields, else true
        let hasValues = _.every(_.values(filterBy), (val) => { return val })
        if (filterBy && hasValues) {
            let ret = ', filtered by '
            let i = 0
            for (const filter in filterBy) {
                if (filterBy[filter]) {
                    ret += `${filter} ` + filterBy[filter]
                    if (i < _.size(filterBy) - 1) {
                        ret += ' , '
                    }
                    i++
                }}
            return ret
        }
        return ""
    }

    renderPager(resources) {
        const {showExportBottom, page, paging, pageSize} = this.state
        const totalPages = Math.ceil(resources.length / pageSize)

        const setPage = (e, page) => {
            e.preventDefault()
            if (page < 1 || page > totalPages) {
                return
            }
            let newState = this.state
            newState.page = page
            this.setState(newState)
        }

        const renderPageLink = (toPage, label, content) => {
            content = content || label || toPage
            return (
                <PaginationItem
                    ariaLabel={`Page ${label}`}
                    component="button"
                    current={toPage === page}
                    disabled={toPage < 1 || toPage > totalPages}
                    onClick={(e) => setPage(e, toPage)}
                >
                    {content}
                </PaginationItem>
            )
        }

        return (
            <Row>
                {
                    showExportBottom &&
                    <Col>
                        <div className='rvt-p-all-sm'>
                            <Button
                                size="small"
                                variant={'plain'}
                                onClick={() => this.exportToCSV(resources)}
                            >Export to CSV
                            </Button>
                        </div>
                    </Col>
                }
                {
                    paging &&
                    <Col className="rvt-m-top-sm">
                        <Pagination className="rvt-flex rvt-justify-end">
                            {renderPageLink(page - 1, "Previous", <rvt-icon className='rvt-m-left-xxs' name='chevron-left'/>)}
                            {page === totalPages && page - 1 > 1 ? renderPageLink(page - 2) : null}
                            {page !== 1 ? renderPageLink(page - 1) : null}
                            {renderPageLink(page)}
                            {page !== totalPages ? renderPageLink(page + 1) : null}
                            {page === 1 && page + 1 < totalPages ? renderPageLink(page + 2) : null}
                            {renderPageLink(page + 1, "Next", <rvt-icon className='rvt-m-left-xxs' name='chevron-right'/>)}
                        </Pagination>
                    </Col>
                }
            </Row>
        )
    }

    renderResultsHeader(filteredResources) {
        const { showExportTop } = this.state
        return (
            <Row>
                <Col>
                    <div className="resultsHeader">
                        <div id="filter-results-count" className="countMessage">{this.buildCountMessage(filteredResources)}</div>
                        {this.props.children}
                    </div>
                </Col>
                {
                    showExportTop &&
                    <Col>
                        <div className='rvt-text-right rvt-m-bottom-sm'>
                            <Button
                                size="small"
                                variant={'plain'}
                                onClick={() => this.exportToCSV(filteredResources)}
                            >Export to CSV
                            </Button>
                        </div>
                    </Col>
                }
            </Row>
        )
    }

    exportToCSV(filteredResources) {
        let rows = [], headerRow = []
        let resultFields = this.props.resultFields
        _.forEach(resultFields, field => {
            if (getShow(field)(field.field, true)) {
                headerRow.push(field.fieldTitle)
            }
        })
        rows.push(headerRow)

        _.forEach(filteredResources, resource => {
            let dataRow = []
            _.forEach(resultFields, field => {
                if (getShow(field)(field.field, true)) {
                    dataRow.push('"' + getConverter(field)(_.get(resource, field.field), resource, true) + '"')
                }
            })
            rows.push(dataRow)
        })
        let csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(",")).join("\n");
        let encodedUri = encodeURI(csvContent);
        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "export.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
    }

    render()  {
        const { resources, onReturn, onReturnResults, actionLinkGenerator, navigateToPage, dispatch, resultLimit, rowStyler, className} = this.props
        let resultFields = this.props.resultFields

        if (onReturn) {
            const activeField = _.find(resultFields, {field: 'active'})
            if (activeField) {
                resultFields = _.reject(resultFields, {field: 'active'})
            }
        }

        let filteredResources = this.applyFilters(this.state.filters, resources)
        filteredResources = this.applySort(this.state.sort, filteredResources)

        const {paging, page, pageSize} = this.state
        const pagedResources = paging
            ? filteredResources.slice((page - 1) * pageSize, page * pageSize)
            : filteredResources

        const showResultLimitWarning = resultLimit && resources && resultLimit === resources.length

        return <div className={className}>
            <Tooltip place="top" type="dark" effect="solid"/>
            {showResultLimitWarning && <div className="rvt-m-bottom-md">
                <InlineAlert variant={'warning'}>Result limit of {resultLimit} reached. More results potentially exist.</InlineAlert>
            </div>}

            {(onReturnResults && filteredResources.length !== 0) &&
                <div className="rvt-m-bottom-md">
                    <button className="rvt-button rvt-button--plain" onClick={() => onReturnResults(filteredResources)}>
                        <i className="rvt-m-right-xs fas fa-arrow-left"></i> Return Results</button>
                </div>}

            {this.renderResultsHeader(filteredResources)}
            <Table compact className="resultsTable" variant="stripes">
                <thead>
                {this.buildHeaderRow(resultFields, onReturn, actionLinkGenerator)}
                </thead>
                <tbody id="search-results">
                {this.state.showFilters && this.buildFilterRow(resultFields, onReturn, actionLinkGenerator, resources)}
                {pagedResources.map((resource, index) => this.buildDataRow(resultFields, onReturn, actionLinkGenerator,
                    navigateToPage, dispatch, resource, index, index > 0 ? pagedResources[index -1] : null,
                    rowStyler))}
                </tbody>
            </Table>
            {this.renderPager(filteredResources)}
        </div>
    }
}

function applyFiltersAux (filters, resources, resultFields) {
    let filteredResources = (resources || []).filter(resource => {
        let matchesFilters = true
        _.forIn(filters, (value, field) => {
            if (!value) {
                return;
            }

            const fieldValue = _.get(resource, field)
            const summaryField = _.find(resultFields, {field})
            if (summaryField.type === 'boolean') {
                matchesFilters = matchesFilters &&
                    ((value === 'true' && fieldValue) || (value === 'false' && !fieldValue))
            } else if (summaryField.type === 'number') {
                const firstCharacter = value.slice(0, 1)
                const secondCharacter = value.slice(1, 2)
                if (firstCharacter === '>') {
                    if (secondCharacter === '=') {
                        value = value.slice(2)
                        matchesFilters = matchesFilters && fieldValue >= value
                    } else {
                        value = value.slice(1)
                        matchesFilters = matchesFilters && fieldValue > value
                    }
                } else if (firstCharacter === '<') {
                    if (secondCharacter === '=') {
                        value = value.slice(2)
                        matchesFilters = matchesFilters && fieldValue <= value
                    } else {
                        value = value.slice(1)
                        matchesFilters = matchesFilters && fieldValue < value
                    }
                } else {
                    matchesFilters = matchesFilters && fieldValue === value
                }
            }
            else {
                let resourceValueAsString;
                if (fieldValue) {
                    if (['date', 'datetime', 'time'].includes(summaryField.type)) {
                        // For date/time's use the converter to format as a date/time string first.
                        // NOTE: this won't work if the caller passed a custom converter that returns a react component
                        resourceValueAsString = getConverter(summaryField)(fieldValue).toString()
                    } else {
                        resourceValueAsString = fieldValue.toString()
                    }
                }
                matchesFilters = matchesFilters && fieldValue && resourceValueAsString.toLowerCase().includes(value && value.toLowerCase())
            }
        })
        return matchesFilters
    })

    return filteredResources
}

export default LookupResults
