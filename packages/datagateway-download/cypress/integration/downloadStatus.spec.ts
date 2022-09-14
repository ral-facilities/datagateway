import { format } from 'date-fns-tz';

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

      cy.get('[aria-label="Downloads"]').should('exist');
      cy.get('[aria-label="Downloads"]')
        .click()
        .then(() => {
          cy.wait('@fetchDownloads');
        });
    });
  });

  it('should load correctly and display download status table', () => {
    cy.title().should('equal', 'DataGateway Download');
    cy.get('#datagateway-download').should('be.visible');

    cy.get('[aria-label="Download status panel"]').should('exist');
  });

  it('should refresh the table when clicking the refresh downloads button', () => {
    cy.get('[aria-label="Refresh Downloads"]')
      .next()
      .children()
      .first()
      .then(($refreshTimeElem) => {
        cy.wrap($refreshTimeElem.text()).as('lastRefreshTime');
      });

    cy.get('[aria-label="Refresh download status table"]').should('exist');
    cy.get('[aria-label="Refresh download status table"]').click();

    cy.get('[aria-label="Refresh Downloads"]')
      .next()
      .children()
      .first()
      .then(($refreshTimeElem) => {
        cy.get('@lastRefreshTime').should('not.equal', $refreshTimeElem.text());
      });
  });

  describe('should be able to sort download items by', () => {
    it('ascending order', () => {
      // Table is sorted by Requested Date by default. To keep working test, we will remove all sorts on the table beforehand
      cy.contains('[role="button"]', 'Requested Date').click();

      cy.contains('[role="button"]', 'Download Name').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');

      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
        'have.text',
        'test-file-1'
      );
    });

    it('descending order', () => {
      // Table is sorted by Requested Date by default. To keep working test, we will remove all sorts on the table beforehand
      cy.contains('[role="button"]', 'Requested Date').click();

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
      // Table is sorted by Requested Date by default. To keep working test, we will remove all sorts on the table beforehand
      cy.contains('[role="button"]', 'Requested Date').click();

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
        'test-file-1'
      );

      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').should(
        'have.text',
        'Available'
      );
    });

    it('multiple columns', () => {
      // Table is sorted by Requested Date by default. To keep working test, we will remove all sorts on the table beforehand
      cy.contains('[role="button"]', 'Requested Date').click();

      cy.contains('[role="button"]', 'Access Method').click();
      cy.contains('[role="button"]', 'Availability').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
        'have.text',
        'test-file-4'
      );
    });
  });

  describe('should be able to filter download items by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Download Name"]').first().type('4');

      cy.get('[aria-rowcount="1"]').should('exist');

      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
        'have.text',
        'test-file-4'
      );
    });

    it.only('date between', () => {
      cy.get('input[id="Requested Date filter from"]').type('2020-01-31 00:00');

      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - 1);
      // MUIv5 datetime pickers don't allow for time to be graphically selected
      // This is because the relevant elements are <span> elements with pointer-events: none
      // Therefore, we settle for typing the date and time instead
      cy.get('input[id="Requested Date filter to"]').type(
        format(date, 'yyyy-MM-dd HH:mm')
      );

      // There should not be results for this time period.
      cy.get('[aria-rowcount="0"]').should('exist');

      const currDate = new Date();
      const assertDate = new Date(currDate.toString());

      cy.get('input[id="Requested Date filter from"]').clear();
      cy.get('input[id="Requested Date filter to"]').clear();
      cy.get('[aria-rowcount="4"]').should('exist');

      // Set currDate time to 00:00 before typing into Requested Date From textbox
      currDate.setHours(0, 0, 0, 0)

      cy.get('input[id="Requested Date filter from"]').type(
        format(currDate, 'yyyy-MM-dd HH:mm')
      );

      cy.get('[aria-rowcount="4"]').should('exist');

      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').should(
        'have.text',
        format(assertDate, 'yyyy-MM-dd HH:mm:ss')
      );
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Access Method"]').first().type('globus');

      cy.get('[aria-label="Filter by Availability"]').first().type('restoring');

      cy.get('[aria-rowcount="2"]').should('exist');
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
