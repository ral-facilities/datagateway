describe('ISIS - Studies Cards', () => {
  beforeEach(() => {
    cy.intercept('**/studyinvestigations/count*').as('getStudiesCount');
    cy.intercept('**/studyinvestigations?order*').as('getStudiesOrder');
    cy.login('root', 'pw');
    cy.visit('/browseStudyHierarchy/instrument/1/study').wait(
      ['@getStudiesCount', '@getStudiesOrder'],
      { timeout: 10000 }
    );
    cy.get('[aria-label="secondary checkbox"]')
      .click()
      .wait(['@getStudiesCount', '@getStudiesOrder'], {
        timeout: 10000,
      });
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('#card').contains('STUDY 375').click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseStudyHierarchy/instrument/1/study/405/investigation'
    );
  });

  // Sorting currently fails
  it.skip('should be able to sort by one field', () => {
    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getStudiesOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('2004 cycle 1');

    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getStudiesOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('#card').contains('2019 cycle ');

    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getStudiesOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('2006 cycle 3');
  });

  it.skip('should be able to sort by multiple fields', () => {
    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getStudiesOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('2004 cycle 1');

    cy.contains('[role="button"]', 'End Date')
      .click()
      .wait('@getStudiesOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('2004 cycle 1');
  });

  // Cannot filter on two joined fields at the same time
  it.skip('should be able to filter by multiple fields', () => {
    cy.get('[aria-label="advanced-filters-link"]')
      .click()
      .wait('@getStudiesOrder', {
        timeout: 10000,
      });
    cy.get('[aria-label="Filter by RB Number"]')
      .find('input')
      .type('4')
      .wait(['@getStudiesCount', '@getStudiesOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('STUDY 43');

    cy.get('[aria-label="Filter by Description"]')
      .find('input')
      .type('energy')
      .wait(['@getStudiesCount', '@getStudiesOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('STUDY 406');
  });
});
