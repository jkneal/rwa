import {waitFor, getCy, convertToDate, createArrangement, approveArrangement} from '../support/utils'
import {
    LookupResultsField, checkSearchResults, checkLookupResultsFilter, checkLookupResultsSorts
} from '../support/lookupUtils'
import {isEmpty} from "lodash";
import {yesterdayStr} from "./date-utils";

const RESULT_ENTRIES = {
    '82291368': {
        rwaDocumentNumber: '82291368'
    },
    '82304674': {
        rwaDocumentNumber: '82304674'
    },
    '82291367': {
        rwaDocumentNumber: '82291367'
    },
    '82249967': {
        rwaDocumentNumber: '82249967'
    },
    '76243111': {
        rwaDocumentNumber: '76243111'
    }
}

describe('When visiting the Home page as neither admin or reviewer', () => {
    before(() => {
        cy.backdoor('mmmay')
    });

    it('should not see the Arrangements link', () => {
        cy.get('#arrangements-link').should('not.exist')
    })
})

describe('When visiting the Arrangements Lookup page as reviewer (but not admin)', () => {
    before(() => {
        cy.backdoor('kying')
    });

    it('should reach the page', () => {
        cy.get('#arrangements-link').click({force: true})
        cy.get('h1').should('contain', 'Arrangements Lookup')
    })
})

describe('When visiting the Arrangements Lookup page as admin', () => {
    before(() => {
        cy.backdoor('masargen')
    });

    it('should reach the page and have lookup fields rendered', () => {
        goToSearchArrangements()
        cy.get('h1').should('contain', 'Arrangements Lookup')
        cy.get('[data-cy="searchField"]').should('exist')
        cy.get('#chart').should('exist')
        cy.get('#org').should('exist')

        cy.get('[data-cy="searchField"]').select('responsibilitycenter')
        cy.get('#rc').should('exist')

        cy.get('[data-cy="searchField"]').select('employee')
        cy.get('#employeeId').should('exist')

        cy.get('[data-cy="searchField"]').select('supervisor')
        cy.get('#supervisorId').should('exist')
        cy.get('#currentSupervisorId').should('exist')

        cy.get('#search').should('exist')
        cy.get('#clear').should('exist')
    })

    it('initial search results should be filtered by active status by default', () => {
        goToSearchTest()
        cy.get(getCy('filter-results-count')).invoke('text').then(count => {
            for(let i=0;i<count;i++){
                cy.get(`[id="data-results[${i}].processedStatus"]`).invoke("text").then(text => {
                    expect(text.toLowerCase()).to.contain('active')
                })
            }
        })
    })

    it('should be able to enter chart and multi org criteria, perform a search and get results', () => {
        goToSearchArrangements()
        cy.get('#chart').type( 'UA',{force:true})
        cy.wait(Cypress.env('defaultWaitTime'))
        cy.get("#chart-input").get(".react-select__menu-list").find('.react-select__option:first').click()

        cy.get('#org').type( '(VPIT)',{force:true})
        cy.wait(Cypress.env('defaultWaitTime'))
        cy.get("#org-input").get(".react-select__menu-list").find('.react-select__option:first').click()
        cy.get('#org').type( '(ESOL)',{force:true})
        cy.wait(Cypress.env('defaultWaitTime'))
        cy.get("#org-input").get(".react-select__menu-list").find('.react-select__option:first').click()


        cy.get('#search').click()
        const results1 = [
            {...RESULT_ENTRIES['82291368']},
            {...RESULT_ENTRIES['82304674']},
        ]
        checkResults(results1)
    })

    it('should be able to clear results', () => {
        goToSearchArrangements()
        cy.get('#chart').type( 'UA',{force:true})
        cy.wait(Cypress.env('defaultWaitTime'))
        cy.get("#chart-input").get(".react-select__menu-list").find('.react-select__option:first').click()

        cy.get('#org').type( '(VPIT)',{force:true})
        cy.wait(Cypress.env('defaultWaitTime'))
        cy.get("#org-input").get(".react-select__menu-list").find('.react-select__option:first').click()

        cy.get('#search').click()
        const results1 = [
            {...RESULT_ENTRIES['82291368']}
        ]
        checkResults(results1)

        cy.get('#clear').click()
        cy.wait(Cypress.env('defaultWaitTime'))
        cy.get('#filter-results-count').contains('Displaying 0 Results')
    })

    checkSearch()
    checkSorts()
    checkFilters()
})

describe('Admin user should be able to inactivate arrangements', () => {
    before(() => {
        cy.task('clearTestDocumentNumbers')
    });
    it('Create test arrangement 1', () => {
        createArrangement('abretts', 'tneal')
    })
    it('Create test arrangement 2', () => {
        createArrangement('mmmay', 'ewestfal')
    })
    it('Approve test arrangements', () => {
        cy.task('getTestDocumentNumbers').then(testDocumentNumbers => {
            testDocumentNumbers.map(value => {
                const {documentNumber, supervisor} = value
                approveArrangement(documentNumber, supervisor)
            })
        })
    })

    it('Bulk Inactivation should be disabled initially', () => {
        cy.backdoor('masargen')
        goToSearchArrangements()
        cy.get(getCy('ArrangementsLookup-search')).should('not.be.disabled')
        cy.get(getCy('ArrangementsLookup-search')).click()
        waitFor(getCy('filter-results-count'), 10)
        cy.get(getCy('ArrangementsLookup-bulkInactivation')).should('be.disabled')
    })

    it('Should be able to select active arrangement', () => {
        cy.task('getTestDocumentNumbers').then(testDocumentNumbers => {
            testDocumentNumbers.map(value => {
                const {documentNumber} = value
                cy.get(`#arragement-${documentNumber}`).check({force: true})
            })
        })
    })

    it('Should be able to open inactivation dialog', () => {
        cy.get(getCy('ArrangementsLookup-bulkInactivation')).should('not.be.disabled')
        cy.get(getCy('ArrangementsLookup-bulkInactivation')).click()
        waitFor('#bulk-inactivation-Dialog-title')
        cy.get('#inactivationDate').should("be.empty")
        cy.get(getCy('BulkInactivation-submit')).should('be.disabled')
        cy.get(getCy('BulkInactivation-cancel')).should('not.be.disabled')
    })

    it('Should be able to inactivate entries', () => {
        cy.get('#inactivationDate').type(yesterdayStr).should('have.value', yesterdayStr)
        cy.get(getCy('BulkInactivation-submit')).should('not.be.disabled')
        cy.get(getCy('BulkInactivation-submit')).click()
    })

    it('Inactivation should be successful', () => {
        waitFor('#page-alert')
        cy.get('#page-alert').find('.rvt-alert__message').should('contain', 'All arrangements inactivated')
        waitFor(getCy('filter-results-count'), 10)
        cy.task('getTestDocumentNumbers').then(testDocumentNumbers => {
            testDocumentNumbers.map(value => {
                const {documentNumber} = value
                cy.get(`#arragement-${documentNumber}`).should('not.exist')
            })
        })
    })

    after(() => {
        cy.backdoor('rwaaft')
        cy.task('getTestDocumentNumbers').then(testDocumentNumbers => {
            testDocumentNumbers.map(value => {
                const {documentNumber} = value
                cy.deleteArrangement(documentNumber)
            })
        })
    });
})

function checkSearch() {
    let fields = [
        LookupResultsField.select('searchField', 'Chart/Org', null, false),
        LookupResultsField.searchableSelect('chart', 'UA', 'jobDepartmentChart', false)
    ]
    checkSearchResults('Chart', goToSearchArrangements, fields, getCy('ArrangementsLookup-search'))

    fields = [
        LookupResultsField.select('searchField', 'Chart/Org', null, false),
        LookupResultsField.searchableSelect('chart', 'UA', 'jobDepartmentChart', false),
        LookupResultsField.searchableSelect('org', 'ESOL', 'jobDepartmentOrg', false)
    ]
    checkSearchResults('Chart and Org', goToSearchArrangements, fields, getCy('ArrangementsLookup-search'))

    fields = [
        LookupResultsField.select('searchField', 'Responsibility Center', null, false),
        LookupResultsField.searchableSelect('rc', '94', 'responsibilityCenter', false)
    ]
    checkSearchResults('Responsibility Center', goToSearchArrangements, fields, getCy('ArrangementsLookup-search'))

    fields = [
        LookupResultsField.select('searchField', 'employee', null, false),
        LookupResultsField.searchableSelect('employeeId', 'Ekanayake', 'supervisor', false)
    ]
    checkSearchResults('Employee', goToSearchArrangements, fields, getCy('ArrangementsLookup-search'))

    fields = [
        LookupResultsField.select('searchField', 'supervisor', null, false),
        LookupResultsField.searchableSelect('supervisorId', 'Sargent, Matt', 'supervisor', false)
    ]
    checkSearchResults('Arrangement Supervisor', goToSearchArrangements, fields, getCy('ArrangementsLookup-search'))

    fields = [
        LookupResultsField.select('searchField', 'supervisor', null, false),
        LookupResultsField.searchableSelect('currentSupervisorId', 'Sargent, Matt', 'currentSupervisor', false)
    ]
    checkSearchResults('Current Superviso', goToSearchArrangements, fields, getCy('ArrangementsLookup-search'))
}

function checkSorts() {
    let filter = [
        LookupResultsField.select('processedStatus', '')
    ]

    checkLookupResultsSorts('Document Number', goToSearchTest, 'rwaDocumentNumber', filter)
    checkLookupResultsSorts('Employee Id', goToSearchTest, 'employeeId', filter)
    checkLookupResultsSorts('Name', goToSearchTest, 'name', filter, convertName)
    checkLookupResultsSorts('Job Rcd #', goToSearchTest, 'jobRecordNumber', filter)
    checkLookupResultsSorts('Arrangement Supervisor', goToSearchTest, 'supervisor', filter)
    checkLookupResultsSorts('Current Supervisor', goToSearchTest, 'currentSupervisor', filter)
    checkLookupResultsSorts('RC', goToSearchTest, 'responsibilityCenter', filter)
    checkLookupResultsSorts('Chart', goToSearchTest, 'jobDepartmentChart', filter)
    checkLookupResultsSorts('Org', goToSearchTest, 'jobDepartmentOrg', filter)
    checkLookupResultsSorts('Type', goToSearchTest, 'remoteWorkType', filter)
    checkLookupResultsSorts('Start Date', goToSearchTest, 'remoteWorkStartDate', filter, convertToDate)
    checkLookupResultsSorts('End Date', goToSearchTest, 'remoteWorkEndDate', filter, convertToDate)
    checkLookupResultsSorts('Status', goToSearchTest, 'processedStatus', filter)
}

function checkFilters() {
    let filter = [
        LookupResultsField.select('processedStatus', ''),
        LookupResultsField.type('employeeId', '0002')
    ]
    checkLookupResultsFilter("Employee Id", goToSearchTest, filter)

    filter = [
        LookupResultsField.select('processedStatus', ''),
        LookupResultsField.type('name', 'Neal')
    ]
    checkLookupResultsFilter("Name", goToSearchTest, filter)

    filter = [
        LookupResultsField.select('processedStatus', ''),
        LookupResultsField.type('supervisor', 'Sargent')
    ]
    checkLookupResultsFilter("Arrangement Supervisor ", goToSearchTest, filter)

    filter = [
        LookupResultsField.select('processedStatus', ''),
        LookupResultsField.type('currentSupervisor', 'Sargent')
    ]
    checkLookupResultsFilter("Current Supervisor", goToSearchTest, filter)

    filter = [
        LookupResultsField.select('processedStatus', ''),
        LookupResultsField.select('jobDepartmentChart', 'UA')
    ]
    checkLookupResultsFilter("Chart", goToSearchTest, filter)

    filter = [
        LookupResultsField.select('processedStatus', ''),
        LookupResultsField.select('jobDepartmentOrg', 'VPIT')
    ]
    checkLookupResultsFilter("Org", goToSearchTest, filter)


    filter = [
        LookupResultsField.select('processedStatus', 'Pending')
    ]
    checkLookupResultsFilter("Status", goToSearchTest, filter)
}

function goToSearchArrangements () {
    cy.visit('/admin/arrangements')
    waitFor(getCy('ArrangementsLookup-header'))
    cy.url().should('include', '/admin/arrangements')
    cy.get(getCy('ArrangementsLookup-header')).should('contain', 'Arrangements Lookup')
}

function goToSearchTest () {
    goToSearchArrangements()
    cy.get(getCy('ArrangementsLookup-search')).should('not.be.disabled')
    cy.get(getCy('ArrangementsLookup-search')).click()
    waitFor(getCy('filter-results-count'), 10)
}

function convertName(values) {
    if(isEmpty(values)) {
        return values
    }
    const converted = values.map(value => value == '' ? null : value)
    return converted
}

function checkResults (results) {
    waitFor(getCy('filter-results-count'), 10)
    cy.get('#filter-results-count').contains('Displaying ' + results.length + ' Results')
    results.forEach((result, i) => {
        const keys = Object.keys(result)
        keys.forEach(key => {
            cy.get('#data-results\\[' + i + '\\]\\.' + key).contains(result[key])
        })

    })
}
