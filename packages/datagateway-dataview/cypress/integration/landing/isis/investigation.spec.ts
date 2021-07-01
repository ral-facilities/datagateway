describe('ISIS - Investigation Landing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/browse/instrument/1/facilityCycle/14/investigation/87');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('#investigation-datasets-tab').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/14/investigation/87/dataset'
    );
  });

  it('should be able to click a specific dataset', () => {
    cy.get('[aria-label="landing-investigation-part-label"')
      .children()
      .first()
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/14/investigation/87/dataset/348'
    );
  });
});
