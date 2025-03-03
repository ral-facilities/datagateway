describe('Datasets Table', () => {
  beforeEach(() => {
    cy.intercept('**/datasets/count?*').as('datasetsCount');
    cy.intercept('**/datasets?order=*').as('datasetsOrder');
    cy.login();
    cy.visit('/browse/investigation/1/dataset').wait(
      ['@datasetsCount', '@datasetsOrder'],
      {
        timeout: 10000,
      }
    );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click a dataset to see its datafiles', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/investigation/1/dataset/1/datafile'
    );
  });

  // current example data only has 2 datasets per investigation, so can't test lazy loading
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  it('should be able to sort by all sort directions on single and multiple columns', () => {
    // ascending order
    cy.contains('[role="button"]', 'Name').as('nameSortButton').click();

    cy.get('[aria-sort="ascending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 1');

    // descending order
    cy.get('@nameSortButton').click();

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

    cy.get('[data-testid="SortIcon"]').should('have.length', 4);
    cy.get('[data-testid="ArrowUpwardIcon"]').should('not.exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 1');

    // multiple columns (shift + click)
    cy.contains('[role="button"]', 'Create Time').as('timeSortButton').click();
    cy.get('@timeSortButton').click({ shiftKey: true });
    cy.get('@nameSortButton').click({ shiftKey: true });
    cy.get('@nameSortButton').click({ shiftKey: true });

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 61');

    // should replace previous sort when clicked without shift
    cy.contains('[role="button"]', 'Modified Time').click();
    cy.contains('[role="button"]', 'Modified Time').click();
    cy.get('[aria-sort="descending"]').should('have.length', 1);
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 61');
  });

  it('should change icons when sorting on a column', () => {
    cy.get('[data-testid="SortIcon"]').should('have.length', 4);

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
    cy.get('[data-testid="AddIcon"]').should('have.length', 2);
  });

  it('should be able to filter with both text & date filters on multiple columns', () => {
    // test text filter
    cy.get('[aria-label="Filter by Name"]').first().type('6');

    cy.get('[aria-rowcount="1"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 61');

    // test date filter
    cy.get('input[id="Create Time filter from"]').type('2006-01-01');

    cy.get('[aria-rowcount="1"]').should('exist');

    cy.get('input[aria-label="Create Time filter to"]')
      .parent()
      .find('button')
      .click();

    const date = new Date();
    date.setDate(1);
    date.setMonth(0);
    date.setFullYear(2020);

    cy.get('.MuiPickersCalendarHeader-label').click();
    cy.contains('2020').click();
    cy.get('.MuiPickersMonth-monthButton[type="button"]').first().click();
    cy.get('.MuiPickersDay-root[type="button"]').first().click();

    cy.get('input[id="Create Time filter to"]').should(
      'have.value',
      date.toISOString().slice(0, 10)
    );

    cy.get('[aria-rowcount="0"]').should('exist');
  });

  it('should be able to view details', () => {
    cy.get('[aria-label="Show details"]').eq(1).click();

    cy.get('#details-panel').should('be.visible');
    cy.get('#details-panel').contains('DATASET 61').should('be.visible');
    cy.get('[aria-label="Hide details"]').should('exist');

    cy.get('[aria-label="Show details"]').first().click();

    cy.get('#details-panel').contains('DATASET 1').should('be.visible');
    cy.get('#details-panel').contains('DATASET 61').should('not.exist');
    cy.get('[aria-label="Hide details"]').should('have.length', 1);

    cy.get('[aria-label="Hide details"]').first().click();

    cy.get('#details-panel').should('not.exist');
    cy.get('[aria-label="Hide details"]').should('not.exist');
  });
});
