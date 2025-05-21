import { isEmpty, map, reverse, sortBy } from "lodash";
import { getCy, waitFor } from "./utils";


export function checkLookupResultsFilter (filterBy, goToPage, lookupFilters, comparator = null) {
    describe(`Should be able to filter by ${filterBy}`, () => {
        before(() => {
            cy.login('masargen');
        });

        it('View page', () => {
            goToPage()
        })

        it('Apply filters', () => {
            applyFilters(lookupFilters)
        })
        it('Verify only records containing filter show', () => {
            cy.get(getCy('filter-results-count')).invoke('text').then(count => {
                for(let i=0;i<count;i++){
                    lookupFilters.forEach(lookupFilter => {
                        const { check, field, value } = lookupFilter
                        if(check && !isEmpty(value)) {
                            cy.get(`[id="data-results[${i}].${field}"]`).invoke("text").then(text => {
                                if(comparator == null) {
                                    expect(text.toLowerCase()).to.contain(value.toLowerCase())
                                } else {
                                    comparator(value, text)
                                }
                            })
                        }
                    })
                }
            })
        })
    })
}

export function checkSearchResults(title, goToPage, fields, submitSelector, comparator) {
    describe(`Should be able to search by ${title}`, () => {
        before(() => {
            cy.login('masargen');
        });

        it('View page', () => {
            goToPage()
        })

        it('Search by field', () => {
            applySearchFilters(fields)
            cy.get(submitSelector).should('not.be.disabled')
            cy.get(submitSelector).click()
            waitFor(getCy('filter-results-count'), 10)
        })

        it('Verify only records containing search show', () => {
            cy.get(getCy('filter-results-count')).invoke('text').then(count => {
                for(let i=0;i<count;i++){
                    fields.forEach(searchField => {
                        const { check, field, resultField, value } = searchField
                        if(check && !isEmpty(value)) {
                            const checkField = isEmpty(resultField) ? field : resultField
                            cy.get(`[id="data-results[${i}].${checkField}"]`).invoke("text").then(text => {
                                if(comparator == null) {
                                    expect(text.toLowerCase()).to.contain(value.toLowerCase())
                                } else {
                                    comparator(value, text)
                                }
                            })
                        }
                    })
                }
            })
        })
    })
}

export function checkLookupResultsSorts (sortBy, goToPage, field, filters = [],  converter = null, initialSort = false) {
    checkLookupResultsSort(sortBy, goToPage, field, 'DESC', filters, converter, initialSort)
    checkLookupResultsSort(sortBy, goToPage, field, 'ASC', filters, converter, initialSort)
}

export function checkLookupResultsSort (sortBy, goToPage, field, order = 'DESC', filters = [], converter = null, initialSort) {
    describe(`Should be able to view results sorted by ${sortBy} (${order})`, () => {
        before(() => {
            cy.login('masargen');
        });

        it('View page', () => {
            goToPage()
        })

        it('Change sort order ', () =>{
            applyFilters(filters)
            if(!initialSort){
                cy.get(getCy(`resultHeader-${field}-sort`)).click({force:true})
            }

            if(order == 'ASC') {
                cy.get(getCy(`resultHeader-${field}-sort`)).click({force:true})
            }

        })
        it('Verify results are in sorted order', () => {
            cy.wait(Cypress.env('defaultWaitTime'))
            checkSort(field, order, converter)
        })
    })
}


export function checkSort(field, order = 'DESC', converter = null) {
    cy.get(getCy(`resultHeader-${field}-sort`)).find('.current').invoke('attr', 'data-tip')
        .should('eq', `Sort ${order === 'DESC' ? 'Descending' : 'Ascending'}`)
    cy.get(`[id^="data-results["][id$="].${field}"]`).then(values => {
        const text =  map(values, 'textContent')
        return converter == null ?  text : converter(text)
    }).then(values => {
        const sorted = order === 'DESC' ? sortBy(values) : reverse(sortBy(values))
        console.log('values')
        console.log(values)
        console.log('sorted')
        console.log(sorted)
        expect(values).to.deep.equal(sorted)
    })
}

function createLookupFieldSelect (field, value, resultField, check = true) {
    return createLookupField(field, 'select', value, resultField, check)
}

function createLookupFieldType (field, value, resultField, check = true) {
    return createLookupField(field, 'type', value, resultField, check)
}

function createLookupFieldDate (field, value, resultField, check = true) {
    return createLookupField(field, 'date', value, resultField, check)
}

function createLookupFieldCheck (field, value, resultField, check = true) {
    return createLookupField(field, 'check', value, resultField, check)
}

function createLookupFieldSearchSelect (field, value, resultField, check = true) {
    return createLookupField(field, 'searchableSelect', value, resultField, check)
}

function createLookupField (field, type, value, resultField, check = true) {
    return {
        check,
        field,
        resultField,
        type,
        value
    }
}

export const LookupResultsField = {
    check: createLookupFieldCheck,
    custom: createLookupField,
    date: createLookupFieldDate,
    searchableSelect: createLookupFieldSearchSelect,
    select: createLookupFieldSelect,
    type: createLookupFieldType
}

function applySearchFilters (lookupFilters) {
    if(isEmpty(lookupFilters)) {
        return
    }
    lookupFilters.forEach(lookupFilter => {
        applySearchFilter(lookupFilter)
    })
}

function applySearchFilter(lookupFilter) {
    const { field, type, value } = lookupFilter
    switch(type) {
        case 'check':
            const cyValue = getCy(field)
            value ? cy.get(cyValue).check({force: true}) :  cy.get(cyValue).uncheck({force: true})
            break;
        case 'date':
            cy.get(`[id="${field}"]`).type(value)
            break;
        case 'searchableSelect':
            cy.get(`[id="${field}"]`).type(value, {force:true})
            cy.wait(Cypress.env('defaultWaitTime'))
            cy.get(`[id="${field}-input"]`).get(".react-select__menu-list").find('.react-select__option:first').click()
            break;
        case 'select':
            cy.get(getCy(field)).select(value)
            break;
        default:
            cy.get(getCy(field)).type(value)
    }
}

function applyFilters (lookupFilters) {
    if(isEmpty(lookupFilters)) {
        return
    }
    lookupFilters.forEach(lookupFilter => {
        applyFilter(lookupFilter)
    })
}

function applyFilter(lookupFilter) {
    const { field, type, value } = lookupFilter
    const cyValue = `[id="filter-${field}"]`
    switch(type) {
        case 'select':
            cy.get(cyValue).select(value)
            break;
        default:
            cy.get(cyValue).type(value)
    }
}