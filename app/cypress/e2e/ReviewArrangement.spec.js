import {todayStr, tomorrowStr, yesterdayStr} from './date-utils'
import {createArrangement} from "../support/utils";

let doc1
describe('When an arrangement is pending', () => {

    before(() => {
        cy.backdoor('aaneal')
        cy.task('clearTestDocumentNumbers')
        cy.fixture('doc1').then((d) => {
            doc1 = d
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

    describe('When an arrangement is pending', () => {
        before(() => {
            cy.visit('/')
        })
        it('should show pending message for job', () => {
            cy.get('.job-status-header').then(jobHeaders => {
                expect(jobHeaders.length).eq(1)
                expect(jobHeaders[0].textContent).eq(' Approval pending for IT Sr. Executive (UA-DCIO, Rec 1)')
            })
        })

        it('should allow viewing arrangement submission', () => {
            cy.get('#job-arrangement-0 button').then(btns => {
                expect(btns.length).eq(1)
                expect(btns[0].textContent).eq('View submission')
                btns[0].click()

                cy.wait(Cypress.env('defaultWaitTime'))
                cy.task('getTestDocumentNumbers').then(testDocumentNumbers => {
                    const {documentNumber} = testDocumentNumbers[0]
                    cy.url().should('include', '/arrangement/review/' + documentNumber)
                })
            })
        })
    })

    describe('When viewing an arrangement', () => {
        let docNumber
        before(() => {
            cy.task('getTestDocumentNumbers').then(testDocumentNumbers => {
                const {documentNumber} = testDocumentNumbers[0]
                docNumber = documentNumber
                cy.visit('/arrangement/review/'+ documentNumber)
            })
        })
        it('should display arrangement data', () => {
            cy.get('#name').should('have.text', doc1.employee.firstName + ' ' + doc1.employee.lastName)
            cy.get('#jobTitle').should('have.text', doc1.job.jobTitle)
            cy.get('#jobDepartmentId').should('have.text', doc1.job.jobDepartmentId)
            cy.get('#campus').should('have.text', doc1.employee.campus)
            cy.get('#remoteWorkType').should('have.text', doc1.remoteWorkType)
            cy.get('#remoteWorkStartDate').should('have.text', todayStr)
            cy.get('#remoteWorkEndDate').should('have.text', tomorrowStr)
            cy.get('#coreHours').should('have.text', doc1.arrangementWorkDays.formattedCoreHoursStartTime + ' - ' +
                doc1.arrangementWorkDays.formattedCoreHoursEndTime + ' EST daily')
            cy.get('#workDaysType').should('not.exist')
            cy.get('#workLocation').should('contain', doc1.workAddressLine1).should('contain', doc1.workAddressLine2)
                .should('contain', doc1.workAddressCity).should('contain', doc1.workAddressState)
                .should('contain', doc1.workAddressCountry).should('contain', doc1.workAddressZip)
            cy.get('#distanceIuCampus').should('have.text', 'Yes')
            cy.get('#studentFacingPercentage').should('have.text', doc1.studentFacingPercentage + '%')
            cy.get('#reason').should('have.text', doc1.reason)
            cy.get('#supervisor').should('have.text', doc1.supervisor.firstName + ' ' + doc1.supervisor.lastName)
            cy.get('#documentNumber').should('have.text', docNumber)
            cy.get('#createDate').should('have.text', todayStr)
        })

        it('should render button to print', () => {
            cy.get('#print').should('exist')
        })

        it('should render button to return home', () => {
            cy.get('#return-home').click()
            cy.url().then(url => expect(url.endsWith('/')))
        })
    })
})



