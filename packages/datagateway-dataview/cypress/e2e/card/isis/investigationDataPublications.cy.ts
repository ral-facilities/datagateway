describe('ISIS - Study Data Publication Cards', () => {
  beforeEach(() => {
    cy.intercept(
      /\/datapublications\/count\?.*where=%7B%22type\.name%22%3A%7B%22eq%22%3A%22investigation%22%7D%7D.*/,
      (req) => {
        // delete type = investigation requirement
        const [url, search] = req.url.split('?');
        const params = new URLSearchParams(search);
        // params.delete with value is still a new standard, so use workaround for now until browser compat catches up
        // params.delete('where', '{"type.name":{"eq":"investigation"}}');
        const removeValue = (
          params: URLSearchParams,
          key: string,
          valueToRemove: string
        ): URLSearchParams => {
          const values = params.getAll(key);
          if (values.length) {
            params.delete(key);
            for (const value of values) {
              if (value !== valueToRemove) {
                params.append(key, value);
              }
            }
          }
          return params;
        };
        removeValue(params, 'where', '{"type.name":{"eq":"investigation"}}');
        req.url = `${url}?${params.toString()}`;

        // our count may have 1 extra at times, but it shouldn't matter too much...
        req.continue();
      }
    ).as('getDataPublicationsCount');
    cy.intercept(
      /\/datapublications\?.*where=%7B%22type\.name%22%3A%7B%22eq%22%3A%22investigation%22%7D%7D.*/,
      (req) => {
        // delete type = investigation requirement
        const [url, search] = req.url.split('?');
        const params = new URLSearchParams(search);
        // params.delete with value is still a new standard, so use workaround for now until browser compat catches up
        // params.delete('where', '{"type.name":{"eq":"investigation"}}');
        const removeValue = (
          params: URLSearchParams,
          key: string,
          valueToRemove: string
        ): URLSearchParams => {
          const values = params.getAll(key);
          if (values.length) {
            params.delete(key);
            for (const value of values) {
              if (value !== valueToRemove) {
                params.append(key, value);
              }
            }
          }
          return params;
        };
        removeValue(params, 'where', '{"type.name":{"eq":"investigation"}}');
        req.url = `${url}?${params.toString()}`;

        req.continue((res) => {
          // remove the "study" datapublication i.e. the one whose ID is in the URL
          const i = res.body.findIndex((dp) => dp.id === 57);
          if (i !== -1) res.body.splice(i, 1);
        });
      }
    ).as('getDataPublications');
    cy.login();
    cy.visit(
      '/browseDataPublications/instrument/13/dataPublication/57/investigation?view=card'
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
      .contains('Leg')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseDataPublications/instrument/13/dataPublication/57/investigation/56'
    );
  });

  it('should be able to sort by one field or multiple', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Publication Date')
      .as('dateSortButton')
      .click();

    // ascending
    cy.get('@dateSortButton').click();
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('Because');

    // descending
    cy.get('@dateSortButton').click();
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('[data-testid="card"]').first().contains('Leg');

    // no order
    cy.get('@dateSortButton').click();
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('Because');

    // multiple fields (shift click)
    cy.contains('[role="button"]', 'Title').click();
    cy.get('@dateSortButton').click({ shiftKey: true });

    cy.contains('[aria-label="Sort by TITLE"]', 'asc').should('exist');
    cy.contains('[aria-label="Sort by PUBLICATION DATE"]', 'asc').should(
      'exist'
    );
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('Because');

    // should replace current sort if clicked without shift
    cy.get('@dateSortButton').click();

    cy.contains('[aria-label="Sort by PUBLICATION DATE"]', 'desc').should(
      'exist'
    );
    cy.contains('[aria-label="Sort by TITLE"]', 'asc').should('not.exist');

    cy.get('[data-testid="card"]').first().contains('Leg');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[data-testid="advanced-filters-link"]').click();

    cy.get('[aria-label="Filter by DOI"]').first().type('0');
    cy.wait(['@getDataPublicationsCount', '@getDataPublications'], {
      timeout: 10000,
    });
    cy.get('[data-testid="card"]').first().contains('Leg');

    cy.get('[aria-label="Filter by Title"]').first().type('fin');
    cy.wait(['@getDataPublicationsCount', '@getDataPublications'], {
      timeout: 10000,
    });
    cy.get('[data-testid="card"]').first().contains('Because');
  });
});
