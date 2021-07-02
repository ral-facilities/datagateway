describe('ISIS - Datset Landing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit(
      '/browse/instrument/1/facilityCycle/14/investigation/87/dataset/118'
    );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('#dataset-datafiles-tab').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/14/investigation/87/dataset/118/datafile'
    );
  });
});
