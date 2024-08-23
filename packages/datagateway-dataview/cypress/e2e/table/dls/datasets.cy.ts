describe('DLS - Datasets Table', () => {
  beforeEach(() => {
    cy.intercept('**/investigations/1').as('investigations');
    cy.intercept('**/datasets/count?*').as('datasetsCount');
    cy.intercept('**/datasets?*').as('datasets');
    cy.login();
    cy.visit('/browse/proposal/INVESTIGATION%201/investigation/1/dataset').wait(
      [
        '@investigations',
        '@investigations',
        '@datasetsCount',
        '@datasets',
        '@datasets',
      ],
      { timeout: 10000 }
    );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    //Default sort
    cy.get('[aria-sort="ascending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
  });

  it('should not load incorrect URL', () => {
    cy.visit('/browse/proposal/INVESTIGATION%202/investigation/1/dataset');

    cy.contains('Oops!').should('be.visible');
    cy.get('[role="grid"]').should('not.exist');
  });

  it('should be able to click a dataset to see its datafiles', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });

    cy.location('pathname').should(
      'eq',
      '/browse/proposal/INVESTIGATION%201/investigation/1/dataset/1/datafile'
    );
  });

  // Lazy loading can't be tested at the moment since there are only 2 datasets in this investigation.
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  it('should be able to sort by all sort directions on single and multiple columns', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Create Time').as('timeSortButton').click();

    // ascending order
    cy.contains('[role="button"]', 'Name').as('nameSortButton').click();
    cy.wait('@datasets', { timeout: 10000 });

    cy.get('[aria-sort="ascending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 1');

    // descending order
    cy.get('@nameSortButton').click();
    cy.wait('@datasets', { timeout: 10000 });

    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
      'not.have.css',
      'opacity',
      '0'
    );
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 61');

    // no order
    cy.get('@nameSortButton').click();
    cy.get('[aria-sort="ascending"]').should('not.exist');
    cy.get('[aria-sort="descending"]').should('not.exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.exist');

    cy.get('[data-testid="SortIcon"]').should('have.length', 5);
    cy.get('[data-testid="ArrowUpwardIcon"]').should('not.exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 1');

    // multiple columns (shift click)
    cy.get('@timeSortButton').click();
    cy.wait('@datasets', { timeout: 10000 });
    cy.get('@nameSortButton').click({ shiftKey: true });
    cy.wait('@datasets', { timeout: 10000 });
    cy.get('@nameSortButton').click({ shiftKey: true });
    cy.wait('@datasets', { timeout: 10000 });

    cy.get('[aria-rowcount="2"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 1');

    // should replace previous sort when clicked without shift
    cy.contains('[role="button"]', 'Modified Time').click();
    cy.contains('[role="button"]', 'Modified Time').click();
    cy.get('[aria-sort="descending"]').should('have.length', 1);
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 61');
  });

  it('should change icons when sorting on a column', () => {
    cy.contains('[role="button"]', 'Create Time').click();
    cy.contains('[role="button"]', 'Create Time').click();
    cy.contains('[role="button"]', 'Create Time').click();

    cy.get('[data-testid="SortIcon"]').should('have.length', 5);

    // check icon when clicking on a column
    cy.contains('[role="button"]', 'Create Time').click();
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('exist');

    // check icon when clicking on a column again
    cy.contains('[role="button"]', 'Create Time').click();
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.exist');

    // check icon when hovering over a column
    cy.contains('[role="button"]', 'Modified Time').trigger('mouseover');
    cy.get('[data-testid="ArrowUpwardIcon"]').should('have.length', 1);
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);

    // check icons when shift is held
    cy.get('.App').trigger('keydown', { key: 'Shift' });
    cy.get('[data-testid="AddIcon"]').should('have.length', 3);
  });

  it('should be able to filter with both text & date filters on multiple columns', () => {
    // test text filter
    cy.get('[aria-label="Filter by Name"]').first().type('61');

    cy.get('[aria-rowcount="1"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 61');

    // test date filter
    cy.get('input[aria-label="Create Time filter to"]').type('2002-01-01');
    cy.get('[aria-rowcount="0"]').should('exist');
  });

  describe('should be able to view details', () => {
    it('and all the details are correct & also able to hide the panel', () => {
      cy.get('[aria-label="Show details"]').eq(1).click();

      cy.get('#details-panel').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
      cy.get('#details-panel').contains('DATASET 61').should('be.visible');

      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').contains('DATASET 1').should('be.visible');
      cy.get('#details-panel').contains('DATASET 61').should('not.exist');
      cy.get('[aria-label="Hide details"]').should('have.length', 1);

      cy.get('#details-panel')
        .contains('Suggest shake effort many last prepare small')
        .should('be.visible');

      cy.get('[aria-controls="dataset-type-panel"]').click();
      cy.get('#dataset-type-panel').should('not.have.attr', 'hidden');
      cy.get('#details-panel').contains('DATASETTYPE 2');

      cy.get('[aria-label="Hide details"]').first().click();

      cy.get('#details-panel').should('not.exist');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });
});