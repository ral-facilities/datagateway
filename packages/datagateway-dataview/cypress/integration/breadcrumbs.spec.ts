describe('Breadcrumbs Component', () => {
  beforeEach(() => {
    // Get a session and visit the table.
    cy.login();

    // Create route and aliases.
    cy.intercept('/investigations/').as('getInvestigation');
    cy.intercept('/datasets/').as('getDataset');

    cy.visit('/browse/investigation').wait('@getInvestigation');
  });

  it('should load correctly and display current breadcrumb', () => {
    cy.title().should('equal', 'DataGateway DataView');

    // Check that the base Investigations breadcrumb exists.
    cy.get('[data-testid="Breadcrumb-base"]').contains('Investigations');
  });

  it('should click on investigation and add breadcrumbs correctly', () => {
    // Click on the first investigation in the table.
    cy.get('[role="gridcell"] a')
      .first()
      .click({ force: true })
      .wait('@getInvestigation');

    // Check to see if the breadcrumbs have been added correctly.
    // Get the first link on the page which is a link to
    // /browse/investigations in the breadcrumb trail.
    cy.get('[data-testid="Breadcrumb-base"]')
      .should('have.text', 'Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    // Get the investigation name.
    cy.get('[data-testid="Breadcrumb-hierarchy-1"]').should(
      'have.text',
      'Including spend increase ability music skill former. Agreement director concern once technology sometimes someone staff.' +
        '\nSuccess pull bar. Laugh senior example.'
    );

    // Ensure current page is datasets.
    cy.get('[data-testid="Breadcrumb-last"]').should('have.text', 'Datasets');
  });

  it('loads the breadcrumb trail when visiting a page directly', () => {
    // Visit a direct link.
    cy.visit('/browse/investigation/1/dataset/1/datafile')
      .wait('@getInvestigation')
      .wait('@getDataset');

    // Get Investigations table breadcrumb link.
    cy.get('[data-testid="Breadcrumb-base"]')
      .should('have.text', 'Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    // Get investigation datasets table breadcrumb.
    cy.get('[data-testid="Breadcrumb-hierarchy-1"]')
      .should(
        'have.text',
        'Including spend increase ability music skill former. Agreement director ' +
          'concern once technology sometimes someone staff.\nSuccess pull bar. Laugh senior example.'
      )
      .should('have.attr', 'href', '/browse/investigation/1/dataset');

    // Get current dataset page breadcrumb.
    cy.get('[data-testid="Breadcrumb-hierarchy-2"]').should(
      'have.text',
      'DATASET 1'
    );

    // Get page contents breadcrumb.
    cy.get('[data-testid="Breadcrumb-last"]')
      .first()
      .should('have.text', 'Datafiles');
  });

  it('loads breadcrumb trail correctly after pressing back browser key', () => {
    // Load pages into the history.
    cy.visit('/browse/investigation/1/dataset').wait('@getInvestigation');

    // Click on the first link with Dataset 1.
    cy.contains('DATASET 1').click({ force: true }).wait('@getDataset');

    // Check to ensure the location is the datafile.
    cy.location('pathname').should(
      'eq',
      '/browse/investigation/1/dataset/1/datafile'
    );

    // Check the first breadcrumb loaded on the current page.
    cy.get('[data-testid="Breadcrumb-base"]')
      .should('have.text', 'Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    cy.get('[data-testid="Breadcrumb-hierarchy-1"]')
      .should(
        'have.text',
        'Including spend increase ability music skill former. Agreement director ' +
          'concern once technology sometimes someone staff.\nSuccess pull bar. Laugh senior example.'
      )
      .should('have.attr', 'href', '/browse/investigation/1/dataset');

    cy.get('[data-testid="Breadcrumb-hierarchy-2"]').contains('DATASET 1');

    cy.get('[data-testid="Breadcrumb-last"]').contains('Datafiles');

    // Press back.
    cy.go('back');

    // Check the breadcrumb trail on the previous page.
    cy.get('[data-testid="Breadcrumb-base"]')
      .should('have.text', 'Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    cy.get('[data-testid="Breadcrumb-hierarchy-1"]').should(
      'have.text',
      'Including spend increase ability music skill former. Agreement director ' +
        'concern once technology sometimes someone staff.\nSuccess pull bar. Laugh senior example.'
    );

    cy.get('[data-testid="Breadcrumb-last"]').contains('Datasets');
  });

  it.only('should display tooltips correctly', () => {
    // Load pages into the history.
    cy.visit('/browse/investigation/1/dataset').wait('@getInvestigation');

    // Click on the first link with Dataset 1.
    cy.contains('DATASET 1').click({ force: true }).wait('@getDataset');

    // Check to ensure the location is the datafile.
    cy.location('pathname').should(
      'eq',
      '/browse/investigation/1/dataset/1/datafile'
    );

    // The hover tool tip has an enter delay of 100ms.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.contains('DATASET 1')
      .trigger('mouseover', { force: true })
      .wait(300)
      .get('[data-testid="arrow-tooltip-component-true"]')
      .should('not.exist');

    // The hover tool tip has an enter delay of 100ms.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.contains('Including spend')
      .trigger('mouseover', { force: true })
      .wait(300)
      .get('[data-testid="arrow-tooltip-component-true"]')
      .should('exist');
  });
});
