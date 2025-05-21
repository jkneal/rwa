import { isEmpty } from "lodash";
import {yesterdayStr} from "../e2e/date-utils";

const defaultDelay = Cypress.env('defaultWaitTime') / 4
const defaultDelayAttempts = 6

export function ifExists (selector, success, failure = null) {
    cy.get('body').then(parent => {
        if(parent.find(selector).length) {
            success()
        } else {
            if(failure != null) {
                failure()
            }
        }
    })
}
export function ifNotExists (selector, success, failure = null) {
    cy.get('body').then(parent => {
        if(!parent.find(selector).length) {
            success()
        } else {
            if(failure != null) {
                failure()
            }
        }
    })
}

export function waitFor (selector, count = defaultDelayAttempts, delay = defaultDelay) {
    if(count === 0) {
        return
    }
    cy.wait(delay)
    ifExists(selector,
        () => waitFor(selector, 0, delay),
        () => waitFor(selector, count - 1, delay)
    )
}

export function waitForRemoved (selector, count = defaultDelayAttempts, delay = defaultDelay) {
    if(count === 0) {
        return
    }
    cy.wait(delay)
    ifNotExists(selector,
      () => waitFor(selector, 0, delay),
      () => waitFor(selector, count - 1, delay)
    )
}

export function getCy (id) {
    return `[data-cy="${id}"]`
}

export function convertToDate (values) {
    if(isEmpty(values)) {
        return values
    }
    const converted = values.map(value => Date.parse(value))
    return converted
}

export function createArrangement(userId, supervisor, fields = {}) {
    cy.backdoor(userId)
    const {remoteWorkEndDate, remoteWorkStartDate, workAddressHome = null} = fields

    cy.get('#job-arrangement-0 button').then(btns => {
        expect(btns.length).eq(1)
        expect(btns[0].textContent).eq('Start your request')
        btns[0].click()

        cy.wait(Cypress.env('defaultWaitTime') * 4)
        cy.url().should('include', '/arrangement/new')
    })
    cy.field('distanceIuCampus').check('YES', {force: true})
    typeArrangementField('remoteWorkStartDate', remoteWorkStartDate, yesterdayStr)
    typeArrangementField('remoteWorkEndDate', remoteWorkEndDate, '')

    const isWorkAddressHome = workAddressHome == null ? true : workAddressHome
    console.log(workAddressHome)
    console.log(isWorkAddressHome)
    cy.field('workAddressHome').check(isWorkAddressHome ? 'YES' : 'NO', {force: true})
    if(!isWorkAddressHome) {
        const {workAddressLine1, workAddressLine2, workAddressCity, workAddressZip} = fields
        typeArrangementField('workAddressLine1', workAddressLine1, '')
        typeArrangementField('workAddressLine2', workAddressLine2, '')
        typeArrangementField('workAddressCity', workAddressCity, '')
        typeArrangementField('workAddressZip', workAddressZip, '')
    }


    cy.field('remoteWorkType').check('FULLY_REMOTE', {force: true})
    cy.field('arrangementWorkDays.coreHoursStartTime').type('8:30 AM')
    cy.field('arrangementWorkDays.coreHoursEndTime').type('5:00 PM')
    cy.field('reason').focus().type('For automated functional test', {force: true})
    cy.field('attestationAcknowledged').check({force: true})
    cy.get('#submit').click()
    cy.wait(Cypress.env('defaultWaitTime') * 7)
    cy.url().should('include', '/arrangement/review')
    cy.get('#status-alert').should('contain', 'ENROUTE')
    cy.url().then(url => {
        const documentNumber = url.substring(url.lastIndexOf('/') + 1)
        cy.task('addTestDocumentNumbers', {documentNumber, supervisor})
    })
}

function typeArrangementField(field, value, defaultValue) {
    const text = isEmpty(value) ? defaultValue : value
    if(isEmpty(text)) {
        cy.field(field).clear()
        return
    }
    cy.field(field).clear().type(text)
}

export function approveArrangement(documentNumber, supervisor) {
    cy.backdoor(supervisor)
    cy.wait(Cypress.env('defaultWaitTime') * 2)
    cy.visit('/arrangement/review/' + documentNumber)
    cy.wait(Cypress.env('defaultWaitTime') * 6)
    cy.get('input[id="hrReviewer"]').clear({force: true}).type('ldingram', {force: true})
    cy.wait(Cypress.env('defaultWaitTime'))
    cy.get('#hrReviewer-input .react-select__menu .react-select__option').should('exist')
        .should('have.text', 'Fox, Lora Dawn (ldingram)').click()
    cy.get('#approve').click()
    cy.wait(Cypress.env('defaultWaitTime') * 4)
    cy.backdoor('ldingram')
    cy.wait(Cypress.env('defaultWaitTime') * 2)
    cy.visit('/arrangement/review/' + documentNumber)
    cy.wait(Cypress.env('defaultWaitTime') * 4)
    cy.get('#approve').click()
    cy.wait(Cypress.env('defaultWaitTime') * 4)
}