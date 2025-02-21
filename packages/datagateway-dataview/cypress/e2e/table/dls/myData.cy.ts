describe('DLS - MyData Table', () => {
  it('Should redirect when logged in anonymously', () => {
    cy.login();
    cy.visit('/my-data/DLS');
    cy.url().should('include', '/login');
  });

  describe('Logged in tests', () => {
    beforeEach(() => {
      cy.intercept('**/investigations/count').as('getInvestigationCount');
      cy.intercept('**/investigations?*').as('getInvestigations');
      cy.login(
        {
          username: 'root',
          password: 'pw',
          mechanism: 'simple',
        },
        'Chris481'
      );
      cy.visit('/my-data/DLS').wait('@getInvestigations');
    });

    it('should load correctly', () => {
      cy.title().should('equal', 'DataGateway DataView');
      cy.get('#datagateway-dataview').should('be.visible');

      //Default sort
      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');

      // default filter
      cy.get('input[id="Start Date filter to"]').should(
        'have.value',
        new Date().toISOString().split('T')[0]
      );
    });

    it('should be able to click an investigation to see its datasets', () => {
      cy.get('[role="gridcell"] a').first().click({ force: true });

      cy.location('pathname').should(
        'eq',
        '/browse/proposal/INVESTIGATION%2021/investigation/21/dataset'
      );
    });

    it('should be able to sort by all sort directions on single and multiple columns', () => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Start Date').click();

      // ascending order
      cy.contains('[role="button"]', 'Title').as('titleSortButton').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Across prepare why go.'
      );

      // descending order
      cy.get('@titleSortButton').click();

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Star enter wide nearly off.'
      );

      // no order
      cy.get('@titleSortButton').click();
      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.exist');

      cy.get('[data-testid="SortIcon"]').should('have.length', 6);

      cy.get('[data-testid="ArrowUpwardIcon"]').should('not.exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Star enter wide nearly off.'
      );

      // multiple columns (shift + click)
      cy.get('@titleSortButton').click();
      cy.contains('[role="button"]', 'Instrument').click({ shiftKey: true });

      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Across prepare why go.'
      );

      // should replace previous sort when clicked without shift
      cy.contains('[role="button"]', 'Visit').click();
      cy.get('[aria-sort="ascending"]').should('have.length', 1);
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('72');
    });

    it('should change icons when sorting on a column', () => {
      // clear default sort
      cy.contains('[role="button"]', 'Start Date').click();

      cy.get('[data-testid="SortIcon"]').should('have.length', 6);

      // check icon when clicking on a column
      cy.contains('[role="button"]', 'Instrument').click();
      cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('exist');

      // check icon when clicking on a column again
      cy.contains('[role="button"]', 'Instrument').click();
      cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.exist');

      // check icon when hovering over a column
      cy.contains('[role="button"]', 'Visit').trigger('mouseover');
      cy.get('[data-testid="ArrowUpwardIcon"]').should('have.length', 1);
      cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);

      // check icons when shift is held
      cy.get('.App').trigger('keydown', { key: 'Shift' });
      cy.get('[data-testid="AddIcon"]').should('have.length', 4);
    });

    it('should be able to filter with role, text & date filters on multiple columns', () => {
      // role
      cy.get('[aria-rowcount="2"]').should('exist');

      cy.get('#role-selector').click();
      cy.get('[role="listbox"]')
        .find('[role="option"]')
        .should('have.length', 3);
      cy.get('[role="option"][data-value="PI"]').click();

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('72');

      cy.get('#role-selector').click();
      cy.get('[role="option"]').first().click();
      cy.get('[aria-rowcount="2"]').should('exist');

      // test text filter
      cy.get('[aria-rowcount="2"]').should('exist');
      cy.get('input[id="Title-filter"]').type('star');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('72');

      // test date filter
      cy.get('input[id="Start Date filter from"]').type('2004-01-01');

      cy.get('[aria-rowcount="0"]').should('exist');
    });

    it('should be able to view details', () => {
      cy.get('[aria-label="Show details"]').eq(1).click();

      cy.get('#details-panel').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
      cy.get('#details-panel')
        .contains('Star enter wide nearly off.')
        .should('be.visible');

      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel')
        .contains('Across prepare why go.')
        .should('be.visible');
      cy.get('#details-panel')
        .contains('Star enter wide nearly off.')
        .should('not.exist');
      cy.get('[aria-label="Hide details"]').should('have.length', 1);

      cy.get('[aria-controls="visit-samples-panel"]').click();
      cy.get('#visit-samples-panel').should('not.have.attr', 'hidden');
      cy.get('#details-panel').contains('SAMPLE 21').should('be.visible');

      cy.get('[aria-controls="visit-users-panel"]').click();
      cy.get('#visit-users-panel').should('not.have.attr', 'hidden');
      cy.get('#details-panel').contains('Thomas Chambers').should('be.visible');

      cy.get('[aria-controls="visit-publications-panel"]').click();
      cy.get('#visit-publications-panel').should('not.have.attr', 'hidden');
      cy.get('#details-panel').contains(
        'From central effort glass evidence life.'
      );

      cy.get('[aria-label="Hide details"]').first().click();

      cy.get('#details-panel').should('not.exist');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });
});
