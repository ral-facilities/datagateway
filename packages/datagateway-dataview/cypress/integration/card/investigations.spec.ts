describe('Investigations Cards', () => {
  beforeEach(() => {
    Cypress.currentTest.retries(2);
    cy.server();
    cy.route('**/investigations/count*').as('getInvestigationsCount');
    cy.route('**/investigations?order*').as('getInvestigationsOrder');
    cy.login('user', 'password');
    cy.visit('/browse/investigation').wait(
      [
        '@getInvestigationsCount',
        '@getInvestigationsOrder',
        '@getInvestigationsOrder',
      ],
      { timeout: 10000 }
    );
    cy.get('[aria-label="secondary checkbox"]')
      .click()
      .wait(
        [
          '@getInvestigationsCount',
          '@getInvestigationsCount',
          '@getInvestigationsOrder',
        ],
        { timeout: 10000 }
      );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('#card')
      .contains('Including spend increase ability music skill former.')
      .click({ force: true });
    cy.location('pathname').should('eq', '/browse/investigation/1/dataset');
  });

  it('should be able to sort by one field', () => {
    cy.contains('[role="button"]', 'Title')
      .click()
      .wait(
        [
          '@getInvestigationsCount',
          '@getInvestigationsOrder',
          '@getInvestigationsOrder',
        ],
        { timeout: 10000 }
      );
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('A nothing almost arrive I.');

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait(
        [
          '@getInvestigationsCount',
          '@getInvestigationsOrder',
          '@getInvestigationsOrder',
        ],
        { timeout: 10000 }
      );
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('#card').contains('Whom anything affect consider left.');

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait(
        [
          '@getInvestigationsCount',
          '@getInvestigationsOrder',
          '@getInvestigationsOrder',
        ],
        { timeout: 10000 }
      );
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains(
      'Including spend increase ability music skill former.'
    );
  });

  it('should be able to sort by multiple fields', () => {
    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait(
        [
          '@getInvestigationsCount',
          '@getInvestigationsOrder',
          '@getInvestigationsOrder',
        ],
        { timeout: 10000 }
      );
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('Too ball particularly since true news like.');

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait(
        [
          '@getInvestigationsCount',
          '@getInvestigationsOrder',
          '@getInvestigationsOrder',
        ],
        { timeout: 10000 }
      );
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('Color knowledge economy return determine tell.');
  });

  it('should be able to filter by multiple fields', () => {
    cy.contains('[role="button"]', 'Type ID').click();
    cy.contains('[role="button"]', 'Type ID')
      .parent()
      .contains('[role="button"]', '1')
      .click()
      .wait(
        [
          '@getInvestigationsCount',
          '@getInvestigationsCount',
          '@getInvestigationsOrder',
          '@getInvestigationsOrder',
        ],
        { timeout: 10000 }
      );
    cy.contains('[role="button"]', 'Type ID - 1').should('exist');
    cy.get('#card').contains('Dog want single resource major.');

    cy.get('[aria-label="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Title"]')
      .find('input')
      .type('before')
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('Before can whom director ago education.');

    cy.get('[aria-label="Start Date date filter from"]')
      .type('2019-01-01')
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 10000,
      });
    cy.get('[aria-label="Start Date date filter to"]')
      .parent()
      .find('button')
      .click();
    cy.get('.MuiPickersDay-day[tabindex="0"]').first().click();
    cy.contains('OK')
      .click()
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 10000,
      });
    const date = new Date();
    date.setDate(1);
    cy.get('[aria-label="Start Date date filter to"]').should(
      'have.value',
      date.toISOString().slice(0, 10)
    );
    cy.get('#card').contains(
      'Themselves management within least body possible.'
    );
  });
});
