describe('ISIS - Data Publication Landing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/browseDataPublications/instrument/1/dataPublication/36');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains('Yourself good together red across.').should('be.visible');
    cy.contains('a', '0-7602-7584-X').should(
      'have.attr',
      'href',
      'https://doi.org/0-7602-7584-X'
    );
    cy.get('[data-testid="landing-dataPublication-pid-link"]')
      .first()
      .then(($pid) => {
        const pid = $pid.text();

        const url = `https://doi.org/${pid}`;

        cy.get('[data-testid="landing-dataPublication-pid-link"]')
          .first()
          .should('have.attr', 'href', url);
      });
  });

  it('should be able to click tab to see investigations', () => {
    cy.get('#datapublication-investigations-tab')
      .first()
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseDataPublications/instrument/1/dataPublication/36/investigation'
    );
  });

  it('should be able to click a specific investigation', () => {
    cy.get('[data-testid="landing-datapublication-part-label"')
      .children()
      .first()
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseDataPublications/instrument/1/dataPublication/36/investigation/38'
    );
  });

  it('should load correctly when investigation missing', () => {
    cy.intercept('**/datapublications?*', [
      {
        id: 101224979,
        pid: '10.5286/ISIS.E.RB1810842',
      },
    ]);
    cy.visit('/browseDataPublications/instrument/1/dataPublication/36');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains('10.5286/ISIS.E.RB1810842').should('be.visible');
  });

  it('should disable the hover tool tip by pressing escape', () => {
    cy.intercept('**/datapublications?*', [
      {
        id: 36,
        pid: '10.5286/ISIS.E.RB1810842',
      },
    ]);
    cy.get('[data-testid="landing-dataPublication-pid-link"]')
      .first()
      .trigger('mouseover');
    cy.get('[role="tooltip"]').should('exist');

    cy.get('body').type('{esc}');

    cy.get('[data-testid="landing-dataPublication-pid-link"]')
      .first()
      .get('[role="tooltip"]')
      .should('not.exist');
  });

  it('should be able to use the citation formatter', () => {
    cy.intercept('**/datapublications?*', [
      {
        id: 101224979,
        pid: '10.5286/ISIS.E.RB1810842',
      },
    ]);
    cy.intercept('**/text/x-bibliography/10.5286/ISIS.E.RB1810842?*', [
      '@misc{dr sabrina gaertner_mr vincent deguin_dr pierre ghesquiere_dr claire...}',
    ]);

    cy.visit('/browseDataPublications/instrument/1/dataPublication/36');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains('10.5286/ISIS.E.RB1810842').should('be.visible');
    cy.get('[data-testid="citation-formatter-citation"]').contains(
      'STFC ISIS Neutron and Muon Source, https://doi.org/10.5286/ISIS.E.RB1810842'
    );

    cy.get('#citation-formatter').click();
    cy.get('[role="listbox"]')
      .find('[role="option"]')
      .should('have.length.gte', 2);

    cy.get('[role="option"][data-value="bibtex"]').click();
    cy.get('[data-testid="citation-formatter-citation"]').contains(
      '@misc{dr sabrina gaertner_mr vincent deguin_dr pierre ghesquiere_dr claire'
    );
    cy.get('#citation-formatter-error-message').should('not.exist');
  });

  it('citation formatter should give an error when there is a problem', () => {
    cy.intercept('**/datapublications?*', [
      {
        id: 101224979,
        pid: 'invaliddoi',
      },
    ]);
    cy.intercept('**/text/x-bibliography/invaliddoi?*', {
      statusCode: 503,
    });
    cy.visit('/browseDataPublications/instrument/1/dataPublication/36');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains('invaliddoi').should('be.visible');

    //Default citation
    cy.get('[data-testid="citation-formatter-citation"]').contains(
      'STFC ISIS Neutron and Muon Source, https://doi.org/invaliddoi'
    );

    cy.get('#citation-formatter').click();
    cy.get('[role="listbox"]')
      .find('[role="option"]')
      .should('have.length.gte', 2);

    cy.get('[role="option"][data-value="chicago-author-date"]').click();
    cy.get('#citation-formatter-error-message', { timeout: 10000 }).should(
      'exist'
    );
  });
});
