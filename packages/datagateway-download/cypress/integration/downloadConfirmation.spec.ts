describe('Download Confirmation', () => {
    beforeEach(() => {
        Cypress.currentTest.retries(2);
        cy.server();
        cy.route('GET', '**/topcat/user/cart/**').as('fetchCart');
        cy.login('user', 'password');

        cy.addCartItem('investigation 1').then(() => {
            cy.visit('/');
            cy.wait('@fetchCart');
        });

        // Open the confirmation dialog and confirm it is present.
        cy.contains('Download Cart').click();
        cy.get('[aria-label="download-confirm-dialog"]').should('exist');
    });

    afterEach(() => {
        cy.clearDownloadCart();
    });

    it('should load correctly and display the confirmation dialog for the cart items', () => {
        // Show the correct download size of the cart items. 
        cy.contains('[aria-label="confirm-download-size"]', 'Download size: 10.8 GB').should('exist');
        
        // Shows HTTPS as the default access method.
        cy.contains('[aria-label="confirm-access-method"]', 'HTTPS').should('exist');

        // Shows the estimated download time (at 1 Mbps).
        cy.contains('[aria-label="confirm-estimated-time"]', '1 day, 33 minutes, 54 seconds').should('exist');
    });

    it.only('should show access method information varying on access method selection', () => {
        // Ensure that it is set to HTTPS already.
        cy.contains('[aria-label="confirm-access-method"]', 'HTTPS').should('exist');

        // Check the access method information shown presently.
        cy.contains('#confirm-access-method-information', 
            'HTTPS is the default access method.'    
        ).should('exist');

        cy.get('[aria-label="confirm-access-method"]').click();

        cy.contains('#confirm-access-method-globus', 'Globus')
            .should('exist')
            .click();

        // Check the access method information has changed to Globus.
        cy.contains('#confirm-access-method-information', 
            'Globus is a special access method.'    
        ).should('exist');
    });

    it('should show estimated download time varying on connection speed selection', () => {

    });

    it('should be able to submit a download request with default values', () => {
        
    });

    it('should be able to submit a download request with custom values', () => {
        // Set download name.

        // Set access method.

        // Set email address.
    });

    it('should prevent download requests with an invalid email address', () => {

    });

    it('should be able to close the download confirmation dialog', () => {
        cy.get('[aria-label="download-confirmation-close"]').should('exist');

        cy.get('[aria-label="download-confirmation-close"]').click();

        cy.get('[aria-label="download-confirm-dialog"]').should('not.exist');
    });
});