describe('DLS - Visits Cards', () => {
  // TODO: Check requests
  beforeEach(() => {
    cy.intercept('**/investigations/count*').as('getInvestigationsCount');
    cy.intercept('**/investigations?order*').as('getInvestigationsOrder');
    cy.login();
    cy.visit('/browse/proposal/INVESTIGATION%201/investigation/').wait(
      ['@getInvestigationsCount', '@getInvestigationsOrder'],
      { timeout: 10000 }
    );
    cy.get('[aria-label="page-view"]')
      .click()
      .wait(['@getInvestigationsOrder'], {
        timeout: 10000,
      });
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('#card').contains('42').click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/proposal/INVESTIGATION%201/investigation/1/dataset'
    );
  });

  // TODO: Check requests
  it('should be able to sort by one field', () => {
    cy.contains('[role="button"]', 'Visit ID')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('42');

    cy.contains('[role="button"]', 'Visit ID')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('#card').contains('42');

    cy.contains('[role="button"]', 'Visit ID').click();
    // .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('42');
  });

  it('should be able to sort by multiple fields', () => {
    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('42');

    cy.contains('[role="button"]', 'Visit ID')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('42');
  });

  it('should be able to filter by multiple fields', () => {
    cy.contains('[role="button"]', 'Type ID').click();
    cy.contains('[role="button"]', 'Type ID')
      .parent()
      .contains('[role="button"]', '2')
      .click()
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'Type ID - 2').should('exist');
    cy.get('#card').contains('42');

    cy.get('[aria-label="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Visit ID"]')
      .find('input')
      .first()
      .type('4')
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('42');

    cy.get('[aria-label="Start Date date filter from"]')
      .type('2019-01-01')
      .wait(['@getInvestigationsCount'], { timeout: 10000 });
    cy.get('[aria-label="Start Date date filter to"]')
      .parent()
      .find('button')
      .click();
    cy.get('.MuiPickersDay-day[tabindex="0"]').first().click();
    cy.contains('OK')
      .click()
      .wait(['@getInvestigationsCount'], { timeout: 10000 });
    const date = new Date();
    date.setDate(1);
    cy.get('[aria-label="Start Date date filter to"]').should(
      'have.value',
      date.toISOString().slice(0, 10)
    );
    cy.get('#card').should('not.exist');
  });

  // TODO: Data mismatch issue (#782)
  it.skip('should be able to expand "More Information"', () => {
    cy.get('#card').contains('More Information').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('INVESTIGATION 1');
    cy.get('#calculate-size-btn').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('10.8 GB', { timeout: 10000 });
    cy.get('#visit-users-tab').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('Andrea Clayton');
    cy.get('#visit-samples-tab').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('SAMPLE 1');
    cy.get('#visit-publications-tab').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('Eat interest seem black easy various.');
  });
});
