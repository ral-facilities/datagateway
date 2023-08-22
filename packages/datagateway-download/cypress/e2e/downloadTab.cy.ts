describe('Download Cart', () => {
  beforeEach(() => {
    cy.login();
    cy.clearDownloadCart();

    cy.seedDownloadCart().then(() => {
      cy.visit('/download');
    });
  });

  afterEach(() => {
    cy.clearDownloadCart();
  });

  it('should display the selection tab on every page reload', () => {
    cy.title().should('equal', 'DataGateway Download');
    cy.get('#datagateway-download').should('be.visible');
    cy.get('[aria-label="Selection"]').should('exist');
    cy.get('[aria-label="Downloads"]').should('exist');
    cy.get('[aria-label="Download selection panel"]').should('be.visible');
    cy.get('[aria-label="Download status panel"]').should('not.be.visible');

    cy.get('[aria-label="Downloads"]').click();
    cy.get('[aria-label="Download status panel"]').should('be.visible');
    cy.get('[aria-label="Download selection panel"]').should('not.be.visible');

    cy.reload();

    cy.get('[aria-label="Download selection panel"]').should('be.visible');
    cy.get('[aria-label="Download status panel"]').should('not.be.visible');
  });
});
