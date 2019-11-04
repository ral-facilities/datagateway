describe('Breadcrumbs Component', () => {
  beforeEach(() => {
    // Create route and aliases.
    cy.server();
    cy.route('/investigations/*').as('getInvestigation');

    // Get a session and visit the table.
    cy.login('user', 'password');
    cy.visit('/browse/investigation');
  });

  it('should load correctly and display current breadcrumb', () => {
    cy.title().should('equal', 'DataGateway Table');

    // Check that the base Investigations breadcrumb exists.
    cy.contains('Investigations');
  });

  it('should click on investigation and add breadcrumbs correctly', () => {
    // Click on an investigation in the table.
    cy.get('[role="gridcell"] a')
      .first()
      .click();

    // Wait for the investigation request to complete.
    cy.wait('@getInvestigation');

    // Check to see if the breadcrumbs have been added correctly.
    // Check that there is a link to /browse/investigations.
    cy.get('a')
      .first()
      .contains('Investigations')
      .should('have.attr', 'href', '/browse/investigation');

    // Get the investigation name.
    cy.get(':nth-child(3) > .MuiTypography-root').contains(
      'quas accusantium omnis'
    );

    // Ensure current page is datasets.
    cy.get('i')
      .first()
      .contains('Datasets');
  });

  it('loads the breadcrumb trail when visiting a page directly', () => {
    // Visit a direct link.
    cy.visit('/browse/investigation/1/dataset/1/datafile');

    cy.wait('@getInvestigation');
  });
});
