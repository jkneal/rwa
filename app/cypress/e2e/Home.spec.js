import {getCy, ifExists} from "../support/utils";

describe('When the homepage is visited', () => {
    before(() => {
        cy.login('rwaaft');
    });

    it('should show header and info message', () => {
        cy.visit('/')
        cy.get('h1').should('contain', 'Remote Work Arrangement')
        cy.get('#rwa-info').should('exist')
    })

    it('should allow backdoor', () => {
        backdoor('tlbean')
        cy.get('[data-testid="avatar-username__testid"]').should('contain', 'Bean, Tammy')
    })

    it('should be able to switch backdoor user', () => {
        backdoor('johglove')
        cy.get('[data-testid="avatar-username__testid"]').should('contain', 'Glover, John')
    })

    it('should be able to end backdoor user', () => {
        cy.get(getCy('userMenu__dropdown')).click()
        cy.get('#end-backdoor').click({force: true})
        cy.wait(Cypress.env('defaultWaitTime'))
        cy.get('[data-testid="avatar-username__testid"]').should('contain', 'AFT, RWA')
    })
})

describe('When user has no eligible jobs', () => {
    beforeEach(() => {
        cy.backdoor('aknshah')
    })

    it('should display no eligible jobs message', () => {
        cy.get('#no-eligible-positions-warning').should('exist')
    })
})

describe('When user has no agreement for eligible job', () => {
    beforeEach(() => {
        cy.backdoor('aaneal')
    })

    it('should show no arrangement message for 1 job', () => {
        cy.get('.job-status-header').then(jobHeaders => {
            expect(jobHeaders.length).eq(1)
            expect(jobHeaders[0].textContent).eq(' No arrangement in place for IT Sr. Executive (UA-DCIO, Rec 1)')
        })
    })

    it('should allow starting request for 1 job', () => {
        cy.get('#job-arrangement-0 button').then(btns => {
            expect(btns.length).eq(1)
            expect(btns[0].textContent).eq('Start your request')
            btns[0].click()

            cy.wait(Cypress.env('defaultWaitTime'))
            cy.url().should('include', '/arrangement/new')
        })
    })
})

describe('When user has no agreements for multiple jobs', () => {
    beforeEach(() => {
        // If this person changes appointments we may need to find a new one. It doesn't matter how many, we want >1
        cy.backdoor('richarjw')
    })

    it('should show no arrangement message for 2 jobs', () => {
        cy.get('.job-status-header').then(jobHeaders => {
            expect(jobHeaders.length).eq(4)
            expect(jobHeaders[0].textContent).eq(' No arrangement in place for PIC Part Time Employee (BA-ATHL, Rec 9)')
            expect(jobHeaders[1].textContent).eq(' No arrangement in place for PIC Part Time Employee (BA-ATHL, Rec 10)')
            expect(jobHeaders[2].textContent).eq(' No arrangement in place for Registered Nurse (BA-IUHC, Rec 0)')
            expect(jobHeaders[3].textContent).eq(' No arrangement in place for Part Time PIC Employee (BA-AUTM, Rec 8)')
        })
    })

    it('should allow starting request for 4 jobs', () => {
        cy.get('#job-arrangement-0 button').then(btns => {
            expect(btns.length).eq(1)
            expect(btns[0].textContent).eq('Start your request')
        })

        cy.get('#job-arrangement-1 button').then(btns => {
            expect(btns.length).eq(1)
            expect(btns[0].textContent).eq('Start your request')
        })

        cy.get('#job-arrangement-2 button').then(btns => {
            expect(btns.length).eq(1)
            expect(btns[0].textContent).eq('Start your request')
        })

        cy.get('#job-arrangement-3 button').then(btns => {
            expect(btns.length).eq(1)
            expect(btns[0].textContent).eq('Start your request')
        })
    })
})

describe('Attestation link', () => {
    it('should appear for admin', () => {
        cy.backdoor('jkneal')
        cy.get('#attestation-link').should('exist')
    })

    it('should take users to the Attestation Text page', () => {
        cy.backdoor('jkneal')
        cy.get('#attestation-link').click({ force: true })
        cy.url().should('include', '/admin/attestation')
    })

    it('should not appear for non-admin', () => {
        cy.login('rwaaft');
        cy.backdoor('aaneal')
        cy.get('#attestation-link').should('not.exist')
    })
})

describe('Header Identity', () => {
    it('should show preferred name -- Matt', () => {
        cy.wait(Cypress.env('defaultWaitTime'))
        cy.backdoor('masargen')
        cy.get('[data-testid="avatar-username__testid"]').should('contain', 'Sargent, Matt')
    })

    it('should show preferred name -- Aaron', () => {
        cy.backdoor('aaneal')
        cy.get('[data-testid="avatar-username__testid"]').should('contain', 'Neal, Aaron')
    })
})

function backdoor(userId) {
    cy.get(getCy('userMenu__dropdown')).click()
    cy.get('#backdoorId').type(userId, {force: true})
    cy.wait(Cypress.env('defaultWaitTime'))
    cy.get(getCy('Backdoor-input')).get(".react-select__menu-list").find('.react-select__option:first').click({ force: true })
    cy.get('#submit-backdoor').click({ force: true })
    cy.wait(Cypress.env('defaultWaitTime'))
}
