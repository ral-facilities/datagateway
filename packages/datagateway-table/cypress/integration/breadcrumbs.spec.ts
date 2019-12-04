describe('Breadcrumbs Component', () => {
  beforeEach(() => {
    // Get a session and visit the table.
    cy.login('user', 'password');

    // Create route and aliases.
    cy.server();
    cy.route('/investigations/*').as('getInvestigation');
    cy.route('/datasets/*').as('getDataset');

    cy.visit('/browse/investigation');
  });

  it('should load correctly and display current breadcrumb', () => {
    cy.title().should('equal', 'DataGateway Table');

    // Check that the base Investigations breadcrumb exists.
    cy.get('[aria-label="Breadcrumb-base"]').contains('Investigations');
  });

  it('should click on investigation and add breadcrumbs correctly', () => {
    // Click on the first investigation in the table.
    cy.get('[role="gridcell"] a')
      .first()
      .click({ force: true });

    // Wait for the investigation request to complete.
    cy.wait('@getInvestigation');

    // Check to see if the breadcrumbs have been added correctly.
    // Get the first link on the page which is a link to
    // /browse/investigations in the breadcrumb trail.
    cy.get('[aria-label="Breadcrumb-base"]')
      .should('have.text', 'Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    // Get the investigation name.
    cy.get('[aria-label="Breadcrumb-hierarchy-1"]').should(
      'have.text',
      'Including spend increase ability music skill former. Agreement director concern once technology sometimes someone staff.' +
        '\nSuccess pull bar. Laugh senior example.'
    );

    // Ensure current page is datasets.
    cy.get('[aria-label="Breadcrumb-last"]').should('have.text', 'Datasets');
  });

  it('loads the breadcrumb trail when visiting a page directly', () => {
    // Visit a direct link.
    cy.visit('/browse/investigation/1/dataset/1/datafile');

    // Wait for all API requests to return.
    cy.wait('@getInvestigation');
    cy.wait('@getDataset');

    // Get Investigations table breadcrumb link.
    cy.get('[aria-label="Breadcrumb-base"]')
      .should('have.text', 'Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    // Get investigation datasets table breadcrumb.
    cy.get('[aria-label="Breadcrumb-hierarchy-1"]')
      .should(
        'have.text',
        'Including spend increase ability music skill former. Agreement director ' +
          'concern once technology sometimes someone staff.\nSuccess pull bar. Laugh senior example.'
      )
      .should('have.attr', 'href', '/browse/investigation/1/dataset');

    // Get current dataset page breadcrumb.
    cy.get('[aria-label="Breadcrumb-hierarchy-2"]').should(
      'have.text',
      'DATASET 91'
    );

    // Get page contents breadcrumb.
    cy.get('[aria-label="Breadcrumb-last"]')
      .first()
      .should('have.text', 'Datafiles');
  });

  it('loads breadcrumb trail correctly after pressing back browser key', () => {
    // Load pages into the history.
    cy.visit('/browse/investigation/1/dataset');

    cy.wait('@getInvestigation');

    // Click on the first link with Dataset 1.
    cy.contains('DATASET 1').click({ force: true });

    // Check to ensure the location is the datafile.
    cy.location('pathname').should(
      'eq',
      '/browse/investigation/1/dataset/25/datafile'
    );

    cy.wait('@getDataset');

    // Check the first breadcrumb loaded on the current page.
    cy.get('[aria-label="Breadcrumb-base"]')
      .should('have.text', 'Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    cy.get('[aria-label="Breadcrumb-hierarchy-1"]')
      .should(
        'have.text',
        'Including spend increase ability music skill former. Agreement director ' +
          'concern once technology sometimes someone staff.\nSuccess pull bar. Laugh senior example.'
      )
      .should('have.attr', 'href', '/browse/investigation/1/dataset');

    cy.get('[aria-label="Breadcrumb-hierarchy-2"]').contains('DATASET 1');

    cy.get('[aria-label="Breadcrumb-last"]').contains('Datafiles');

    // Press back.
    cy.go('back');

    // Check the breadcrumb trail on the previous page.
    cy.get('[aria-label="Breadcrumb-base"]')
      .should('have.text', 'Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    cy.get('[aria-label="Breadcrumb-hierarchy-1"]').should(
      'have.text',
      'Including spend increase ability music skill former. Agreement director ' +
        'concern once technology sometimes someone staff.\nSuccess pull bar. Laugh senior example.'
    );

    cy.get('[aria-label="Breadcrumb-last"]').contains('Datasets');
  });
});
