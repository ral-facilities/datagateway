describe('ISIS - Data Publication Table', () => {
  beforeEach(() => {
    cy.intercept('**/datapublications/count*').as('getDataPublicationsCount');
    cy.intercept('**/datapublications?order*').as('getDataPublicationsOrder');
    cy.login();
    cy.visit('/browseDataPublications/instrument/8/dataPublication').wait(
      ['@getDataPublicationsCount', '@getDataPublicationsOrder'],
      { timeout: 10000 }
    );
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
      '/browseDataPublications/instrument/8/dataPublication/51'
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
      'Article subject amount'
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
      'Daughter experience discussion'
    );

    // no order
    cy.get('@titleSortButton').click();

    cy.get('[aria-sort="ascending"]').should('not.exist');
    cy.get('[aria-sort="descending"]').should('not.exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.be.exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
      'have.css',
      'opacity',
      '0'
    );
    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
      'Article subject amount'
    );

    // multiple columns
    cy.get('@dateSortButton').click();
    cy.get('@dateSortButton').click();
    cy.get('@titleSortButton').click();

    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
      'Church child time Congress'
    );
  });

  it('should be able to filter with both text & date filters on multiple columns', () => {
    // test text filter
    cy.get('[aria-label="Filter by Title"]').first().type('ne');

    cy.get('[aria-rowcount="3"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
      'Church child time Congress'
    );

    // test date filter
    cy.get('input[id="Publication Date filter to"]').type('2016-01-01');

    cy.get('[aria-rowcount="2"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
      'Consider author watch'
    );

    cy.get('input[id="Publication Date filter from"]').type('2014-01-01');

    cy.get('[aria-rowcount="1"]').should('exist');
  });
});
