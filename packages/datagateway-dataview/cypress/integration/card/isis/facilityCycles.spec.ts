describe('ISIS - FacilityCycles Cards', () => {
  beforeEach(() => {
    cy.intercept('**/facilitycycles/count*').as('getFacilityCyclesCount');
    cy.intercept('**/facilitycycles?order*').as('getFacilityCyclesOrder');
    cy.intercept('instruments/1').as('instrument');
    cy.login();
    cy.visit('/browse/instrument/1/facilityCycle?view=card').wait(
      ['@instrument', '@getFacilityCyclesCount', '@getFacilityCyclesOrder'],
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

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('[data-testid="card"]')
      .first()
      .contains('2019 cycle 4')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/79/investigation'
    );
  });

  describe('should be able to sort by', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Start Date')
        .click()
        .wait('@getFacilityCyclesOrder', { timeout: 10000 });
    });
    // Note that Name and Description currently fail to sort
    it('one field', () => {
      cy.contains('[role="button"]', 'Start Date')
        .click()
        .wait('@getFacilityCyclesOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'asc').should('exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('[data-testid="card"]').first().contains('2000 cycle 2');

      cy.contains('[role="button"]', 'Start Date').click();
      cy.contains('[role="button"]', 'asc').should('not.exist');
      cy.contains('[role="button"]', 'desc').should('exist');
      cy.get('[data-testid="card"]').first().contains('2019 cycle ');

      cy.contains('[role="button"]', 'Start Date').click();
      cy.contains('[role="button"]', 'asc').should('not.exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('[data-testid="card"]').first().contains('2000 cycle 2');
    });

    it('multiple fields', () => {
      cy.contains('[role="button"]', 'Start Date')
        .click()
        .wait('@getFacilityCyclesOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'asc').should('exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('[data-testid="card"]').first().contains('2000 cycle 2');

      cy.contains('[role="button"]', 'End Date')
        .click()
        .wait('@getFacilityCyclesOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'asc').should('exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('[data-testid="card"]').first().contains('2000 cycle 2');
    });
  });

  describe('should be able to filter by', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Start Date')
        .click()
        .wait('@getFacilityCyclesOrder', { timeout: 10000 });
    });

    it('multiple fields', () => {
      cy.get('[data-testid="advanced-filters-link"]').click();
      cy.get('[aria-label="Filter by Name"]')
        .first()
        .type('4')
        .wait(['@getFacilityCyclesCount', '@getFacilityCyclesOrder'], {
          timeout: 10000,
        });
      cy.get('[data-testid="card"]').first().contains('2004 cycle 1');

      cy.get('input[id="Start Date filter from"]')
        .type('2019-01-01')
        .wait(['@getFacilityCyclesCount'], { timeout: 10000 });
      cy.get('button[aria-label="Start Date filter to, date picker"]')
        .parent()
        .find('button')
        .click();
      cy.get('.MuiPickersDay-day[tabindex="0"]').first().click();
      cy.contains('OK')
        .click()
        .wait(['@getFacilityCyclesCount'], { timeout: 10000 });
      const date = new Date();
      date.setDate(1);
      cy.get('input[id="Start Date filter to"]').should(
        'have.value',
        date.toISOString().slice(0, 10)
      );
      cy.get('[data-testid="card"]').first().contains('2019 cycle 4');
    });
  });
});
