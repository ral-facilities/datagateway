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
    cy.get('[data-testid="card"]')
      .first()
      .contains('STUDY 314')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseStudyHierarchy/instrument/1/study/314'
    );
  });

  it('should disable the hover tool tip by pressing escape', () => {
    // The hover tool tip has a enter delay of 500ms.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="card"]')
      .get('[data-testid="landing-study-card-pid-link"]')
      .first()
      .trigger('mouseover')
      .wait(700)
      .get('[role="tooltip"]')
      .should('exist');

    cy.get('body').type('{esc}');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="card"]')
      .get('[data-testid="landing-study-card-pid-link"]')
      .wait(700)
      .first()
      .get('[role="tooltip"]')
      .should('not.exist');
  });

  it('should have the correct url for the PID link', () => {
    cy.get('[data-testid="card"]')
      .first()
      .get('[data-testid="landing-study-card-pid-link"]')
      .first()
      .then(($pid) => {
        const pid = $pid.text();

        const url = `https://doi.org/${pid}`;

        cy.get('[data-testid="card"]')
          .first()
          .get('[data-testid="landing-study-card-pid-link"]')
          .first()
          .should('have.attr', 'href', url);
      });
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
      cy.get('[data-testid="card"]').first().contains('STUDY 325');

      cy.contains('[role="button"]', 'Start Date')
        .click()
        .wait('@getStudiesOrder', {
          timeout: 10000,
        });
      cy.contains('[role="button"]', 'asc').should('not.exist');
      cy.contains('[role="button"]', 'desc').should('exist');
      cy.get('[data-testid="card"]').first().contains('STUDY 314');

      cy.contains('[role="button"]', 'Start Date')
        .click()
        .wait('@getStudiesOrder', {
          timeout: 10000,
        });
      cy.contains('[role="button"]', 'asc').should('not.exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('[data-testid="card"]').first().contains('STUDY 4');
    });

    it('multiple fields', () => {
      cy.contains('[role="button"]', 'Start Date')
        .click()
        .wait('@getStudiesOrder', {
          timeout: 10000,
        });
      cy.contains('[role="button"]', 'asc').should('exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('[data-testid="card"]').first().contains('STUDY 325');

      cy.contains('[role="button"]', 'End Date')
        .click()
        .wait('@getStudiesOrder', {
          timeout: 10000,
        });
      cy.contains('[role="button"]', 'asc').should('exist');
      cy.contains('[role="button"]', 'desc').should('not.exist');
      cy.get('[data-testid="card"]').first().contains('STUDY 325');
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
      cy.get('[data-testid="advanced-filters-link"]').click();

      cy.get('[aria-label="Filter by Name"]')
        .first()
        .type('1')
        .wait(['@getStudiesCount', '@getStudiesOrder'], {
          timeout: 10000,
        });
      cy.get('[data-testid="card"]').first().contains('STUDY 21');

      cy.get('[aria-label="Filter by Title"]')
        .first()
        .type('science')
        .wait(['@getStudiesCount', '@getStudiesOrder'], {
          timeout: 10000,
        });
      cy.get('[data-testid="card"]').first().contains('STUDY 314');
    });
  });
});
