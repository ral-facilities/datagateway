describe('Instrument Landing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/instrument/1');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    // title
    cy.contains('Stop prove field onto think suffer measure.').should(
      'be.visible'
    );
    // description
    cy.contains('Suggest shake effort many last prepare small.').should(
      'be.visible'
    );
    // instrument scientist
    cy.contains('Kathryn Fox').should('be.visible');

    // TODO: no doi, start date or end date fields yet, and type is just a number so hard to test via text
  });
});
