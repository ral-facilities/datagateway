describe('DLS - Datasets Table', () => {
  beforeEach(() => {
    cy.intercept('**/investigations/1').as('investigations');
    cy.intercept('**/investigations/findone?*').as('investigationsFindOne');
    cy.intercept('**/datasets/count?*').as('datasetsCount');
    cy.intercept('**/datasets?*').as('datasets');
    cy.login();
    cy.visit('/browse/proposal/INVESTIGATION%201/investigation/1/dataset').wait(
      [
        '@investigations',
        '@investigations',
        '@investigationsFindOne',
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
    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
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
      '/browse/proposal/INVESTIGATION%201/investigation/1/dataset/61/datafile'
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
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
      'have.css',
      'opacity',
      '0'
    );
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 1');

    // multiple columns
    cy.get('@timeSortButton').click();
    cy.wait('@datasets', { timeout: 10000 });
    cy.get('@nameSortButton').click();
    cy.wait('@datasets', { timeout: 10000 });
    cy.get('@nameSortButton').click();
    cy.wait('@datasets', { timeout: 10000 });

    cy.get('[aria-rowcount="2"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 1');
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
    it('and can calculate size, all the details are correct & also able to hide the panel', () => {
      // need to wait for counts to finish, otherwise cypress might interact with the details panel
      // too quickly and it rerenders during the test
      cy.contains('[aria-rowindex="1"] [aria-colindex="4"]', '15').should(
        'exist'
      );
      cy.contains('[aria-rowindex="2"] [aria-colindex="4"]', '15').should(
        'exist'
      );

      cy.get('[aria-label="Show details"]').eq(1).click();

      cy.get('#details-panel').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
      cy.get('#details-panel').contains('DATASET 1').should('be.visible');

      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').contains('DATASET 61').should('be.visible');
      cy.get('#details-panel').contains('DATASET 1').should('not.exist');
      cy.get('[aria-label="Hide details"]').should('have.length', 1);

      cy.get('#details-panel')
        .contains('Home down your nice amount successful')
        .should('be.visible');

      cy.contains('#calculate-size-btn', 'Calculate').should('exist').click();
      cy.contains('1.73 GB', { timeout: 10000 }).should('be.visible');

      cy.get('[aria-controls="dataset-type-panel"]').click();
      cy.get('#dataset-type-panel').should('not.have.attr', 'hidden');
      cy.get('#details-panel').contains('DATASETTYPE 3');

      cy.get('[aria-label="Hide details"]').first().click();

      cy.get('#details-panel').should('not.exist');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });

    it('and then calculate file size when the value is 0 ', () => {
      cy.intercept('**/getSize?*', '0');

      // need to wait for counts to finish, otherwise cypress might interact with the details panel
      // too quickly and it rerenders during the test
      cy.contains('[aria-rowindex="1"] [aria-colindex="4"]', '15').should(
        'exist'
      );
      cy.contains('[aria-rowindex="2"] [aria-colindex="4"]', '15').should(
        'exist'
      );

      cy.get('[aria-label="Show details"]').first().click();

      cy.contains('#calculate-size-btn', 'Calculate').should('exist').click();

      cy.contains('0 B', { timeout: 10000 }).should('be.visible');
    });
  });
});
