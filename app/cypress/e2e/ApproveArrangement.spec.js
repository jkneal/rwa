import {todayStr, tomorrowStr} from "./date-utils";
import {createArrangement} from "../support/utils";

describe('When approving an arrangement as supervisor', () => {
    before(() => {
        cy.backdoor('aaneal')
        cy.task('clearTestDocumentNumbers')
        cy.fixture('doc1').then((d) => {
            const fields ={
                ...d,
                remoteWorkStartDate: todayStr,
                remoteWorkEndDate: tomorrowStr
            }
            createArrangement('aaneal', 'rob', fields)
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

    describe('When approving an arrangement as supervisor', () => {
        before(() => {
            cy.backdoor('rob')
            goToReview()
        })

        it('should display actions taken table with one row', () => {
            cy.get('#actions-taken').getTable().should(tableData => {
                expect(tableData.length).to.equal(1)
                expect(tableData[0].User).to.equal('aaneal')
                expect(tableData[0].Action).to.equal('route')
                expect(tableData[0].Date).to.not.be.empty
            })
        })

        it('should require input of HR reviewer for approval', () => {
            cy.get('input[id="hrReviewer"]').type('ldingram', {force: true}).clear()
            cy.get('#approve').click()
            cy.get('#hrReviewer-input div:first').should('have.class', 'rvt-validation-danger')
        })

        it('should allow input of HR reviewer', () => {
            cy.get('input[id="hrReviewer"]').clear({force: true}).type('ldingram', {force: true})
            cy.wait(Cypress.env('defaultWaitTime'))
            cy.get('#hrReviewer-input .react-select__menu .react-select__option').should('exist')
                .should('have.text', 'Fox, Lora Dawn (ldingram)').click()
            cy.field('hrReviewerId').should('have.value', 'ldingram')
        })

        it('should require disapproval reason for disapprove', () => {
            cy.get('#disapprove').click()
            cy.field('disapproveReason').should('exist')
            cy.get('#disapprove-submit').click()
            cy.field('disapproveReason').should('have.class', 'rvt-validation-danger')
            cy.get('#disapprove-cancel').click()
            cy.wait(Cypress.env('defaultWaitTime'))
        })

        it('should allow input of adhoc approver', () => {
            cy.get('input[id="adhoc"]').clear({force: true}).type('jkneal', {force: true})
            cy.get('#adhoc-input .react-select__menu .react-select__option').should('exist')
                .should('have.text', 'Neal, Jerry K (jkneal)').click()
            cy.field('additionalReviewerId').should('have.value', 'jkneal')
        })

        it('should allow input of comments', () => {
            cy.field('comments').type('This person is awesome working at home.').should('have.value',
                'This person is awesome working at home.')
        })

        it('should not allow action after approval', () => {
            cy.get('#approve').click()
            cy.wait(Cypress.env('defaultWaitTime') * 4)
            cy.get('#approve').should('not.exist')
            cy.get('#disapprove').should('not.exist')
        })

    })

    describe('When approving as adhoc', () => {
        before(() => {
            cy.backdoor('jkneal')
            goToReview()
        })

        it('should display actions taken table with supervisor approval', () => {
            cy.get('#actions-taken').getTable().should(tableData => {
                expect(tableData.length).to.equal(2)
                expect(tableData[1].User).to.be.oneOf(["rob", "rlowden"]);
                expect(tableData[1].Action).to.equal('approve')
                expect(tableData[1].Date).to.not.be.empty
                expect(tableData[1]['Approver Comments']).to.equal('This person is awesome working at home.')
            })
        })

        it('should allow input of adhoc approver', () => {
            cy.get('input[id="adhoc"]').clear({force: true}).type('pcberg', {force: true})
            cy.get('#adhoc-input .react-select__menu .react-select__option').should('exist')
                .should('have.text', 'Berg, Philip Clemens (pcberg)').click()
            cy.field('additionalReviewerId').should('have.value', 'pcberg')
        })

        it('should allow input of comments', () => {
            cy.field('comments').type('Sounds good to me.').should('have.value', 'Sounds good to me.')
        })

        it('should not allow action after approval', () => {
            cy.get('#approve').click()
            cy.wait(Cypress.env('defaultWaitTime') * 4)
            cy.get('#approve').should('not.exist')
            cy.get('#disapprove').should('not.exist')
        })

        it('should allow further adhoc approvals', () => {
            cy.backdoor('pcberg')
            cy.wait(Cypress.env('defaultWaitTime') * 4)
            goToReview()

            cy.get('#actions-taken').getTable().should(tableData => {
                expect(tableData.length).to.equal(3)
                expect(tableData[2].User).to.equal('jkneal')
                expect(tableData[2].Action).to.equal('approve')
                expect(tableData[2].Date).to.not.be.empty
                expect(tableData[2]['Approver Comments']).to.equal('Sounds good to me.')
            })

            cy.get('#approve').click()
            cy.wait(Cypress.env('defaultWaitTime') * 4)
            cy.get('#approve').should('not.exist')
            cy.get('#disapprove').should('not.exist')
        })
    })

    describe('When approving as hr reviewer', () => {
        before(() => {
            cy.backdoor('ldingram')
            goToReview()
        })

        it('should allow pushback', () => {
            cy.get('#pushback').should('exist')
        })

        it('should display actions taken table with four rows', () => {
            cy.get('#actions-taken').getTable().should(tableData => {
                expect(tableData.length).to.equal(4)
            })
        })

    })
})

function goToReview() {
    cy.task('getTestDocumentNumbers').then(testDocumentNumbers => {
        const {documentNumber} = testDocumentNumbers[0]
        cy.visit('/arrangement/review/'+ documentNumber)
        cy.wait(Cypress.env('defaultWaitTime') * 6)
    })
}