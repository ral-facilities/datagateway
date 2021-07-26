describe('ISIS - Studies Cards', () => {
  beforeEach(() => {
    cy.intercept('**/studyinvestigations/count*').as('getStudiesCount');
    cy.intercept('**/studyinvestigations?order*').as('getStudiesOrder');
    cy.login();
    cy.visit('/browseStudyHierarchy/instrument/1/study').wait(
      ['@getStudiesCount', '@getStudiesOrder'],
      { timeout: 10000 }
    );
    cy.get('[aria-label="container-view-button"]')
      .click()
      .wait(['@getStudiesCount', '@getStudiesOrder'], {
        timeout: 10000,
      });
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click a study to see its landing page', () => {
    cy.get('#card').contains('STUDY 375').click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseStudyHierarchy/instrument/1/study/405'
    );
  });

  it('should be able to sort by one field', () => {
    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getStudiesOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('STUDY 36');

    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getStudiesOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('#card').contains('STUDY 406');

    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getStudiesOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('STUDY 375');
  });

  it('should be able to sort by multiple fields', () => {
    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getStudiesOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('STUDY 36');

    cy.contains('[role="button"]', 'End Date')
      .click()
      .wait('@getStudiesOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('STUDY 36');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[aria-label="advanced-filters-link"]').click();

    cy.get('[aria-label="Filter by Name"]')
      .find('input')
      .first()
      .type('4')
      .wait(['@getStudiesCount', '@getStudiesOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('STUDY 141');

    cy.get('[aria-label="Filter by Description"]')
      .find('input')
      .first()
      .type('energy')
      .wait(['@getStudiesCount', '@getStudiesOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('STUDY 406');
  });
});
