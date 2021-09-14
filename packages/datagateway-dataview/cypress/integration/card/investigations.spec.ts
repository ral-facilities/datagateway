describe('Investigations Cards', () => {
  beforeEach(() => {
    cy.intercept('**/investigations/count*').as('getInvestigationsCount');
    cy.intercept('**/investigations?order*').as('getInvestigationsOrder');
    cy.login();
    cy.visit('/browse/investigation').wait(
      [
        '@getInvestigationsCount',
        '@getInvestigationsOrder',
        '@getInvestigationsOrder',
      ],
      { timeout: 15000 }
    );
    cy.get('[aria-label="page-view Display as cards"]').click();
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
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('Her know fine according');

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('#card').contains(
      'Bed son everybody despite international central project'
    );

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains(
      'Including spend increase ability music skill former.'
    );
  });

  it('should be able to sort by multiple fields', () => {
    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('Decide visit list professional.');

    cy.contains('[role="button"]', 'Title')
      .click()
      .wait('@getInvestigationsOrder', { timeout: 10000 });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('Decide visit list professional.');
  });

  // TODO: Not finding the card contents
  it.skip('should be able to filter by multiple fields', () => {
    cy.contains('[role="button"]', 'Type ID').click();
    cy.contains('[role="button"]', 'Type ID')
      .parent()
      .contains('[role="button"]', '1')
      .click()
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 30000,
      });
    cy.contains('[role="button"]', 'Type ID - 1').should('exist');
    cy.get('#card').contains('Day purpose item create.');

    cy.get('[aria-label="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Title"]')
      .first()
      .type('before')
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('Have price already kid scene artist allow.');

    cy.get('input[id="Start Date filter from"]')
      .type('2017-01-01')
      .wait(['@getInvestigationsCount', '@getInvestigationsOrder'], {
        timeout: 10000,
      });
    cy.get('button[aria-label="Start Date filter to, date picker"]')
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
    cy.get('input[id="Start Date filter to"]').should(
      'have.value',
      date.toISOString().slice(0, 10)
    );
    cy.get('#card').contains('That factor class price success none.');
  });
});
