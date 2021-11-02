describe('Breadcrumbs Component', () => {
  beforeEach(() => {
    // Get a session and visit the table.
    cy.login();

    // Create route and aliases.
    cy.intercept('/investigations/').as('getInvestigations');
    cy.intercept(/\/investigations\/[0-9]+/).as('getInvestigation');
    cy.intercept(/\/datasets\/[0-9]+/).as('getDataset');

    cy.visit('/browse/investigation').wait('@getInvestigations');
  });

  it('should load correctly and display current breadcrumb', () => {
    cy.title().should('equal', 'DataGateway DataView');

    // Check that the base Investigations breadcrumb exists.
    cy.get('[aria-label="Breadcrumbs"]').contains('Investigations');
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
    cy.get('[aria-label="Breadcrumbs"]')
      .contains('Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    // Get the investigation name.
    cy.get('[aria-label="Breadcrumbs"]').contains('Including spend');

    // Ensure current page is datasets.
    cy.get('[aria-label="Breadcrumbs"] li').last().contains('Datasets');
  });

  it('loads the breadcrumb trail when visiting a page directly', () => {
    // Visit a direct link.
    cy.visit('/browse/investigation/1/dataset/1/datafile')
      .wait('@getInvestigation')
      .wait('@getDataset');

    // Get Investigations table breadcrumb link.
    cy.get('[aria-label="Breadcrumbs"]')
      .contains('Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    // Get investigation datasets table breadcrumb.
    cy.get('[aria-label="Breadcrumbs"]')
      .contains('Including spend')
      .should('have.attr', 'href', '/browse/investigation/1/dataset');

    // Get current dataset page breadcrumb.
    cy.get('[aria-label="Breadcrumbs"]').contains('DATASET 1');

    // Get page contents breadcrumb.
    cy.get('[aria-label="Breadcrumbs"] li').last().contains('Datafiles');
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
    cy.get('[aria-label="Breadcrumbs"]')
      .contains('Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    cy.get('[aria-label="Breadcrumbs"]')
      .contains('Including spend')
      .should('have.attr', 'href', '/browse/investigation/1/dataset');

    cy.get('[aria-label="Breadcrumbs"]').contains('DATASET 1');

    cy.get('[aria-label="Breadcrumbs"] li').last().contains('Datafiles');

    // Press back.
    cy.go('back');

    // Check the breadcrumb trail on the previous page.
    cy.get('[aria-label="Breadcrumbs"]')
      .contains('Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    cy.get('[aria-label="Breadcrumbs"]').contains('Including spend');

    cy.get('[aria-label="Breadcrumbs"] li').last().contains('Datasets');
  });
});
