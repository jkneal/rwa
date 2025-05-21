import {todayStr, yesterdayStr, tomorrowStr} from './date-utils'

describe('When creating a new arrangement', () => {
    before(() => {
        cy.task('clearTestDocumentNumbers')
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

    describe('When a new arrangement is created', () => {
        before(() => {
            cy.backdoor('aaneal')
            cy.get('#job-arrangement-0 button').then(btns => {
                expect(btns.length).eq(1)
                expect(btns[0].textContent).eq('Start your request')
                btns[0].click()

                cy.wait(Cypress.env('defaultWaitTime') * 4)
                cy.url().should('include', '/arrangement/new')
            })
        })

        it('should display employee name and job title', () => {
            cy.get('#employee-header').should('contain', 'Aaron Neal, IT Sr. Executive')
        })

        it('should default start date to current date', () => {
            cy.field('remoteWorkStartDate').should('have.value', todayStr)
        })

        it('should require start date', () => {
            cy.field('remoteWorkStartDate').clear().should('have.class', 'rvt-validation-danger')
        })

        it('should not allow end date before start date', () => {
            cy.field('remoteWorkStartDate').type(todayStr).should('have.value', todayStr)
            cy.field('remoteWorkEndDate').type(yesterdayStr).should('have.value', yesterdayStr)
            cy.field('remoteWorkStartDate').should('have.class', 'rvt-validation-danger')
        })

        it('should allow valid input of start and end date', () => {
            cy.field('remoteWorkEndDate').clear().type(tomorrowStr).should('have.value', tomorrowStr)
            cy.field('remoteWorkStartDate').should('not.have.class', 'rvt-validation-danger')
            cy.field('remoteWorkEndDate').should('not.have.class', 'rvt-validation-danger')
        })

        it('should default working from home and home country/state', () => {
            cy.field('workAddressHome').should('have.value', 'YES')
            cy.field('workAddressCountry').should('have.value', 'US')
            cy.field('workAddressState').should('have.value', 'IN')
        })

        it('should disable work state when country is not US', () => {
            cy.field('workAddressCountry').select('GB')
            cy.field('workAddressState').should('be.disabled')
        })

        it('should default back work state when country is changed to US', () => {
            cy.field('workAddressCountry').select('US')
            cy.field('workAddressState').should('not.be.disabled')
            cy.field('workAddressState').should('have.value', 'IN')
        })

        it('allows input of address when work address is not home', () => {
            cy.field('workAddressHome').check('NO', {force: true})
            cy.field('workAddressLine1').type('3301 N Grey Street')
            cy.field('workAddressLine2').type('House #2')
            cy.field('workAddressCity').type('Drumland')
            cy.field('workAddressZip').type('44433')
        })
    })

    describe('When hybrid work type is selected', () => {
        before(() => {
            cy.field('remoteWorkType').check('HYBRID', {force: true})
        })

        it('should display work days type', () => {
            cy.field('arrangementWorkDays.workDaysType').should('exist')
        })

        it('should allow selection of days when fixed work days type is selected', () => {
            cy.field('arrangementWorkDays.workDaysType').check('FIXED', {force: true})
            cy.field('arrangementWorkDays.fixedMonday').should('exist')
            cy.field('arrangementWorkDays.fixedTuesday').should('exist')
            cy.field('arrangementWorkDays.fixedWednesday').should('exist')
            cy.field('arrangementWorkDays.fixedThursday').should('exist')
            cy.field('arrangementWorkDays.fixedFriday').should('exist')
            cy.field('arrangementWorkDays.fixedSaturday').should('exist')
            cy.field('arrangementWorkDays.fixedSunday').should('exist')
            cy.field('arrangementWorkDays.fixedTuesday').check({force: true})
            cy.field('arrangementWorkDays.fixedWednesday').check({force: true})
            cy.field('arrangementWorkDays.fixedFriday').check({force: true})
        })

        it('should allow number of days when FLOATING work days type is selected', () => {
            cy.field('arrangementWorkDays.workDaysType').check('FLOATING', {force: true})
            cy.field('arrangementWorkDays.fixedMonday').should('not.exist')
            cy.field('arrangementWorkDays.fixedTuesday').should('not.exist')
            cy.field('arrangementWorkDays.fixedWednesday').should('not.exist')
            cy.field('arrangementWorkDays.fixedThursday').should('not.exist')
            cy.field('arrangementWorkDays.fixedFriday').should('not.exist')
            cy.field('arrangementWorkDays.fixedSaturday').should('not.exist')
            cy.field('arrangementWorkDays.fixedSunday').should('not.exist')

            cy.field('arrangementWorkDays.floatingNumberOfDays').should('exist')
            cy.field('arrangementWorkDays.floatingNumberOfDays').select('3')
        })

    })

    describe('When fully remote work type is selected', () => {
        before(() => {
            cy.field('remoteWorkType').check('FULLY_REMOTE', {force: true})
        })

        it('should not display work days type', () => {
            cy.field('arrangementWorkDays.workDaysType').should('not.exist')
        })

    })

    describe('When completing a remote arrangement', () => {
        it('should require core hours', () => {
            cy.field('arrangementWorkDays.coreHoursStartTime').type('8:30 AM').clear()
            cy.field('arrangementWorkDays.coreHoursEndTime').type('5:00 PM').clear()

            cy.field('arrangementWorkDays.coreHoursStartTime').should('have.class', 'rvt-validation-danger')
            cy.field('arrangementWorkDays.coreHoursEndTime').should('have.class', 'rvt-validation-danger')
        })

        it('should allow input of core hours', () => {
            cy.field('arrangementWorkDays.coreHoursStartTime').type('8:30 AM{esc}')
            cy.field('arrangementWorkDays.coreHoursEndTime').type('5:00 PM{esc}')
        })

        it('should require student-facing percentage', () => {
            cy.get('#submit').click()
            cy.get('#studentFacingPercentage-input .rvt-inline-alert--danger').should('exist')
            cy.field('studentFacingPercentage').select('40')
        })

        it('should allow input of reason', () => {
            cy.field('reason').focus().type('For automated functional test', {force: true})
        })

        it('should default supervisor', () => {
            cy.get('#supervisor-input .react-select__single-value').should('have.text', 'Lowden, Rob (rob)')
        })
    })

    describe('When submitting a remote arrangement', () => {
        it('should require distance IU campus selection', () => {
            cy.get('#submit').click()
            cy.get('#distanceIuCampus-container .rvt-inline-alert--danger').should('exist')
            cy.field('distanceIuCampus').check('YES', {force: true})
        })

        it('should require agreement of acknowledgements', () => {
            cy.get('#submit').click()
            cy.get('#attestationAcknowledged-input .rvt-inline-alert--danger').should('exist')
            cy.field('attestationAcknowledged').check({force: true})
        })

        it('should redirect to review page with status', () => {
            cy.get('#submit').click()
            cy.wait(Cypress.env('defaultWaitTime') * 7)

            cy.url().should('include', '/arrangement/review')
            cy.get('#status-alert').should('contain', 'ENROUTE')

            cy.url().then(url => {
                const documentNumber = url.substring(url.lastIndexOf('/') + 1)
                cy.task('addTestDocumentNumbers', {documentNumber})
            })
        })
    })
})
