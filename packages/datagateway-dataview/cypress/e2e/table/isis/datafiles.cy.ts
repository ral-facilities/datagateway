describe('ISIS - Datafiles Table', () => {
  beforeEach(() => {
    cy.intercept('**/instruments/1').as('instrument');
    cy.intercept('**/facilitycycles/19').as('facilityCycle');
    cy.intercept('**/investigations/19').as('investigation');
    cy.intercept('**/datasets/79').as('dataset');
    cy.intercept('**/investigations**').as('idCheck');
    cy.intercept('**/datafiles/count?*').as('datafilesCount');
    cy.intercept('**/datafiles?order=*').as('datafilesOrder');
    cy.login();

    cy.visit(
      '/browse/instrument/1/facilityCycle/19/investigation/19/dataset/79/datafile'
    ).wait(
      [
        '@idCheck',
        '@instrument',
        '@facilityCycle',
        '@investigation',
        '@dataset',
        '@datafilesCount',
        '@datafilesOrder',
      ],
      {
        timeout: 10000,
      }
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
    cy.visit(
      '/browse/instrument/2/facilityCycle/14/investigation/88/dataset/118/datafile'
    );

    cy.contains('Oops!').should('be.visible');
    cy.get('[role="grid"]').should('not.exist');
  });

  // Unable to test lazy loading as there are only 15 files per dataset
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="55"]').should('exist');
  });

  it('should be able to sort by all sort directions on single and multiple columns', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Modified Time')
      .as('timeSortButton')
      .click();
    cy.wait('@datafilesOrder', { timeout: 10000 });

    // ascending order
    cy.contains('[role="button"]', 'Location').as('locationSortButton').click();
    cy.wait('@datafilesOrder', { timeout: 10000 });

    cy.get('[aria-sort="ascending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
      '/add/go/interview.png'
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
      '/writer/me/expert.gif'
    );

    // no order
    cy.get('@locationSortButton').click();
    cy.get('[aria-sort="ascending"]').should('not.exist');
    cy.get('[aria-sort="descending"]').should('not.exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.exist');

    cy.get('[data-testid="SortIcon"]').should('have.length', 4);
    cy.get('[data-testid="ArrowUpwardIcon"]').should('not.exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
      '/debate/form/growth.gif'
    );

    // multiple columns (shift click)
    cy.get('@timeSortButton').click();
    cy.wait('@datafilesOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'Name')
      .as('nameSortButton')
      .click({ shiftKey: true });
    cy.wait('@datafilesOrder', { timeout: 10000 });
    cy.get('@nameSortButton').click({ shiftKey: true });
    cy.wait('@datafilesOrder', { timeout: 10000 });

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Datafile 78');

    // should replace previous sort when clicked without shift
    cy.contains('[role="button"]', 'Location').click();
    cy.wait('@datafilesOrder', { timeout: 10000 });
    cy.get('[aria-sort="ascending"]').should('have.length', 1);
    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
      '/add/go/interview.png'
    );
  });

  it('should change icons when sorting on a column', () => {
    // clear default sort
    cy.contains('[role="button"]', 'Modified Time').click();

    cy.get('[data-testid="SortIcon"]').should('have.length', 4);

    // check icon when clicking on a column
    cy.contains('[role="button"]', 'Location').click();
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('exist');

    // check icon when clicking on a column again
    cy.contains('[role="button"]', 'Location').click();
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.exist');

    // check icon when hovering over a column
    cy.contains('[role="button"]', 'Name').trigger('mouseover');
    cy.get('[data-testid="ArrowUpwardIcon"]').should('have.length', 1);
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);

    // check icons when shift is held
    cy.get('.App').trigger('keydown', { key: 'Shift' });
    cy.get('[data-testid="AddIcon"]').should('have.length', 2);
  });

  it('should be able to filter with both text & date filters on multiple columns', () => {
    // test date filter
    cy.get('input[aria-label="Modified Time filter from"]').type('2018-08-12');
    const date = new Date();
    cy.get('input[aria-label="Modified Time filter to"]').type(
      date.toISOString().slice(0, 10)
    );

    cy.get('[aria-rowcount="15"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Datafile 1744');

    // test text filter
    cy.get('[aria-label="Filter by Location"]').first().type('action');

    cy.get('[aria-rowcount="1"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Datafile 1268');
  });

  it('should be able to view details', () => {
    cy.get('[aria-label="Show details"]').eq(1).click();

    cy.get('#details-panel').should('be.visible');
    cy.get('#details-panel').contains('Datafile 1625').should('be.visible');
    cy.get('[aria-label="Hide details"]').should('exist');

    cy.get('[aria-label="Show details"]').first().click();

    cy.get('#details-panel').contains('Datafile 1744').should('be.visible');
    cy.get('#details-panel').contains('Datafile 1625').should('not.exist');
    cy.get('[aria-label="Hide details"]').should('have.length', 1);

    cy.get('[aria-controls="datafile-details-panel"]').should('be.visible');

    cy.get('#details-panel')
      .contains('Doctor involve recently treat')
      .should('be.visible');

    cy.get('[aria-controls="datafile-parameters-panel"]').should('be.visible');
    cy.get('[aria-controls="datafile-parameters-panel"]').click();

    cy.get('#parameter-grid').should('be.visible');
    cy.get('#details-panel').contains('PARAMETERTYPE 11').should('be.visible');

    cy.get('[aria-label="Hide details"]').first().click();

    cy.get('#details-panel').should('not.exist');
    cy.get('[aria-label="Hide details"]').should('not.exist');
  });
});
