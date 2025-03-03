describe('Investigations Table', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/browse/investigation');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });
    cy.location('pathname').should('eq', '/browse/investigation/1/dataset');
  });

  it('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="59"]').should('exist');
  });

  it('should have the correct url for the DOI link', () => {
    cy.get('[data-testid="investigation-table-doi-link"]')
      .first()
      .then(($doi) => {
        const doi = $doi.text();

        const url = `https://doi.org/${doi}`;

        cy.get('[data-testid="investigation-table-doi-link"]')
          .first()
          .should('have.attr', 'href', url);
      });
  });

  it('should be able to sort by all sort directions on single and multiple columns', () => {
    // ascending order
    cy.contains('[role="button"]', 'Title').as('titleSortButton').click();

    cy.get('[aria-sort="ascending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
      'A air avoid beautiful. Nature article your issue. Customer rather ' +
        'citizen bag boy late. Maybe big act produce challenge short.'
    );

    // descending order
    cy.get('@titleSortButton').click();

    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
      'not.have.css',
      'opacity',
      '0'
    );
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
      'Why news west bar sing tax. Drive up more near member article. Only ' +
        'remember free thousand interest. Ability ok upon condition ' +
        'ability. Hand statement despite probably song.'
    );

    // no order
    cy.get('@titleSortButton').click();

    cy.get('[aria-sort="ascending"]').should('not.exist');
    cy.get('[aria-sort="descending"]').should('not.exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.exist');

    cy.get('[data-testid="SortIcon"]').should('have.length', 8);
    cy.get('[data-testid="ArrowUpwardIcon"]').should('not.exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
      'Analysis reflect work or hour color maybe. Much team discussion message weight.'
    );

    // multiple columns (shift + click)
    cy.contains('[role="button"]', 'Start Date').click();
    cy.get('@titleSortButton').click({ shiftKey: true });
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
      'Analysis reflect work or hour color maybe. Much team discussion message weight.'
    );

    // should replace previous sort when clicked without shift
    cy.contains('[role="button"]', 'Visit').click();
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('have.length', 1);
    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains('1');
  });

  it('should change icons when sorting on a column', () => {
    cy.get('[data-testid="SortIcon"]').should('have.length', 8);

    // check icon when clicking on a column
    cy.contains('[role="button"]', 'Visit').click();
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('exist');

    // check icon when clicking on a column again
    cy.contains('[role="button"]', 'Visit').click();
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.exist');

    // check icon when hovering over a column
    cy.contains('[role="button"]', 'Title').trigger('mouseover');
    cy.get('[data-testid="ArrowUpwardIcon"]').should('have.length', 1);
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);

    // check icons when shift is held
    cy.get('.App').trigger('keydown', { key: 'Shift' });
    cy.get('[data-testid="AddIcon"]').should('have.length', 6);
  });

  it('should be able to filter with both text & date filters on multiple columns', () => {
    // test exclude text filter
    cy.get('input[aria-label="Filter by Name"]')
      .as('nameFilter')
      .parent()
      .find('[aria-label="include, exclude or exact"]')
      .as('nameFilterOptionsButton')
      .click();

    cy.get('#select-filter-type-exclude').click();

    cy.get('@nameFilter').type('INVESTIGATION 1');

    cy.get('[aria-rowcount="48"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains('87');

    // check that size is correct after filtering
    cy.get('[aria-rowindex="1"] [aria-colindex="7"]').contains('3.38 GB');

    // test exact text filter

    cy.get('@nameFilterOptionsButton').click();

    cy.get('#select-filter-type-exact').click();

    cy.get('[aria-rowcount="1"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains('70');

    // check that size is correct after filtering
    cy.get('[aria-rowindex="1"] [aria-colindex="7"]').contains('3.12 GB');

    // test include text filter
    cy.get('@nameFilterOptionsButton').click();

    cy.get('#select-filter-type-include').click();

    cy.get('[aria-rowcount="11"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains('70');

    // check that size is correct after filtering
    cy.get('[aria-rowindex="1"] [aria-colindex="7"]').contains('3.12 GB');

    // test date filter
    cy.get('input[id="Start Date filter from"]').type('2004-01-01');

    cy.get('input[aria-label="Start Date filter to"]')
      .parent()
      .find('button')
      .click();

    cy.get('.MuiPickersDay-root[type="button"]').first().click();

    const date = new Date();
    date.setDate(1);

    cy.get('input[id="Start Date filter to"]').should(
      'have.value',
      date.toISOString().slice(0, 10)
    );

    cy.get('[aria-rowcount="4"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains('96');
  });

  it('should be able to view details', () => {
    cy.get('[aria-label="Show details"]').first().click();

    cy.get('#details-panel').should('be.visible');
    cy.get('[aria-label="Hide details"]').should('exist');
    const firstDetailsPanelText =
      'Prove begin boy those always dream write inside.';

    cy.get('[aria-label="Show details"]').first().click();

    cy.get('#details-panel').scrollIntoView();
    cy.get('#details-panel')
      .contains('Strategy with piece reason late model air.')
      .should('be.visible');
    cy.get('#details-panel')
      .contains(firstDetailsPanelText)
      .should('not.exist');
    cy.get('[aria-label="Hide details"]').should('have.length', 1);

    cy.get('[aria-label="Hide details"]').first().click();

    cy.get('#details-panel').should('not.exist');
    cy.get('[aria-label="Hide details"]').should('not.exist');
  });
});
