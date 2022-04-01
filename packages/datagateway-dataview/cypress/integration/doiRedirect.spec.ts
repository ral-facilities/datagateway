describe('DOI Redirect', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('**/investigations/*').as('getInvestigation');
    cy.intercept('**/instruments/*').as('getInstrument');
    cy.intercept('**/facilitycycles/*').as('getFacilityCycle');
  });

  it('should redirect to correct page if valid id', () => {
    cy.visit('/doi-redirect/LILS/investigation/1').wait([
      '@getInvestigation',
      '@getInstrument',
      '@getFacilityCycle',
    ]);

    cy.url().should(
      'include',
      '/browse/instrument/8/facilityCycle/1/investigation/1'
    );
  });

  it('should redirect to homepage if invalid id', () => {
    cy.visit('/doi-redirect/LILS/investigation/100000000000').wait([
      '@getInvestigation',
      '@getInstrument',
      '@getFacilityCycle',
    ]);

    cy.url().should('include', '/datagateway');
  });
});
