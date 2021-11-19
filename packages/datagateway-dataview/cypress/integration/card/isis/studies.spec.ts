describe('ISIS - Studies Cards', () => {
  beforeEach(() => {
    cy.intercept('**/studies/count*').as('getStudiesCount');
    cy.intercept('**/studies?order*').as('getStudiesOrder');
    cy.login();
    cy.visit('/browseStudyHierarchy/instrument/1/study').wait(
      ['@getStudiesCount', '@getStudiesOrder'],
      { timeout: 10000 }
    );
    cy.get('[aria-label="page-view Display as cards"]').click();
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    //Default sort
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
  });

  it('should be able to click a study to see its landing page', () => {
    cy.get('#card').contains('STUDY 494').click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseStudyHierarchy/instrument/1/study/494'
    );
  });

  describe('should be able to sort by', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Start Date')
        .click()
        .wait('@getStudiesOrder', { timeout: 10000 });
    });

    it('one field', () => {
      cy.contains('[role="button"]', 'Start Date')
        .click()
        .wait('@getStudiesOrder', {
          timeout: 10000,
        });
      cy.contains('[role="button"]', 'asc').should('exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('#card').contains('STUDY 325');

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

    it('multiple fields', () => {
      cy.contains('[role="button"]', 'Start Date')
        .click()
        .wait('@getStudiesOrder', {
          timeout: 10000,
        });
      cy.contains('[role="button"]', 'asc').should('exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('#card').contains('STUDY 325');

      cy.contains('[role="button"]', 'End Date')
        .click()
        .wait('@getStudiesOrder', {
          timeout: 10000,
        });
      cy.contains('[role="button"]', 'asc').should('exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('#card').contains('STUDY 325');
    });
  });

  describe('should be able to filter by', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Start Date')
        .click()
        .wait('@getStudiesOrder', { timeout: 10000 });
    });

    it('multiple fields', () => {
      cy.get('[aria-label="advanced-filters-link"]').click();

      cy.get('[aria-label="Filter by Name"]')
        .first()
        .type('1')
        .wait(['@getStudiesCount', '@getStudiesOrder'], {
          timeout: 10000,
        });
      cy.get('#card').contains('STUDY 11');

      cy.get('[aria-label="Filter by Title"]')
        .first()
        .type('peace')
        .wait(['@getStudiesCount', '@getStudiesOrder'], {
          timeout: 10000,
        });
      cy.get('#card').contains('STUDY 341');
    });
  });
});
