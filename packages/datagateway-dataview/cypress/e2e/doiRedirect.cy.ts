describe('DOI Redirect', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should redirect to correct page if valid id', () => {
    cy.visit('/doi-redirect/LILS/investigation/8');

    cy.url().should(
      'include',
      '/browse/instrument/2/facilityCycle/8/investigation/8/dataset'
    );
  });

  it('should redirect to homepage if invalid id', () => {
    cy.visit('/doi-redirect/LILS/investigation/100000000000');

    cy.url().should('include', '/datagateway');
  });
});
