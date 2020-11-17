describe('ISIS - Instruments Cards', () => {
  beforeEach(() => {
    Cypress.currentTest.retries(2);
    cy.server();
    cy.route('**/instruments/count*').as('getInstrumentsCount');
    cy.route('**/instruments?order*').as('getInstrumentsOrder');
    cy.login('user', 'password');
    cy.visit('/browse/instrument').wait(
      ['@getInstrumentsCount', '@getInstrumentsOrder'],
      { timeout: 10000 }
    );
    cy.get('[aria-label="secondary checkbox"]')
      .click()
      .wait(
        [
          '@getInstrumentsCount',
          '@getInstrumentsCount',
          '@getInstrumentsOrder',
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
      .contains('Drug something increase common nature reflect purpose.')
      .click({ force: true });
    cy.location('pathname').should('eq', '/browse/instrument/1/facilityCycle');
  });

  it('should be able to sort by one field', () => {
    cy.contains('[role="button"]', 'Name')
      .click()
      .wait(['@getInstrumentsCount', '@getInstrumentsOrder'], {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('Art very opportunity glass painting.');

    cy.contains('[role="button"]', 'Name')
      .click()
      .wait(
        [
          '@getInstrumentsCount',
          '@getInstrumentsOrder',
          '@getInstrumentsOrder',
        ],
        { timeout: 10000 }
      );
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('#card').contains('Who set wind carry matter.');

    cy.contains('[role="button"]', 'Name')
      .click()
      .wait(
        [
          '@getInstrumentsCount',
          '@getInstrumentsOrder',
          '@getInstrumentsOrder',
        ],
        { timeout: 10000 }
      );
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains(
      'Drug something increase common nature reflect purpose.'
    );
  });

  it('should be able to sort by multiple fields', () => {
    cy.contains('[role="button"]', 'Description')
      .click()
      .wait(
        [
          '@getInstrumentsCount',
          '@getInstrumentsOrder',
          '@getInstrumentsOrder',
        ],
        { timeout: 10000 }
      );
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('Radio land involve economic.');

    cy.contains('[role="button"]', 'Type')
      .click()
      .wait(
        [
          '@getInstrumentsCount',
          '@getInstrumentsOrder',
          '@getInstrumentsOrder',
        ],
        { timeout: 10000 }
      );
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('13');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[aria-label="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Name"]')
      .find('input')
      .type('Radio')
      .wait(['@getInstrumentsCount', '@getInstrumentsOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('Radio land involve economic.');

    cy.get('[aria-label="Filter by Type"]')
      .find('input')
      .type('1')
      .wait(['@getInstrumentsCount', '@getInstrumentsOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('13');
  });

  it('should be able to expand "More Information"', () => {
    cy.get('#card').contains('More Information').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('Drug something increase common nature reflect purpose.');
    cy.get('#instrument-users-tab').click({ force: true });
    cy.get('#card')
      .get('[aria-label="card-more-information"]')
      .contains('Matthew50');
  });
});
