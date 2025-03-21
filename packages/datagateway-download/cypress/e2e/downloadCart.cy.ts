describe('Download Cart', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/topcat/user/cart/**').as('fetchCart');
    cy.intercept('GET', '**/topcat/user/downloads**').as('fetchDownloads');
    cy.login();
    cy.clearDownloadCart();

    cy.seedDownloadCart().then(() => {
      cy.visit('/download').wait('@fetchCart');
    });
  });

  afterEach(() => {
    cy.clearDownloadCart();
  });

  it('should load correctly and display cart items', () => {
    cy.title().should('equal', 'DataGateway Download');
    cy.get('#datagateway-download').should('be.visible');

    // Ensure we can move away from the table and come back to it.
    cy.get('[aria-label="Download selection panel"]').should('exist');
    // Wait for the downloads to be fetched before moving back to the cart.
    cy.get('[aria-label="Downloads"]').should('exist').click();
    cy.wait('@fetchDownloads');
    cy.get('[aria-label="Download status panel"]').should('exist');

    cy.get('[aria-label="Selection').click();
    cy.wait('@fetchCart');
    cy.get('[aria-label="Download selection panel"]').should('exist');

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
      'INVESTIGATION 8'
    );

    cy.contains('[role="button"]', 'Name').click();
    cy.get('[aria-rowindex=1] [aria-colindex=1]')
      .invoke('text')
      .then((currText) => {
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

    // multisort with shift key
    cy.contains('[role="button"]', 'Name').click({ shiftKey: true });
    cy.get('[aria-rowindex=1] [aria-colindex=1]').should(
      'have.text',
      'INVESTIGATION 10'
    );

    // replace previous sory by clicking without shift key
    cy.contains('[role="button"]', 'Name').click();
    cy.get('[aria-rowindex=1] [aria-colindex=1]').should(
      'have.text',
      'INVESTIGATION 8'
    );
  });

  it('should be able to filter cart items by name and type', () => {
    // sort by name to have consistency
    cy.contains('[role="button"]', 'Name').click();

    cy.findByRole('textbox', { name: 'Filter by Name' }).as('nameFilter');

    cy.get('@nameFilter')
      .parent()
      .findByRole('button', { name: 'include, exclude or exact' })
      .as('nameFilterOptionsButton')
      .click();

    cy.findByRole('option', { name: 'Exact' }).click();

    // test exact filter
    cy.get('@nameFilter').type('DATASET 1', { delay: 0 });

    cy.get('[aria-rowcount=1]').should('exist');
    cy.findByRole('gridcell', { name: 'DATASET 1' }).should('exist');
    cy.findByRole('gridcell', { name: 'DATASET 11' }).should('not.exist');

    // test exclude filter
    cy.get('@nameFilterOptionsButton').click();
    cy.findByRole('option', { name: 'Exclude' }).click();

    cy.findByRole('gridcell', { name: 'DATASET 1' }).should('not.exist');
    cy.findByRole('gridcell', { name: 'DATASET 11' }).should('not.exist');
    cy.findByRole('gridcell', { name: 'DATASET 21' }).should('exist');

    // test include filter
    cy.get('@nameFilterOptionsButton').click();
    cy.findByRole('option', { name: 'Include' }).click();

    cy.get('[aria-rowcount=6]').should('exist');
    cy.findByRole('gridcell', { name: 'DATASET 1' }).should('exist');
    cy.findByRole('gridcell', { name: 'DATASET 11' }).should('exist');

    cy.get('@nameFilter').clear();
    cy.get('@nameFilter').type('1');
    cy.get('[aria-rowcount=15]').should('exist');

    cy.findByRole('textbox', { name: 'Filter by Type' }).as('typeFilter');

    cy.get('@typeFilter').type('in');
    cy.get('[aria-rowcount=5]').should('exist');
    cy.findByRole('gridcell', { name: 'INVESTIGATION 16' }).should('exist');

    cy.get('@nameFilter').type('{backspace}');
    cy.get('[aria-rowcount=29]').should('exist');
    cy.findByRole('gridcell', { name: 'INVESTIGATION 2' }).should('exist');
  });

  it('should be able to remove individual items from the cart', () => {
    cy.intercept('DELETE', '**/topcat/user/cart/**').as('removeFromCart');
    cy.contains('[role="button"]', 'Name').click();

    cy.contains(/^DATASET 1$/).should('be.visible');
    cy.get('[aria-label="Remove DATASET 1 from selection"]').click();
    cy.contains(/^DATASET 1$/).should('not.exist');
    cy.get('[aria-rowcount=58]').should('exist');

    cy.wait('@removeFromCart').then((xhr) =>
      expect(xhr.response.body.cartItems.map((x) => x.name)).to.not.include(
        'DATASET 1'
      )
    );
  });

  it('should be able to remove all items from the cart', () => {
    cy.intercept('DELETE', '**/topcat/user/cart/**').as('removeFromCart');
    cy.contains('[role="button"]', 'Name').click();

    cy.contains(/^DATASET 1$/).should('be.visible');
    cy.contains('Remove All').click();
    cy.contains(/^DATASET 1$/).should('not.exist');

    //Check no selections message is displayed
    cy.get('[data-testid="no-selections-message"]').should('exist');

    cy.wait('@removeFromCart').then(
      (xhr) => expect(xhr.response.body.cartItems).to.be.empty
    );
  });

  it('should be able open and close the download confirmation dialog', () => {
    cy.get('[aria-label="Calculating"]', { timeout: 20000 }).should(
      'not.exist'
    );
    cy.contains('Download Selection').click();

    cy.get('[aria-label="Download confirmation dialog"]').should('exist');
    cy.get('[aria-label="Close download confirmation dialog"]')
      .should('exist')
      .click();
  });

  it('should not be able to mint an unmintable cart', () => {
    cy.get('[aria-label="Calculating"]', { timeout: 20000 }).should(
      'not.exist'
    );

    // this "button" is a link so can't actually be disabled, check pointer-events
    cy.contains('Generate DOI').should('have.css', 'pointer-events', 'none');
  });
});
