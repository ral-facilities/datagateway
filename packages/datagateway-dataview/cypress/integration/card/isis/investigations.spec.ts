describe('ISIS - Investigations Cards', () => {
  beforeEach(() => {
    cy.intercept('**/investigations/count*').as('getInvestigationsCount');
    cy.intercept('**/investigations?order*').as('getInvestigationsOrder');
    cy.login('user', 'password');
    cy.visit('/browse/instrument/1/facilityCycle/14/investigation').wait(
      ['@getInvestigationsCount', '@getInvestigationsOrder'],
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
      .contains('Series toward yes cost analysis.')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/14/investigation/87/dataset'
    );
  });

  it('should be able to sort by one field', () => {
    cy.contains('[role="button"]', 'Title')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('Series toward yes cost analysis.');

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
    cy.get('#card').contains('Series toward yes cost analysis.');

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
    cy.get('#card').contains('Series toward yes cost analysis.');
  });

  it('should be able to sort by multiple fields', () => {
    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('Series toward yes cost analysis.');

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
    cy.get('#card').contains('Series toward yes cost analysis.');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[aria-label="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Title"]')
      .find('input')
      .first()
      .type('yes')
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('Series toward yes cost analysis.');

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

  it('should be able to expand "More Information"', () => {
    cy.get('#card').contains('More Information').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('INVESTIGATION 107');
    cy.get('#investigation-users-tab').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('Michelle228');
    cy.get('#investigation-samples-tab').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('SAMPLE 87');
    cy.get('#investigation-publications-tab').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('Follow team before this.');
  });
});
