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

    cy.get('[aria-label="Go to selections"]').should('exist');

    cy.get('[aria-label="page-view Display as table"]').should('exist');
  });

  it('should disable the hover tool tip by pressing escape (open data warning)', () => {
    // The hover tool tip has an enter delay of 500ms.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="arrow-tooltip-component-false"]')
      .eq(2)
      .trigger('mouseover')
      .wait(700)
      .get('[data-testid="arrow-tooltip-component-true"]')
      .should('exist');

    cy.get('body').type('{esc}');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="arrow-tooltip-component-false"]')
      .eq(2)
      .wait(700)
      .first()
      .get('[data-testid="arrow-tooltip-component-false"]')
      .eq(2)
      .should('exist');
  });

  it('should display correct entity count', () => {
    // Check that the entity count has displayed correctly.
    cy.get('[aria-label="view-count"]')
      .should('be.visible')
      .contains('Results: 239');
  });

  it('should be able to click clear filters button to clear filters', () => {
    cy.url().then((url) => {
      cy.get('[data-testid="advanced-filters-link"]').click();
      cy.get('input[id="Title-filter"]').type('South');

      cy.get('[data-testid="card"]')
        .first()
        .contains(
          'Season identify professor happen third. Beat professional blue clear style have. Light final summer.'
        );

      cy.get('[data-testid="clear-filters-button"]').click();
      cy.url().should('eq', url);
    });
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
    cy.get('[aria-label="Go to selections"]', { timeout: 10000 }).contains(
      /^$/
    );

    cy.get('[aria-label="card-button-1"]', { timeout: 10000 }).eq(0).click();

    cy.get('[aria-label="Go to selections"]', { timeout: 10000 }).contains(
      /^1/
    );

    cy.get('[aria-label="card-button-1"]', { timeout: 10000 }).eq(1).click();

    cy.get('[aria-label="Go to selections"]', { timeout: 10000 }).contains(
      /^2/
    );
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
        expect(text.trim()).equal('1 item has been added to selection.');
      });
    cy.get('[aria-label="selection-alert-close"]').click();
    cy.get('[aria-label="selection-alert"]', { timeout: 10000 }).should(
      'not.exist'
    );
  });

  it('should display tooltips correctly', () => {
    // The hover tool tip has an enter delay of 500ms.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="card"]')
      .get('[data-testid="investigation-card-title"]')
      .first()
      .trigger('mouseover', { force: true })
      .wait(700)
      .get('[data-testid="arrow-tooltip-component-true"]')
      .should('exist');
  });

  it('should not display tooltips after making the window bigger', () => {
    cy.viewport(3500, 750);

    // The hover tool tip has an enter delay of 500ms and also need to
    // wait after the viewport change as it takes a moment to resize
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(200)
      .get('[data-testid="card"]')
      .get('[data-testid="investigation-card-title"]')
      .first()
      .trigger('mouseover', { force: true })
      .wait(700)
      .get('[data-testid="arrow-tooltip-component-true"]')
      .should('not.exist');
  });
});
