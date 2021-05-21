describe('ISIS - Study Landing', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.visit('/browseStudyHierarchy/instrument/1/study/405');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click tab to see investigations', () => {
    cy.get('#study-investigations-tab').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseStudyHierarchy/instrument/1/study/405/investigation'
    );
  });

  it('should be able to click a specific investigation', () => {
    cy.get('[aria-label="landing-study-part-label"')
      .children()
      .first()
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseStudyHierarchy/instrument/1/study/405/investigation/2'
    );
  });
});
