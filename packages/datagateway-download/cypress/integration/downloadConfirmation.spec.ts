describe('Download Confirmation', () => {
  before(() => {
    // Ensure the download cart is cleared before running tests.
    cy.login();
    cy.clearDownloadCart();
  });

  beforeEach(() => {
    // Manually override the time, so we know what date/time to expect for downloads.
    cy.clock(Date.UTC(2020, 0, 1, 1, 1, 1), ['Date']);

    cy.intercept('GET', '**/ids/isTwoLevel').as('fetchIsTwoLevel');
    cy.intercept('GET', '**/topcat/user/cart/**').as('fetchCart');
    cy.login();

    // Ensure the cart is clear before running tests.
    cy.clearDownloadCart();

    cy.addCartItem('investigation 1').then(() => {
      cy.visit('/download');
      cy.wait('@fetchIsTwoLevel');
      cy.wait('@fetchCart', { timeout: 10000 });
    });

    // Open the confirmation dialog and confirm it is present.
    cy.contains('Download Selection').click();
    cy.get('[aria-label="Download confirmation dialog"]').should('exist');
  });

  afterEach(() => {
    // Clear the session storage to avoid storing the current tab information.
    sessionStorage.clear();
  });

  it('should load correctly and display the confirmation dialog for the cart items', () => {
    // Show the correct download size of the cart items.
    cy.contains('Download Size: 10.25 GB').should('exist');

    // Shows HTTPS as the default access method.
    cy.contains('#confirm-access-method', 'HTTPS').should('exist');

    // Shows the estimated download times in the table.
    cy.get('#download-table').should('exist');
    cy.contains(
      '#download-table-one',
      '23 hours, 19 minutes, 46 seconds'
    ).should('exist');
    cy.contains('#download-table-thirty', '46 minutes, 39 seconds').should(
      'exist'
    );
    cy.contains('#download-table-hundred', '13 minutes, 59 seconds').should(
      'exist'
    );
  });

  it('should prevent download requests with an invalid email address', () => {
    // Enter in an invalid email address.
    cy.get('#confirm-download-email').type('email.address');

    // Ensure that the download button is disabled.
    cy.get('#download-confirmation-download').should('be.disabled');

    // Complete the remainder of the email and ensure the email is not invalid anymore
    // as the download button is enabled.
    cy.get('#confirm-download-email').type('@test.com');
    cy.get('#download-confirmation-download').should('be.enabled');
  });

  it('should be able to submit a download request and start immediate download with default values (HTTPS)', () => {
    // Ensure our access method is HTTPS before starting an immediate download.
    cy.contains('#confirm-access-method', 'HTTPS').should('exist');

    // Click on the download button.
    cy.get('#download-confirmation-download').click();

    // Ensure the correct message and download details are shown.
    cy.contains(
      '#download-confirmation-success',
      'Successfully submitted download request'
    ).should('exist');

    cy.contains('#confirm-success-download-name', 'LILS_2020-1-1_1-1-1').should(
      'exist'
    );
    cy.contains('#confirm-success-access-method', 'HTTPS').should('exist');
  });

  it('should not be able to submit a download request with a disabled access method (Globus)', () => {
    // Select the "Globus" option.
    cy.get('#confirm-access-method').should('exist');
    cy.get('#confirm-access-method').select('Globus');

    // Ensure the globus access method has the disabled message.
    cy.contains(
      '#confirm-access-method-help',
      'GLOBUS has been disabled for testing'
    ).should('exist');

    // The download button should be disabled.
    cy.get('#download-confirmation-download').should('be.disabled');
  });

  it('should show download confirmation unsuccessful if no download information was received', () => {
    // We will force download information to not be returned by clearing cart,
    // but in the event a request which fails this will be shown.
    cy.clearDownloadCart();

    // Click on the download button.
    cy.get('#download-confirmation-download').click();

    cy.contains(
      '#download-confirmation-unsuccessful',
      'Your download request was unsuccessful'
    ).should('exist');
  });

  it('should be able to submit a download request with custom values', () => {
    // Set download name.
    cy.get('#confirm-download-name').type('test-file-name');

    // Set email address.
    cy.get('#confirm-download-email').type('test@email.com');

    // Request download.
    cy.get('#download-confirmation-download').click();

    cy.contains(
      '#download-confirmation-success',
      'Successfully submitted download request'
    ).should('exist');

    // Ensure the download name, access method and email address match that of which we changed.
    cy.contains('#confirm-success-download-name', 'test-file-name').should(
      'exist'
    );
    cy.contains('#confirm-success-access-method', 'HTTPS').should('exist');
    cy.contains('#confirm-success-email-address', 'test@email.com').should(
      'exist'
    );
  });

  // This needs to be implemented once the tab has been included into the code.
  it('should be able to link to the downloads status tab upon successful download confirmation', () => {
    cy.get('#download-confirmation-download').click();

    cy.get('#download-confirmation-success').should('exist');

    // Click on the download status link and expect the download
    // status panel to have been displayed.
    cy.contains('#download-confirmation-status-link', 'View My Downloads')
      .should('exist')
      .click();
    cy.get('[aria-label="Download status panel"]').should('exist');
  });

  it('should be able to close the download confirmation dialog', () => {
    cy.get('[aria-label="Close download confirmation dialog"]').should('exist');

    cy.get('[aria-label="Close download confirmation dialog"]').click();

    cy.get('[aria-label="Download confirmation dialog"]').should('not.exist');
  });
});
