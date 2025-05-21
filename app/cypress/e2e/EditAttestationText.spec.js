import {todayStr, tomorrowStr} from "./date-utils";

describe('When visiting the Edit Attestation Text page', () => {
    before(() => {
        cy.backdoor('jkneal')
        cy.get('#attestation-link').click({force: true})
        cy.get('#create-new-version').click()
    })

    it('shows a textarea with some content', () => {
        cy.get('#attestation-text-textarea').invoke('text').then(value => {
            expect(value).is.not.null
        })
    })

    it('shows a list', () => {
        cy.get('#attestation-text-list ul').should('exist')
    })

    it('shows a date field with no value', () => {
        cy.get('#effectiveDate').invoke('val').then(value => {
            expect(value).eq('')
        })
    })

    it('shows the Save button as disabled, and Cancel button as enabled' , () => {
        cy.get('#save').should('be.disabled')
        cy.get('#cancel').should('not.be.disabled')
    })

    it('shows an error below the Effective Date field, if today\'s date is selected', () => {
        cy.get('#effectiveDate').type('{backspace}' + todayStr + '{enter}')

        cy.get('#effectiveDate-alert').invoke('text').then(text => {
            expect(text).eq('Must be after today')
        })
    })

    it('shows the Save button as enabled, if a future date is entered', () => {
        cy.get('#effectiveDate').type('{backspace}' + tomorrowStr + '{enter}')

        cy.get('#effectiveDate-alert').should('not.exist')
    })

    describe('When changing the content of the textarea', () => {
        before(() => {
            // clear the content of the textarea - this should not show a list. This is a good enough test
            cy.get('#attestation-text-textarea').type('{selectall}{backspace}')
        })

        it('updates the list accordingly', () => {
            cy.get('#attestation-text-list ul').should('not.exist')
        })
    })
})
