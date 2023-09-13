describe('DLS - Datafiles Table', () => {
  beforeEach(() => {
    cy.intercept('**/datafiles/count?*').as('datafilesCount');
    cy.intercept('**/datasets/61').as('datasets');
    cy.intercept('**/datafiles?order=*').as('datafilesOrder');
    cy.login();
    cy.visit(
      '/browse/proposal/INVESTIGATION%201/investigation/1/dataset/61/datafile'
    ).wait(['@datafilesCount', '@datasets', '@datafilesOrder'], {
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

  it('should not load incorrect URL', () => {
    cy.visit(
      '/browse/proposal/INVESTIGATION%201/investigation/2/dataset/25/datafile'
    );

    cy.contains('Oops!').should('be.visible');
    cy.get('[role="grid"]').should('not.exist');
  });

  // Lazy loading cannot be tested at the moment as there are only 15 files in this dataset
  it.skip('should be able to scroll down and load more rows', () => {
    // Will need to figure out a way to have this be mocked.
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="55"]').should('exist');
  });

  it('should be able to sort by all sort directions on single and multiple columns', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Create Time').as('timeSortButton').click();
    cy.wait('@datafilesOrder', { timeout: 10000 });

    // ascending order
    cy.contains('[role="button"]', 'Location').as('locationSortButton').click();
    cy.wait('@datafilesOrder', { timeout: 10000 });

    cy.get('[aria-sort="ascending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
      '/analysis/unit/bank.tiff'
    );

    // descending order
    cy.get('@locationSortButton').click();
    cy.wait('@datafilesOrder', { timeout: 10000 });

    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
      'not.have.css',
      'opacity',
      '0'
    );
    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
      '/to/total/according.tiff'
    );

    // no order
    cy.get('@locationSortButton').click();

    cy.get('[aria-sort="ascending"]').should('not.exist');
    cy.get('[aria-sort="descending"]').should('not.exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
      'have.css',
      'opacity',
      '0'
    );
    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
      '/time/run/drug.jpeg'
    );

    // multiple columns
    cy.get('@timeSortButton').click();
    cy.wait('@datafilesOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'Name').as('nameSortButton').click();
    cy.wait('@datafilesOrder', { timeout: 10000 });
    cy.get('@nameSortButton').click();
    cy.wait('@datafilesOrder', { timeout: 10000 });

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Datafile 60');
  });

  it('should be able to filter with both text & date filters on multiple columns', () => {
    // test text filter
    cy.get('input[aria-label="Filter by Location"]').type('unit');

    cy.get('[aria-rowcount="1"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Datafile 1369');

    // test date filter
    cy.get('input[aria-label="Create Time filter to"]').type('2019-01-01');

    cy.get('[aria-rowcount="0"]').should('exist');
  });

  it('should be able to view details', () => {
    cy.get('[aria-label="Show details"]').eq(1).click();

    cy.get('#details-panel').should('be.visible');
    cy.get('[aria-label="Hide details"]').should('exist');
    cy.get('#details-panel').contains('Datafile 1607').should('be.visible');

    cy.get('[aria-label="Show details"]').first().click();

    cy.get('#details-panel').contains('Datafile 1726').should('be.visible');
    cy.get('#details-panel').contains('Datafile 1607').should('not.exist');
    cy.get('[aria-label="Hide details"]').should('have.length', 1);

    cy.get('[aria-label="Hide details"]').first().click();

    cy.get('#details-panel').should('not.exist');
    cy.get('[aria-label="Hide details"]').should('not.exist');
  });
});
