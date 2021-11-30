describe('ISIS - Investigation Landing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/browse/instrument/1/facilityCycle/16/investigation/97');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains('Again bad simply low summer').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('#investigation-datasets-tab').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/16/investigation/97/dataset'
    );
  });

  it('should have the correct urls for the DOI link and parent DOI link', () => {
    // DOI

    cy.get('[data-testid="isis-investigation-landing-doi-link"]')
      .first()
      .then(($doi) => {
        const doi = $doi.text();

        const url = `https://doi.org/${doi}`;

        cy.get('[data-testid="isis-investigation-landing-doi-link"]')
          .first()
          .should('have.attr', 'href', url);
      });

    // Parent DOI

    cy.get('[data-testid="isis-investigations-landing-parent-doi-link"]')
      .first()
      .then(($doi) => {
        const doi = $doi.text();

        const url = `https://doi.org/${doi}`;

        cy.get('[data-testid="isis-investigations-landing-parent-doi-link"]')
          .first()
          .should('have.attr', 'href', url);
      });
  });

  it('should be able to click a specific dataset', () => {
    cy.get('[aria-label="landing-investigation-part-label"')
      .children()
      .first()
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/16/investigation/97/dataset/337'
    );
  });
});
