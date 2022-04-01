describe('DOI Redirect', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should redirect to correct page if valid id', () => {
    cy.visit('/doi-redirect/LILS/investigation/1');

    cy.url().should(
      'include',
      '/browse/instrument/8/facilityCycle/1/investigation/1/dataset'
    );
  });

  it('should redirect to homepage if invalid id', () => {
    cy.visit('/doi-redirect/LILS/investigation/100000000000');

    cy.url().should('include', '/datagateway');
  });
});
