describe('ISIS - Study Data Publication Cards', () => {
  beforeEach(() => {
    cy.intercept(
      /\/datapublications\/count\?.*where=%7B%22type\.name%22%3A%7B%22eq%22%3A%22study%22%7D%7D.*/,
      (req) => {
        // delete type = study requirement
        const [url, search] = req.url.split('?');
        const params = new URLSearchParams(search);
        params.delete('where', '{"type.name":{"eq":"study"}}');
        req.url = `${url}?${params.toString()}`;

        req.continue();
      }
    ).as('getDataPublicationsCount');
    cy.intercept(
      /\/datapublications\?.*where=%7B%22type\.name%22%3A%7B%22eq%22%3A%22study%22%7D%7D.*/,
      (req) => {
        // delete type = study requirement
        const [url, search] = req.url.split('?');
        const params = new URLSearchParams(search);
        params.delete('where', '{"type.name":{"eq":"study"}}');
        req.url = `${url}?${params.toString()}`;

        req.continue();
      }
    ).as('getDataPublications');
    cy.login();
    cy.visit(
      '/browseDataPublications/instrument/8/dataPublication?view=card'
    ).wait(['@getDataPublicationsCount', '@getDataPublications'], {
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
      .contains('Daughter')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseDataPublications/instrument/8/dataPublication/50'
    );
  });

  it('should be able to sort by one field or multiple', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Title').as('titleSortButton').click();

    // ascending
    cy.contains('[role="button"]', 'DOI').as('doiSortButton').click();
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('Article');

    // descending
    cy.get('@doiSortButton').click();
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('[data-testid="card"]').first().contains('Daughter');

    // no order
    cy.get('@doiSortButton').click();
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('Article');

    // multiple fields (shift click)
    cy.get('@titleSortButton').click();
    cy.get('@doiSortButton').click({ shiftKey: true });

    cy.contains('[aria-label="Sort by TITLE"]', 'asc').should('exist');
    cy.contains('[aria-label="Sort by DOI"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('Article');

    // should replace current sort if clicked without shift
    cy.get('@doiSortButton').click();

    cy.contains('[aria-label="Sort by DOI"]', 'desc').should('exist');
    cy.contains('[aria-label="Sort by TITLE"]', 'asc').should('not.exist');

    cy.get('[data-testid="card"]').first().contains('Daughter');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[data-testid="advanced-filters-link"]').click();

    cy.get('[aria-label="Filter by DOI"]').first().type('5');

    cy.contains('Results: 2').should('exist');

    cy.get('[data-testid="card"]').first().contains('Consider');

    cy.get('[aria-label="Filter by Title"]').first().type('sub');

    cy.contains('Results: 1').should('exist');

    cy.get('[data-testid="card"]').first().contains('Article');
  });
});
