describe('PageContainer Component', () => {
  beforeEach(() => {
    cy.intercept('**/investigations/count*').as('getInvestigationsCount');
    cy.intercept('**/investigations?order*').as('getInvestigationsOrder');
    cy.login('user', 'password');
    cy.visit('/browse/investigation/').wait(
      [
        '@getInvestigationsCount',
        '@getInvestigationsOrder',
        '@getInvestigationsOrder',
      ],
      { timeout: 10000 }
    );
    cy.get('[aria-label="secondary checkbox"]')
      .click()
      .wait(
        [
          '@getInvestigationsCount',
          '@getInvestigationsCount',
          '@getInvestigationsOrder',
        ],
        { timeout: 10000 }
      );
    cy.clearDownloadCart();
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');

    cy.get('[aria-label="container-breadcrumbs"]').should('exist');

    cy.get('[aria-label="container-table-count"]').should('exist');

    cy.get('[aria-label="container-table-search"]').should('exist');

    cy.get('[aria-label="container-table-cart"]').should('exist');

    cy.get('[aria-label="container-table"]').should('exist');
  });

  it('should display correct entity count', () => {
    // Check that the entity count has displayed correctly.
    cy.get('[aria-label="container-table-count"]')
      .should('be.visible')
      .contains('Results: 239');
  });

  it('should display number of items in cart correctly', () => {
    // Check that the download cart has displayed correctly.
    cy.get('[aria-label="container-table-cart-badge"]', { timeout: 10000 })
      .children()
      .should('be.hidden');

    cy.get('[aria-label="card-button-1"]', { timeout: 10000 }).eq(0).click();

    cy.get('[aria-label="container-table-cart-badge"]', { timeout: 10000 })
      .children()
      .should('not.be.hidden')
      .contains('1');

    cy.get('[aria-label="card-button-1"]', { timeout: 10000 }).eq(1).click();

    cy.get('[aria-label="container-table-cart-badge"]', { timeout: 10000 })
      .children()
      .should('not.be.hidden')
      .contains('2');
  });

  it('should be able to chose number of results to display', () => {
    cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
      'have.length',
      10
    );

    cy.get('#select-max-results', { timeout: 10000 }).click();
    cy.get('#menu-', { timeout: 10000 }).contains('20').click();
    cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
      'have.length',
      20
    );

    cy.get('#select-max-results', { timeout: 10000 }).click();
    cy.get('#menu-', { timeout: 10000 }).contains('30').click();
    cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
      'have.length',
      30
    );
  });

  it('should be able to change page', () => {
    cy.get('[aria-label="Go to page 2"]', { timeout: 10000 }).first().click();
    cy.get('#card').contains('Law hair score herself threat back often.');

    cy.get('[aria-label="Go to next page"]', { timeout: 10000 })
      .first()
      .click();
    cy.get('#card').contains('Return another mention skin specific.');

    cy.get('[aria-label="Go to last page"]', { timeout: 10000 })
      .first()
      .click();
    cy.get('#card').contains('Only deal all player could.');

    cy.get('[aria-label="Go to previous page"]', { timeout: 10000 })
      .first()
      .click();
    cy.get('#card').contains('Himself now become speech drug who fine bar.');

    cy.get('[aria-label="Go to first page"]', { timeout: 10000 })
      .first()
      .click();
    cy.get('#card').contains(
      'Including spend increase ability music skill former.'
    );
  });
});
