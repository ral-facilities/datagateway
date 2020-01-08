describe('Download Confirmation', () => {
    beforeEach(() => {
        Cypress.currentTest.retries(2);
        cy.server();
        cy.route('GET', '**/topcat/user/cart/**').as('fetchCart');
        cy.login('user', 'password');
        
        // cy.seedDownloadCart().then(() => {
            // cy.visit('/');
            // cy.wait('@fetchCart');
        // });

        cy.addCartItem('investigation 1').then(() => {
            cy.visit('/');
            cy.wait('@fetchCart');
        });
    });

    afterEach(() => {
        cy.clearDownloadCart();
    });

    it('should load correctly and display the confirmation dialog for a cart item', () => {

    });

    it('should be able to submit a download request with default values', () => {

    });
});