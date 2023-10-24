describe('ISIS - Datasets Table', () => {
  beforeEach(() => {
    cy.intercept('**/datasets/count?*').as('datasetsCount');
    cy.intercept('**/datasets?order=*').as('datasetsOrder');
    cy.login();
    cy.visit(
      '/browse/instrument/1/facilityCycle/19/investigation/19/dataset'
    ).wait(['@datasetsCount', '@datasetsOrder'], {
      timeout: 10000,
    });
    // Check that we have received the size from the API as this will produce
    // a re-render which can prevent some interactions.
    cy.contains('[aria-rowindex="1"] [aria-colindex="4"]', '1.36 GB').should(
      'exist'
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
    cy.visit('/browse/instrument/2/facilityCycle/15/investigation/87/dataset');

    cy.contains('Oops!').should('be.visible');
    cy.get('[role="grid"]').should('not.exist');
  });

  it('should be able to click a dataset to see its landing page', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });

    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/19/investigation/19/dataset/79'
    );
  });

  // Current example data only has 2 datasets in the investigation,
  // so cannot test lazy loading.
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  it('should be able to sort by all sort directions on single and multiple columns', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Create Time').as('timeSortButton').click();
    cy.wait('@datasetsOrder', { timeout: 10000 });

    // ascending order
    cy.contains('[role="button"]', 'Name').as('nameSortButton').click();
    cy.wait('@datasetsOrder', { timeout: 10000 });

    cy.get('[aria-sort="ascending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 19');

    // descending order
    cy.get('@nameSortButton').click();
    cy.wait('@datasetsOrder', { timeout: 10000 });

    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
      'not.have.css',
      'opacity',
      '0'
    );
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 79');

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
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 19');

    // multiple columns
    cy.get('@timeSortButton').click();
    cy.wait('@datasetsOrder', { timeout: 10000 });
    cy.get('@nameSortButton').click();
    cy.wait('@datasetsOrder', { timeout: 10000 });

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 19');
  });

  it('should be able to filter with both text & date filters on multiple columns', () => {
    // test text filter
    cy.get('[aria-label="Filter by Name"]').first().type('79');

    cy.get('[aria-rowcount="1"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 79');
    // check that size is correct after filtering
    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains('1.36 GB');

    // test date filter
    cy.get('input[id="Create Time filter from"]').type('2005-06-12');

    cy.get('[aria-rowcount="1"]').should('exist');

    cy.get('input[aria-label="Create Time filter to"]')
      .parent()
      .find('button')
      .click();

    const date = new Date();
    date.setDate(1);
    date.setMonth(5);
    date.setFullYear(2020);

    cy.get('.MuiPickersCalendarHeader-label').click();
    cy.contains('2020').click();
    cy.contains('Jan').click();
    cy.get('.MuiPickersDay-root[type="button"]').first().click();

    cy.get('[aria-rowcount="0"]').should('exist');
  });

  describe('should be able to view details', () => {
    it('and all the details are correct & also able to hide the panel', () => {
      cy.get('[aria-label="Show details"]').eq(1).click();

      cy.get('#details-panel').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
      cy.get('#details-panel').contains('DATASET 19').should('be.visible');

      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').contains('DATASET 79').should('be.visible');
      cy.get('#details-panel').contains('DATASET 19').should('not.exist');
      cy.get('[aria-label="Hide details"]').should('have.length', 1);

      cy.get('#details-panel')
        .contains(
          'Example early fight chance culture fill either collection. Someone similar space few should lawyer various quite. Page discuss so music worker lawyer'
        )
        .should('be.visible');

      cy.get('[aria-controls="dataset-type-panel"]').should('be.visible');
      cy.get('[aria-controls="dataset-type-panel"]').click();

      cy.get('#details-panel')
        .contains(
          'Stop prove field onto think suffer measure. Table lose season identify professor happen third simply.'
        )
        .should('be.visible');

      cy.get('[aria-label="Hide details"]').first().click();

      cy.get('#details-panel').should('not.exist');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });

    it('and view datafiles', () => {
      cy.get('[aria-label="Show details"]').first().click();
      cy.get('#dataset-datafiles-tab').click({ force: true });

      cy.location('pathname').should(
        'eq',
        '/browse/instrument/1/facilityCycle/19/investigation/19/dataset/79/datafile'
      );
    });
  });
});
