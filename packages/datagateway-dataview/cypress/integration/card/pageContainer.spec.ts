describe('PageContainer Component', () => {
  beforeEach(() => {
    cy.intercept('**/investigations/count*').as('getInvestigationsCount');
    cy.intercept('**/investigations?order*').as('getInvestigationsOrder');
    cy.login();
    cy.visit('/browse/investigation/').wait(
      [
        '@getInvestigationsCount',
        '@getInvestigationsOrder',
        '@getInvestigationsOrder',
      ],
      { timeout: 10000 }
    );
    cy.get('[aria-label="page-view Display as cards"]').click();
    cy.clearDownloadCart();
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');

    cy.get('[aria-label="page-breadcrumbs"]').should('exist');

    cy.get('[aria-label="view-count"]').should('exist');

    cy.get('[aria-label="view-search"]').should('exist');

    cy.get('[aria-label="view-cart"]').should('exist');

    cy.get('[aria-label="page-view Display as table"]').should('exist');
  });

  it('should display correct entity count', () => {
    // Check that the entity count has displayed correctly.
    cy.get('[aria-label="view-count"]')
      .should('be.visible')
      .contains('Results: 239');
  });

  it('Should default to 10 when the results value is not a vaild result ([10,20,30]) when manually changed in the url ', () => {
    cy.login();
    cy.visit('/browse/investigation?view=card&results=125');
    cy.url().should('include', 'results=10');
    cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
      'have.length',
      10
    );
    cy.visit('/browse/investigation?view=card&results=25');
    cy.url().should('include', 'results=10');
    cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
      'have.length',
      10
    );
    cy.visit('/browse/investigation?view=card&results=15');
    cy.url().should('include', 'results=10');
    cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
      'have.length',
      10
    );
    cy.visit('/browse/investigation?view=card&results=5');
    cy.url().should('include', 'results=10');
    cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
      'have.length',
      10
    );
  });

  it('Should not default to 10 when the results value is a vaild result ([10,20,30]) when manually changed in the url ', () => {
    cy.login();
    cy.visit('/browse/investigation?view=card&results=10');
    cy.url().should('include', 'results=10');
    cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
      'have.length',
      10
    );
    cy.visit('/browse/investigation?view=card&results=20');
    cy.url().should('include', 'results=20');
    cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
      'have.length',
      20
    );
    cy.visit('/browse/investigation?view=card&results=30');
    cy.url().should('include', 'results=30');
    cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
      'have.length',
      30
    );
  });

  it('should display number of items in cart correctly', () => {
    // Check that the download cart has displayed correctly.
    cy.get('[aria-label="view-cart-badge"]', { timeout: 10000 })
      .children()
      .should('be.hidden');

    cy.get('[aria-label="card-button-1"]', { timeout: 10000 }).eq(0).click();

    cy.get('[aria-label="view-cart-badge"]', { timeout: 10000 })
      .children()
      .should('not.be.hidden')
      .contains('1');

    cy.get('[aria-label="card-button-1"]', { timeout: 10000 }).eq(1).click();

    cy.get('[aria-label="view-cart-badge"]', { timeout: 10000 })
      .children()
      .should('not.be.hidden')
      .contains('2');
  });

  it('should be able to choose number of results to display', () => {
    cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
      'have.length',
      10
    );

    cy.get('select[id="select-max-results"]', {
      timeout: 10000,
    }).select('20');
    cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
      'have.length',
      20
    );

    cy.get('select[id="select-max-results"]', {
      timeout: 10000,
    }).select('30');
    cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
      'have.length',
      30
    );
  });

  it('should be able to change page', () => {
    cy.get('[aria-label="Go to page 2"]', { timeout: 10000 }).first().click();
    cy.get('[data-testid="card"]')
      .first()
      .contains('Guy maintain us process official people suffer.');

    cy.get('[aria-label="Go to next page"]', { timeout: 10000 })
      .first()
      .click();
    cy.get('[data-testid="card"]')
      .first()
      .contains('Yourself smile either I pass significant.');

    cy.get('[aria-label="Go to last page"]', { timeout: 10000 })
      .first()
      .click();
    cy.get('[data-testid="card"]')
      .first()
      .contains('Window former upon writer help step account.');

    cy.get('[aria-label="Go to previous page"]', { timeout: 10000 })
      .first()
      .click();
    cy.get('[data-testid="card"]')
      .first()
      .contains('Someone statement Republican plan watch.');

    cy.get('[aria-label="Go to first page"]', { timeout: 10000 })
      .first()
      .click();
    cy.get('[data-testid="card"]')
      .first()
      .contains('Including spend increase ability music skill former.');
  });

  it('should load the homepage if navigating to home', () => {
    cy.visit('/datagateway');
    cy.get('div[id="dg-homepage"]');
  });

  it('should display selection alert banner correctly', () => {
    cy.get('[aria-label="selection-alert"]', { timeout: 10000 }).should(
      'not.exist'
    );

    cy.get('[aria-label="card-button-1"]', { timeout: 10000 }).eq(0).click();

    cy.get('[aria-label="selection-alert"]', { timeout: 10000 }).should(
      'exist'
    );
    cy.get('[aria-label="selection-alert-text"]')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal('1 item has been added to selections.');
      });
    cy.get('[aria-label="selection-alert-close"]').click();
    cy.get('[aria-label="selection-alert"]', { timeout: 10000 }).should(
      'not.exist'
    );
  });
});
