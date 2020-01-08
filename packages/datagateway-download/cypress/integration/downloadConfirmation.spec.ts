describe('Download Confirmation', () => {
    before(() => {
        // Ensure the download cart is cleared before running tests.
        cy.login('user', 'password');
        cy.clearDownloadCart();
        // cy.deleteTestDownload();
    });
    
    beforeEach(() => {
        // Manually override the time, so we know what date/time to expect for downloads.
        cy.clock(Date.UTC(2020, 0, 1, 1, 1, 1), ['Date']);

        Cypress.currentTest.retries(2);
        cy.server();
        cy.route('GET', '**/topcat/user/cart/**').as('fetchCart');
        cy.login('user', 'password');

        // Ensure the cart is clear before running tests.
        cy.clearDownloadCart();

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
        // cy.deleteTestDownload();
    });

    it('should load correctly and display the confirmation dialog for the cart items', () => {
        // Show the correct download size of the cart items. 
        cy.contains('[aria-label="confirm-download-size"]', 'Download size: 10.8 GB').should('exist');
        
        // Shows HTTPS as the default access method.
        cy.contains('[aria-label="confirm-access-method"]', 'HTTPS').should('exist');

        // Shows the estimated download time (at 1 Mbps).
        cy.contains('[aria-label="confirm-estimated-time"]', '1 day, 33 minutes, 54 seconds').should('exist');
    });

    it('should show access method information varying on access method selection', () => {
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
        // Ensure that 1 Mbps is already selected and the expected time is already showing.
        cy.contains('#confirm-connection-speed', '1 Mbps').should('exist');

        cy.contains('[aria-label="confirm-estimated-time"]', 
            '1 day, 33 minutes, 54 seconds'
        ).should('exist');

        // Check at 30 Mbps.
        cy.get('#confirm-connection-speed').click();

        cy.contains('#confirm-connection-speed-30', '30 Mbps')
            .should('exist')
            .click();

        cy.contains('#confirm-connection-speed', '30 Mbps').should('exist');

        cy.contains('[aria-label="confirm-estimated-time"]', 
            '49 minutes, 7 seconds'
        ).should('exist');

        // Check at 100 Mbps.
        cy.get('#confirm-connection-speed').click();
        
        cy.contains('#confirm-connection-speed-100', '100 Mbps')
            .should('exist')
            .click();

        cy.contains('#confirm-connection-speed', '100 Mbps').should('exist');

        cy.contains('[aria-label="confirm-estimated-time"]', 
            '14 minutes, 44 seconds'
        ).should('exist');
    });

    it('should prevent download requests with an invalid email address', () => {
        // Enter in an invalid email address.
        cy.get('#confirm-download-email').type('email.address');

        // Ensure that the download button is disabled.
        cy.get('#download-confirmation-download').should('be.disabled');

        // Complete the remainder of the email and ensure the email is not invalid anymore
        // as the download button is enabled.
        cy.get('#confirm-download-email').type('@test.com');
        cy.get('#download-confirmation-download').should('be.enabled');
    });

    it('should be able to submit a download request and start immediate download with default values (HTTPS)', () => {
        // Ensure our access method is HTTPS before starting an immediate download.
        cy.contains('[aria-label="confirm-access-method"]', 'HTTPS').should('exist');

        // Click on the download button.
        cy.get('#download-confirmation-download').click();

        // Ensure the correct message and download details are shown.
        cy.contains('#download-confirmation-success-default',
            'Successfully submitted and started download'
        ).should('exist');

        cy.contains('#confirm-success-download-name', 'LILS_2020-1-1_1-1-1').should('exist');
        cy.contains('#confirm-success-access-method', 'HTTPS').should('exist');
    });

    it('should be able to submit a download request with altered access method (Globus)', () => {
        // Ensure our access method is HTTPS before starting an immediate download.
        cy.get('[aria-label="confirm-access-method"]')
            .should('exist')
            .click();
        
        cy.contains('#confirm-access-method-globus', 'Globus')
            .should('exist')
            .click();

        // Click on the download button.
        cy.get('#download-confirmation-download').click();

        // Ensure the correct message and download details are shown.
        cy.contains('#download-confirmation-success-other',
            'Successfully created download'
        ).should('exist');

        cy.contains('#confirm-success-download-name', 'LILS_2020-1-1_1-1-1').should('exist');
        cy.contains('#confirm-success-access-method', 'GLOBUS').should('exist');
    });

    it('should show download confirmation unsuccessful if no download information was received', () => {
        // We will force download information to not be returned by clearing cart,
        // but in the event a request which fails this will be shown.
        cy.clearDownloadCart();

        // Click on the download button.
        cy.get('#download-confirmation-download').click();

        cy.contains('#download-confirmation-unsuccessful', 
            'Your download request was unsuccessful'
        ).should('exist');
    });

    it('should be able to submit a download request with custom values', () => {
        // Set download name.
        cy.get('#confirm-download-name').type('test-file-name');

        // Set access method.
        cy.get('[aria-label="confirm-access-method"]')
            .should('exist')
            .click();
        
        cy.contains('#confirm-access-method-globus', 'Globus')
            .should('exist')
            .click();

        // Set email address.
        cy.get('#confirm-download-email').type('test@email.com');

        // Request download.
        cy.get('#download-confirmation-download').click();

        cy.contains('#download-confirmation-success-other', 
            'Successfully created download'
        ).should('exist');

        // Ensure the download name, access method and email address match that of which we changed.
        cy.contains('#confirm-success-download-name', 'test-file-name').should('exist');
        cy.contains('#confirm-success-access-method', 'GLOBUS').should('exist');
        cy.contains('#confirm-success-email-address', 'test@email.com').should('exist');
    });

    // This needs to be implemented once the tab has been included into the code.
    // it('should be able to link to the downloads status tab upon successful download confirmation', () => {
    // });

    it('should be able to close the download confirmation dialog', () => {
        cy.get('[aria-label="download-confirmation-close"]').should('exist');

        cy.get('[aria-label="download-confirmation-close"]').click();

        cy.get('[aria-label="download-confirm-dialog"]').should('not.exist');
    });
});