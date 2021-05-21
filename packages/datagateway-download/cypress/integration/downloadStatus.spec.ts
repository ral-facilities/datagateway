describe('Download Status', () => {
  before(() => {
    // Ensure the downloads are cleared before running tests.
    cy.login();

    // Seed the initial downloads.
    cy.clearDownloads();
  });

  beforeEach(() => {
    cy.intercept('GET', '**/topcat/user/downloads**').as('fetchDownloads');
    cy.login();

    // Ensure the downloads are cleared before running tests.
    cy.clearDownloads();

    cy.seedDownloads().then(() => {
      cy.visit('/download');

      cy.get('[aria-label="Downloads tab"]').should('exist');
      cy.get('[aria-label="Downloads tab"]')
        .click()
        .then(() => {
          cy.wait('@fetchDownloads');
        });
    });
  });

  afterEach(() => {
    // Ensure to clear sessionStorage to prevent the app
    // storing tab data.
    sessionStorage.clear();
  });

  it('should load correctly and display download status table', () => {
    cy.title().should('equal', 'DataGateway Download');
    cy.get('#datagateway-download').should('be.visible');

    cy.get('[aria-label="Download status panel"]').should('exist');
  });

  it('should refresh the table when clicking the refresh downloads button', () => {
    cy.get('[aria-label="Refresh download status table"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
      'have.text',
      'test-file-4'
    );
    cy.get('[aria-label="Refresh download status table"]').click();
  });

  describe('should be able to sort download items by', () => {
    it('ascending order', () => {
      cy.contains('[role="button"]', 'Download Name').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');

      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
        'have.text',
        'test-file-1'
      );
    });

    it('descending order', () => {
      cy.contains('[role="button"]', 'Download Name').click();
      cy.contains('[role="button"]', 'Download Name').click();

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
        'have.text',
        'test-file-4'
      );

      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').should(
        'have.text',
        'Expired'
      );
    });

    it('no order', () => {
      cy.contains('[role="button"]', 'Download Name').click();
      cy.contains('[role="button"]', 'Download Name').click();
      cy.contains('[role="button"]', 'Download Name').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
        'have.text',
        'test-file-4'
      );

      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').should(
        'have.text',
        'Expired'
      );
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Requested Date').click();
      cy.contains('[role="button"]', 'Availability').click().wait(4000);

      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
        'have.text',
        'test-file-1'
      );
    });
  });

  describe('should be able to filter download items by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Download Name"]')
        .find('input')
        .first()
        .type('file');

      cy.get('[aria-rowcount="4"]').should('exist');

      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').should(
        'have.text',
        'Expired'
      );
    });

    it('date between', () => {
      cy.get('[aria-label="Requested Date date filter from"]').type(
        '2020-01-31'
      );

      let date = new Date();
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();

      cy.get('[aria-label="Requested Date date filter to"]')
        .parent()
        .find('button')
        .click();

      cy.contains(`${month} ${year}`)
        .parent()
        .parent()
        .find('button')
        .first()
        .click();

      cy.get('.MuiPickersDay-day[tabindex="0"]')
        .first()
        .click();

      cy.contains('OK').click();

      date.setDate(1);
      date.setMonth(date.getMonth() - 1);

      cy.get('[aria-label="Requested Date date filter to"]').should(
        'have.value',
        date.toISOString().slice(0, 10)
      );

      // There should not be results for this time period.
      cy.get('[aria-rowcount="0"]').should('exist');

      let currDate = new Date();

      cy.get('[aria-label="Requested Date date filter from"]').clear();
      cy.get('[aria-label="Requested Date date filter to"]').clear();
      cy.get('[aria-rowcount="4"]').should('exist');

      cy.get('[aria-label="Requested Date date filter from"]').type(
        currDate.toISOString().slice(0, 10)
      );

      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
        'have.text',
        'test-file-4'
      );

      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').should(
        'have.text',
        'globus'
      );

      cy.get('[aria-rowcount="4"]').should('exist');
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Access Method')
        .find('input')
        .first()
        .type('globus');

      cy.get('[aria-label="Filter by Availability"]')
        .find('input')
        .first()
        .type('restoring');

      cy.get('[aria-rowcount="1"]').should('exist');
    });
  });

  it('should have a download link for an item', () => {
    cy.contains('[aria-colindex="1"]', 'test-file-1')
      .should('be.visible')
      .and('not.be.disabled');

    // We are not clicking and proceeding to download the item in this test
    // but instead checking that the link exists and it is possible to be clicked.
    cy.get('a[aria-label="Download test-file-1"]').should('not.be.empty');
    cy.get('a[aria-label="Download test-file-1"]')
      .should('have.prop', 'href')
      .and('contain', 'getData');
  });

  it('should be able to remove a download', () => {
    cy.intercept('PUT', '**/topcat/user/download/*/isDeleted').as(
      'removeFromDownloads'
    );

    cy.contains('[aria-colindex="1"]', 'test-file-4').should('be.visible');
    cy.get('[aria-label="Remove test-file-4 from downloads"]').click({
      force: true,
    });
    cy.wait('@removeFromDownloads');
    cy.contains('test-file-4').should('not.exist');
  });
});
