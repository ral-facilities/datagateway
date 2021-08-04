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
    cy.get('#card').contains('STUDY 4').click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseStudyHierarchy/instrument/1/study/4'
    );
  });

  // TODO: Data mismatch issue (#782)
  it.skip('should be able to sort by one field', () => {
    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getStudiesOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('STUDY 4');

    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getStudiesOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('#card').contains('STUDY 494');

    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getStudiesOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('STUDY 4');
  });

  // TODO: Data mismatch issue (#782)
  it.skip('should be able to sort by multiple fields', () => {
    cy.contains('[role="button"]', 'Start Date')
      .click()
      .wait('@getStudiesOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('STUDY 4');

    cy.contains('[role="button"]', 'End Date')
      .click()
      .wait('@getStudiesOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('#card').contains('STUDY 4');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[aria-label="advanced-filters-link"]').click();

    cy.get('[aria-label="Filter by Name"]')
      .find('input')
      .first()
      .type('1')
      .wait(['@getStudiesCount', '@getStudiesOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('STUDY 21');

    cy.get('[aria-label="Filter by Title"]')
      .find('input')
      .first()
      .type('peace')
      .wait(['@getStudiesCount', '@getStudiesOrder'], {
        timeout: 10000,
      });
    cy.get('#card').contains('STUDY 341');
  });
});
