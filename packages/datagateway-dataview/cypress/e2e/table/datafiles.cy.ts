describe('Datafiles Table', () => {
  beforeEach(() => {
    cy.intercept('**/investigations/1').as('investigations');
    cy.intercept('**/datasets/1').as('datasets');
    cy.intercept('**/datafiles/count?*').as('datafilesCount');
    cy.intercept('**/datafiles?order=*').as('datafilesOrder');
    cy.login();
    cy.visit('/browse/investigation/1/dataset/1/datafile');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should not load incorrect URL', () => {
    cy.visit('/browse/investigation/2/dataset/1/datafile');

    cy.contains('Oops!').should('be.visible');
    cy.get('[role="grid"]').should('not.exist');
  });

  // Unable to test lazy loading as there are only 15 datafiles in
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="55"]').should('exist');
  });

  it('should be able to sort by all sort directions on single and multiple columns', () => {
    cy.wait(
      [
        '@investigations',
        '@datafilesCount',
        '@datasets',
        '@datafilesOrder',
        '@datafilesOrder',
      ],
      {
        timeout: 10000,
      }
    );

    // ascending
    cy.contains('[role="button"]', 'Location').as('locationSortButton').click();
    cy.wait('@datafilesOrder', { timeout: 10000 });

    cy.get('[aria-sort="ascending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
      '/able/leg/policy.gif'
    );

    // descending
    cy.get('@locationSortButton').click();
    cy.wait('@datafilesOrder', { timeout: 10000 });

    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
      'not.have.css',
      'opacity',
      '0'
    );
    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
      '/writer/family/pull.bmp'
    );

    // no order
    cy.get('@locationSortButton').click();

    cy.get('[aria-sort="ascending"]').should('not.exist');
    cy.get('[aria-sort="descending"]').should('not.exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.exist');

    cy.get('[data-testid="SortIcon"]').should('have.length', 4);
    cy.get('[data-testid="ArrowUpwardIcon"]').should('not.exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
      '/five/with/question.bmp'
    );

    // multiple columns (shift click)
    cy.contains('[role="button"]', 'Name').click();
    cy.wait('@datafilesOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'Modified Time').click({ shiftKey: true });
    cy.wait('@datafilesOrder', { timeout: 10000 });

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Datafile 1071');

    // should replace previous sort when clicked without shift
    cy.contains('[role="button"]', 'Location').click();
    cy.get('[aria-sort="ascending"]').should('have.length', 1);
    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
      '/able/leg/policy.gif'
    );
  });

  it('should change icons when sorting on a column', () => {
    cy.wait(
      [
        '@investigations',
        '@datafilesCount',
        '@datasets',
        '@datafilesOrder',
        '@datafilesOrder',
      ],
      {
        timeout: 10000,
      }
    );

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
    cy.wait(
      [
        '@investigations',
        '@datafilesCount',
        '@datasets',
        '@datafilesOrder',
        '@datafilesOrder',
      ],
      {
        timeout: 10000,
      }
    );
    // test text filter
    cy.get('[aria-label="Filter by Location"]').first().type('candidate');

    cy.get('[aria-rowcount="1"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Datafile 1071');

    // test date filter
    cy.get('input[id="Modified Time filter from"]').type('2019-01-01');

    cy.get('[aria-rowcount="1"]').should('exist');

    cy.get('input[aria-label="Modified Time filter to"]')
      .parent()
      .find('button')
      .click();
    const date = new Date();
    date.setDate(1);
    date.setMonth(0);
    date.setFullYear(2020);

    cy.get('.MuiPickersCalendarHeader-label').click();
    cy.contains('2020').click();
    cy.contains('Jan').click();
    cy.get('.MuiPickersDay-root[type="button"]').first().click();

    cy.get('input[id="Modified Time filter to"]').should(
      'have.value',
      date.toISOString().slice(0, 10)
    );

    cy.get('[aria-rowcount="0"]').should('exist');
  });

  it('should be able to view details', () => {
    cy.get('[aria-label="Show details"]').eq(1).click();

    cy.get('#details-panel').should('be.visible');
    cy.get('#details-panel').contains('Datafile 238').should('be.visible');
    cy.get('[aria-label="Hide details"]').should('exist');

    cy.get('[aria-label="Show details"]').first().click();

    cy.get('#details-panel').contains('Datafile 119').should('be.visible');
    cy.get('#details-panel').contains('Datafile 238').should('not.exist');
    cy.get('[aria-label="Hide details"]').should('have.length', 1);

    cy.get('[aria-label="Hide details"]').first().click();

    cy.get('#details-panel').should('not.exist');
    cy.get('[aria-label="Hide details"]').should('not.exist');
  });
});
