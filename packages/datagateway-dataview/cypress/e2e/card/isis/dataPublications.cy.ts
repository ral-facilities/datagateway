describe('ISIS - Data Publication Cards', () => {
  beforeEach(() => {
    cy.intercept('**/datapublications/count*').as('getDataPublicationsCount');
    cy.intercept('**/datapublications?order*').as('getDataPublicationsOrder');
    cy.login();
    cy.visit(
      '/browseDataPublications/instrument/8/dataPublication?view=card'
    ).wait(['@getDataPublicationsCount', '@getDataPublicationsOrder'], {
      timeout: 10000,
    });
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    cy.get('[data-testid="card"]')
      .first()
      .get('[data-testid="landing-datapublication-card-pid-link"]')
      .first()
      .then(($pid) => {
        const pid = $pid.text();

        const url = `https://doi.org/${pid}`;

        cy.get('[data-testid="card"]')
          .first()
          .get('[data-testid="landing-datapublication-card-pid-link"]')
          .first()
          .should('have.attr', 'href', url);
      });

    //Default sort
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
  });

  it('should be able to click a datapublication to see its landing page', () => {
    cy.get('[data-testid="card"]')
      .first()
      .contains('Church')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseDataPublications/instrument/8/dataPublication/51'
    );
  });

  it('should be able to sort by one field or multiple', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Publication Date')
      .as('dateSortButton')
      .click();
    cy.wait('@getDataPublicationsOrder', { timeout: 10000 });

    // ascending
    cy.get('@dateSortButton').click();
    cy.wait('@getDataPublicationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('Article');

    // descending
    cy.get('@dateSortButton').click();
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('[data-testid="card"]').first().contains('Church');

    // no order
    cy.get('@dateSortButton').click();
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('Article');

    // multiple fields
    cy.contains('[role="button"]', 'Title').click();
    cy.get('@dateSortButton').click({ shiftKey: true });
    cy.wait('@getDataPublicationsOrder', { timeout: 10000 });

    cy.contains('[aria-label="Sort by TITLE"]', 'asc').should('exist');
    cy.contains('[aria-label="Sort by PUBLICATION DATE"]', 'asc').should(
      'exist'
    );
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('Article');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[data-testid="advanced-filters-link"]').click();

    cy.get('[aria-label="Filter by DOI"]').first().type('0');
    cy.wait(['@getDataPublicationsCount', '@getDataPublicationsOrder'], {
      timeout: 10000,
    });
    cy.get('[data-testid="card"]').first().contains('Consider');

    cy.get('[aria-label="Filter by Title"]').first().type('sub');
    cy.wait(['@getDataPublicationsCount', '@getDataPublicationsOrder'], {
      timeout: 10000,
    });
    cy.get('[data-testid="card"]').first().contains('Article');
  });
});
