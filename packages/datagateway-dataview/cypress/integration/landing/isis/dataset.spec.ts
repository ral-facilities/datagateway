describe('ISIS - Datset Landing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit(
      '/browse/instrument/1/facilityCycle/16/investigation/97/dataset/337'
    );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains('DATASET 337').should('be.visible');
  });

  it('should be able to click a dataset to see its datafiles', () => {
    cy.get('#dataset-datafiles-tab').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/16/investigation/97/dataset/337/datafile'
    );
  });
});
