describe('ISIS - FacilityCycles Table', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/browse/instrument/4/facilityCycle');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    //Default sort
    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
  });

  it('should be able to click a facility cycle to see its investigations', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/4/facilityCycle/18/investigation'
    );
  });

  // Not enough data in facility cycles to load.
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  it('should be able to sort by all sort directions on single and multiple columns', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Start Date').click();

    // ascending order
    cy.contains('[role="button"]', 'Name').as('nameSortButton').click();

    cy.get('[aria-sort="ascending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
      '2001-04-02 00:00:00'
    );

    // descending order
    cy.get('@nameSortButton').click();

    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
      'not.have.css',
      'opacity',
      '0'
    );
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
      '2004-06-03 00:00:00'
    );

    // no order
    cy.get('@nameSortButton').click();

    cy.get('[aria-sort="ascending"]').should('not.exist');
    cy.get('[aria-sort="descending"]').should('not.exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.exist');

    cy.get('[data-testid="SortIcon"]').should('have.length', 3);
    cy.get('[data-testid="ArrowUpwardIcon"]').should('not.exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
      '2001-04-02 00:00:00'
    );

    // multiple columns (shift click)
    cy.contains('[role="button"]', 'Start Date').click();
    cy.get('@nameSortButton').click({ shiftKey: true });
    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains('2001 cycle 2');

    // should replace previous sort when clicked without shift
    cy.contains('[role="button"]', 'End Date').click();
    cy.contains('[role="button"]', 'End Date').click();
    cy.get('[aria-sort="descending"]').should('have.length', 1);
    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains('2004 cycle 3');
  });

  it('should change icons when sorting on a column', () => {
    // clear default sort
    cy.contains('[role="button"]', 'Start Date').click();

    cy.get('[data-testid="SortIcon"]').should('have.length', 3);

    // check icon when clicking on a column
    cy.contains('[role="button"]', 'Start Date').click();
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('exist');

    // check icon when clicking on a column again
    cy.contains('[role="button"]', 'Start Date').click();
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.exist');

    // check icon when hovering over a column
    cy.contains('[role="button"]', 'End Date').trigger('mouseover');
    cy.get('[data-testid="ArrowUpwardIcon"]').should('have.length', 1);
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);

    // check icons when shift is held
    cy.get('.App').trigger('keydown', { key: 'Shift' });
    cy.get('[data-testid="AddIcon"]').should('have.length', 1);
  });

  it('should be able to filter with both text & date filters on multiple columns', () => {
    cy.get('[aria-label="Filter by Name"]').first().type('3');

    cy.get('[aria-rowcount="2"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
      '2004-06-03 00:00:00'
    );

    cy.get('input[id="Start Date filter from"]').type('2004-06-01');

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

    cy.get('[aria-rowcount="1"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
      '2004-06-03 00:00:00'
    );
  });
});
