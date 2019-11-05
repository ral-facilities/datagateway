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
    cy.contains('Investigations');
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
    cy.get('a')
      .first()
      .contains('Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    // Get the investigation name.
    cy.get(':nth-child(3) > .MuiTypography-root').contains(
      'Including spend increase ability music skill former. Agreement director ' +
        'concern once technology sometimes someone staff. Success pull bar. Laugh senior example.'
    );

    // Ensure current page is datasets.
    cy.get('i')
      .first()
      .contains('Datasets');
  });

  it('loads the breadcrumb trail when visiting a page directly', () => {
    // Visit a direct link.
    cy.visit('/browse/investigation/1/dataset/1/datafile');

    // Wait for all API requests to return.
    cy.wait('@getInvestigation');
    cy.wait('@getDataset');

    // Get Investigations table breadcrumb link.
    cy.get('a')
      .first()
      .contains('Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    // Get investigation datasets table breadcrumb.
    cy.get(':nth-child(3) > .MuiTypography-root')
      .contains(
        'Including spend increase ability music skill former. Agreement director ' +
          'concern once technology sometimes someone staff. Success pull bar. Laugh senior example.'
      )
      .should('have.attr', 'href', '/browse/investigation/1/dataset');

    // Get current dataset page breadcrumb.
    cy.get(':nth-child(5) > .MuiTypography-root').contains('Dataset 1');

    // Get page contents breadcrumb.
    cy.get('i')
      .first()
      .contains('Datafiles');
  });

  it('loads breadcrumb trail correctly after pressing forward/backward browser keys', () => {
    // Load pages into the history.
    cy.visit('/browse/investigation/1/dataset');

    cy.wait('@getInvestigation');

    // Click on the first link with Dataset 1.
    cy.get('[role="gridcell"] a')
      .contains('Dataset 1')
      .click({ force: true });

    // Check to ensure the location is the datafile.
    cy.location('pathname').should(
      'eq',
      '/browse/investigation/1/dataset/1/datafile'
    );

    cy.wait('@getDataset');

    // Check the breadcrumb loaded on the current page.
    cy.get('a')
      .first()
      .contains('Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    cy.contains(
      'Including spend increase ability music skill former. Agreement director ' +
        'concern once technology sometimes someone staff. Success pull bar. Laugh senior example.'
    ).should('have.attr', 'href', '/browse/investigation/1/dataset');

    cy.get(':nth-child(5) > .MuiTypography-root').contains('Dataset 1');

    cy.get('i')
      .first()
      .contains('Datafiles');

    // Press back.
    cy.go('back');

    // Check the breadcrumb trail on the previous page.
    cy.get('a')
      .first()
      .contains('Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    cy.get(':nth-child(3) > .MuiTypography-root').contains(
      'quas accusantium omnis'
    );

    cy.get('i')
      .first()
      .contains('Datasets');
  });
});
