describe('When visiting the attestation page', () => {
    before(() => {
        cy.backdoor('jkneal')
        cy.get('#attestation-link').click({force: true})
    })

    it('should show the current attestation text list', () => {
        cy.get('#attestation-text-list').should('exist')
    })

    it('should show the \'Create New Version\' button as enabled', () => {
        cy.get('#create-new-version').should('be.enabled')
    })

    describe('When the Create New Version button is clicked', () => {
        before(() => {
            cy.get('#create-new-version').click()
        })

        it('should take the user to the Edit Attestation Text page', () => {
            cy.url().should('contain', '/admin/attestation/edit')
        })
    })
})
