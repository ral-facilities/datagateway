describe('ISIS - Investigation Data Publication Table', () => {
  beforeEach(() => {
    cy.intercept('**/datapublications/count*').as('getDataPublicationsCount');
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
      '/browseDataPublications/instrument/13/dataPublication/57/investigation'
    ).wait(['@getDataPublicationsCount', '@getDataPublications'], {
      timeout: 10000,
    });
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    //Default sort
    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
  });

  it('should be able to click a data publication to see its landing page', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseDataPublications/instrument/13/dataPublication/57/investigation/56'
    );
  });

  it('should have the correct url for the DOI link', () => {
    cy.get('[data-testid="isis-datapublication-table-doi-link"]')
      .first()
      .then(($doi) => {
        const doi = $doi.text();

        const url = `https://doi.org/${doi}`;

        cy.get('[data-testid="isis-datapublication-table-doi-link"]')
          .first()
          .should('have.attr', 'href', url);
      });
  });

  // Not enough data in datapublications to load.
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  it('should be able to sort by all sort directions on single and multiple columns', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Publication Date')
      .as('dateSortButton')
      .click();

    // ascending order
    cy.contains('[role="button"]', 'Title').as('titleSortButton').click();

    cy.get('[aria-sort="ascending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
      'Because fine have business'
    );

    // descending order
    cy.get('@titleSortButton').click();

    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
      'not.have.css',
      'opacity',
      '0'
    );
    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
      'Leg can time eat'
    );

    // no order
    cy.get('@titleSortButton').click();

    cy.get('[aria-sort="ascending"]').should('not.exist');
    cy.get('[aria-sort="descending"]').should('not.exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.exist');

    cy.get('[data-testid="SortIcon"]').should('have.length', 3);
    cy.get('[data-testid="ArrowUpwardIcon"]').should('not.exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
      'Because fine have business'
    );

    // multiple columns (shift click)
    cy.get('@dateSortButton').click();
    cy.get('@dateSortButton').click({ shiftKey: true });
    cy.get('@titleSortButton').click({ shiftKey: true });

    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
      'Leg can time eat'
    );

    // should replace previous sort when clicked without shift
    cy.get('@dateSortButton').click();
    cy.get('[aria-sort="ascending"]').should('have.length', 1);
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('2014-12-02');
  });

  it('should change icons when sorting on a column', () => {
    // clear default sort
    cy.contains('[role="button"]', 'Publication Date').click();

    cy.get('[data-testid="SortIcon"]').should('have.length', 3);

    // check icon when clicking on a column
    cy.contains('[role="button"]', 'DOI').click();
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('exist');

    // check icon when clicking on a column again
    cy.contains('[role="button"]', 'DOI').click();
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.exist');

    // check icon when hovering over a column
    cy.contains('[role="button"]', 'Title').trigger('mouseover');
    cy.get('[data-testid="ArrowUpwardIcon"]').should('have.length', 1);
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);

    // check icons when shift is held
    cy.get('.App').trigger('keydown', { key: 'Shift' });
    cy.get('[data-testid="AddIcon"]').should('have.length', 1);
  });

  it('should be able to filter with both text & date filters on multiple columns', () => {
    // test date filter
    cy.get('input[id="Publication Date filter to"]').type('2016-01-01');

    cy.get('[aria-rowcount="1"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
      'Because fine have business'
    );

    cy.get('input[id="Publication Date filter from"]').type('2015-01-01');

    cy.get('[aria-rowcount="0"]').should('exist');

    cy.get('input[id="Publication Date filter from"]').type(
      '{ctrl}a{backspace}'
    );
    cy.get('input[id="Publication Date filter from"]').type('2014-01-01');

    cy.get('[aria-rowcount="1"]').should('exist');

    // test text filter
    cy.get('[aria-label="Filter by Title"]').first().type('xy');

    cy.get('[aria-rowcount="0"]').should('exist');
  });
});
