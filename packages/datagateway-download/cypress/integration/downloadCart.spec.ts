describe('Download Cart', () => {
  before(() => {
    // Ensure the download cart is cleared before running tests.
    cy.login('root', 'pw');
    cy.clearDownloadCart();
  });

  beforeEach(() => {
    Cypress.currentTest.retries(2);
    cy.server();
    cy.route('GET', '**/topcat/user/cart/**').as('fetchCart');
    cy.route('GET', '**/topcat/user/downloads**').as('fetchDownloads');
    cy.login('root', 'pw');

    cy.seedDownloadCart().then(() => {
      cy.visit('/');
      cy.wait('@fetchCart');
    });
  });

  afterEach(() => {
    cy.clearDownloadCart();

    // Ensure to clear sessionStorage to prevent the app
    // storing tab data.
    sessionStorage.clear();
  });

  it('should load correctly and display cart items', () => {
    cy.title().should('equal', 'DataGateway Download');
    cy.get('#datagateway-download').should('be.visible');

    // Ensure we can move away from the table and come back to it.
    cy.get('[aria-label="Download cart panel"]').should('exist');
    cy.get('[aria-label="Downloads tab"]')
      .should('exist')
      .click();

    // Wait for the downloads to be fetched before moving back to the cart.
    cy.wait('@fetchDownloads');
    cy.get('[aria-label="Download status panel"]').should('exist');

    cy.get('[aria-label="Cart tab').click();
    cy.get('[aria-label="Download cart panel"]').should('exist');

    cy.get('[aria-rowcount=59]', { timeout: 10000 }).should('exist');
  });

  it('should be able to sort cart items by name and type', () => {
    cy.get('[aria-rowindex=1] [aria-colindex=1]')
      .invoke('text')
      .as('unsortedFirstItem');

    cy.contains('[role="button"]', 'Name').click();
    cy.get('[aria-rowindex=1] [aria-colindex=1]').should(
      'have.text',
      'DATASET 1'
    );

    cy.contains('[role="button"]', 'Name').click();
    cy.get('[aria-rowindex=1] [aria-colindex=1]').should(
      'have.text',
      'INVESTIGATION 9'
    );

    cy.contains('[role="button"]', 'Name').click();
    cy.get('[aria-rowindex=1] [aria-colindex=1]')
      .invoke('text')
      .then(currText => {
        cy.get('@unsortedFirstItem').should('eq', currText);
      });

    cy.contains('[role="button"]', 'Type').click();
    cy.get('[aria-rowindex=1] [aria-colindex=2]').should(
      'have.text',
      'dataset'
    );

    cy.contains('[role="button"]', 'Type').click();
    cy.get('[aria-rowindex=1] [aria-colindex=2]').should(
      'have.text',
      'investigation'
    );

    cy.contains('[role="button"]', 'Name').click();
    cy.get('[aria-rowindex=1] [aria-colindex=1]').should(
      'have.text',
      'INVESTIGATION 10'
    );
  });

  it('should be able to filter cart items by name and type', () => {
    cy.get('[aria-label="Filter by Name"]')
      .find('input')
      .as('nameFilter');

    cy.get('@nameFilter').type('1');
    cy.get('[aria-rowcount=13]').should('exist');
    cy.contains('DATASET 31').should('be.visible');

    cy.get('[aria-label="Filter by Type"]')
      .find('input')
      .as('typeFilter');

    cy.get('@typeFilter').type('in');
    cy.get('[aria-rowcount=8]').should('exist');
    cy.contains('INVESTIGATION 16').should('be.visible');

    cy.contains('[role="button"]', 'Name').click();
    cy.get('@nameFilter').type('{backspace}');
    cy.get('[aria-rowcount=29]').should('exist');
    cy.contains('INVESTIGATION 2').should('be.visible');
  });

  it('should be able to remove individual items from the cart', () => {
    cy.route('DELETE', '**/topcat/user/cart/**').as('removeFromCart');
    cy.contains('[role="button"]', 'Name').click();
    cy.contains('Calculating...', { timeout: 10000 }).should('not.exist');

    cy.contains(/^DATASET 1$/).should('be.visible');
    cy.get('[aria-label="Remove DATASET 1 from cart"]').click();
    cy.contains(/^DATASET 1$/).should('not.be.visible');
    cy.get('[aria-rowcount=58]').should('exist');

    cy.wait('@removeFromCart').then(xhr =>
      expect(xhr.response.body.cartItems.map(x => x.name)).to.not.include(
        'DATASET 1'
      )
    );
  });

  it('should be able to remove all items from the cart', () => {
    cy.route('DELETE', '**/topcat/user/cart/**').as('removeFromCart');
    cy.contains('[role="button"]', 'Name').click();

    cy.contains(/^DATASET 1$/).should('be.visible');
    cy.contains('Remove All').click();
    cy.contains(/^DATASET 1$/).should('not.be.visible');
    cy.get('[aria-rowcount=0]').should('exist');

    cy.wait('@removeFromCart').then(
      xhr => expect(xhr.response.body.cartItems).to.be.empty
    );
  });

  it('should be able open the download confirmation dialog', () => {
    cy.contains('Calculating...', { timeout: 10000 }).should('not.exist');
    cy.contains('Download Cart').click();

    cy.get('[aria-label="download-confirm-dialog"]').should('exist');
  });
});
