describe('ISIS - FacilityCycles Cards', () => {
  beforeEach(() => {
    cy.intercept('**/facilitycycles/count*').as('getFacilityCyclesCount');
    cy.intercept('**/facilitycycles?order*').as('getFacilityCyclesOrder');
    cy.login();
    cy.visit('/browse/instrument/4/facilityCycle?view=card').wait(
      ['@getFacilityCyclesCount', '@getFacilityCyclesOrder'],
      { timeout: 10000 }
    );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    //Default sort
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
  });

  it('should be able to click a facility cycle to see its investigations', () => {
    cy.get('[data-testid="card"]')
      .first()
      .contains('2004 cycle 3')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/4/facilityCycle/18/investigation'
    );
  });

  it('should be able to sort by one field or multiple', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Start Date').as('dateSortButton').click();
    cy.wait('@getFacilityCyclesOrder', { timeout: 10000 });

    // ascending
    cy.get('@dateSortButton').click();
    cy.wait('@getFacilityCyclesOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('2001 cycle 2');

    // descending
    cy.get('@dateSortButton').click();
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('[data-testid="card"]').first().contains('2004 cycle 3');

    // no order
    cy.get('@dateSortButton').click();
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('2001 cycle 2');

    // multiple fields (shift click)
    cy.get('@dateSortButton').click();
    cy.contains('[role="button"]', 'End Date').click({ shiftKey: true });
    cy.wait('@getFacilityCyclesOrder', { timeout: 10000 });

    cy.contains('[aria-label="Sort by START DATE"]', 'asc').should('exist');
    cy.contains('[aria-label="Sort by END DATE"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('2001 cycle 2');

    // should replace current sort if clicked without shift
    cy.get('@dateSortButton').click();

    cy.contains('[aria-label="Sort by START DATE"]', 'desc').should('exist');
    cy.contains('[aria-label="Sort by END DATE"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.get('[data-testid="card"]').first().contains('2004 cycle 3');
  });

  it('should be able to filter by multiple fields', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Start Date').as('dateSortButton').click();
    cy.wait('@getFacilityCyclesOrder', { timeout: 10000 });

    cy.get('[data-testid="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Name"]').first().type('3');
    cy.wait(['@getFacilityCyclesCount', '@getFacilityCyclesOrder'], {
      timeout: 10000,
    });
    cy.get('[data-testid="card"]').first().contains('2002 cycle 3');

    cy.get('input[id="Start Date filter from"]').type('2004-06-01');
    cy.wait(['@getFacilityCyclesCount'], { timeout: 10000 });
    cy.get('input[aria-label="Start Date filter to"]')
      .parent()
      .find('button')
      .click();
    cy.get('.MuiPickersDay-root[type="button"]').first().click();
    cy.wait(['@getFacilityCyclesCount'], { timeout: 10000 });
    const date = new Date();
    date.setDate(1);
    cy.get('input[id="Start Date filter to"]').should(
      'have.value',
      date.toISOString().slice(0, 10)
    );
    cy.get('[data-testid="card"]').first().contains('2004 cycle 3');
  });
});
