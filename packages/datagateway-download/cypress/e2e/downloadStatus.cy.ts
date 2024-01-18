import { format } from 'date-fns-tz';

describe('Download Status', () => {
  before(() => {
    // Ensure the downloads are cleared before running tests.
    cy.login();

    // Seed the initial downloads.
    cy.clearDownloads();
  });

  beforeEach(() => {
    cy.intercept('GET', '**/getPercentageComplete**', '100');
    cy.intercept('GET', '**/topcat/user/downloads**').as('fetchDownloads');
    cy.login();

    // Ensure the downloads are cleared before running tests.
    cy.clearDownloads();

    cy.seedDownloads().then(() => {
      cy.visit('/download');

      cy.get('[aria-label="Downloads"]').should('exist');
      cy.get('[aria-label="Downloads"]').click();
      cy.wait('@fetchDownloads');
    });
  });

  it('should load correctly and display download status table & show correct info & links', () => {
    cy.title().should('equal', 'DataGateway Download');
    cy.get('#datagateway-download').should('be.visible');

    cy.get('[aria-label="Download status panel"]').should('exist');

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

  it('should refresh the table when clicking the refresh downloads button', () => {
    cy.get('[aria-label="Refresh Downloads"]')
      .next()
      .children()
      .first()
      .then(($refreshTimeElem) => {
        cy.wrap($refreshTimeElem.text()).as('lastRefreshTime');
      });

    // fake the clock to advance time forward by 5 mins
    cy.clock(Date.now());
    cy.tick(5 * 60 * 1000);

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

  it('should be able to sort by all sort directions on single and multiple columns', () => {
    // remove default sort
    cy.contains('[role="button"]', 'Requested Date').click();

    // ascending
    cy.contains('[role="button"]', 'Download Name')
      .as('nameSortButton')
      .click();

    cy.get('[aria-sort="ascending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');

    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
      'have.text',
      'test-file-1'
    );

    // descending
    cy.get('@nameSortButton').click();

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

    // no order
    cy.get('@nameSortButton').click();

    cy.get('[aria-sort="ascending"]').should('not.exist');
    cy.get('[aria-sort="descending"]').should('not.exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.exist');

    cy.get('[data-testid="SortIcon"]').should('have.length', 4);
    cy.get('[data-testid="ArrowUpwardIcon"]').should('not.exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
      'have.text',
      'test-file-1'
    );

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').should(
      'have.text',
      'Available'
    );

    // multiple columns (shift + click)
    cy.contains('[role="button"]', 'Download Name').click();
    cy.contains('[role="button"]', 'Availability').click({ shiftKey: true });
    cy.get('[aria-sort="ascending"]').should('have.length', 2);

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Available');

    // should replace previous sort when clicked without shift
    cy.contains('[role="button"]', 'Access Method').click();
    cy.get('[aria-sort="ascending"]').should('have.length', 1);
    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains('test-file-2');
  });

  it('should change icons when sorting on a column', () => {
    // clear default sort
    cy.contains('[role="button"]', 'Requested Date').click();

    cy.get('[data-testid="SortIcon"]').should('have.length', 4);

    // check icon when clicking on a column
    cy.contains('[role="button"]', 'Download Name').click();
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('exist');

    // check icon when clicking on a column again
    cy.contains('[role="button"]', 'Download Name').click();
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.exist');

    // check icon when hovering over a column
    cy.contains('[role="button"]', 'Access Method').trigger('mouseover');
    cy.get('[data-testid="ArrowUpwardIcon"]').should('have.length', 1);
    cy.get('[data-testid="ArrowDownwardIcon"]').should('have.length', 1);

    // check icons when shift is held
    cy.get('.App').trigger('keydown', { key: 'Shift' });
    cy.get('[data-testid="AddIcon"]').should('have.length', 2);
  });

  it('should be able to filter with both text & date filters on multiple columns', () => {
    cy.get('input[id="Requested Date filter from"]').type(
      '2020-01-31 00:00:00'
    );

    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - 1);
    // MUIv5 datetime pickers don't allow for time to be graphically selected
    // This is because the relevant elements are <span> elements with pointer-events: none
    // Therefore, we settle for typing the date and time instead
    cy.get('input[id="Requested Date filter to"]').type(
      format(date, 'yyyy-MM-dd HH:mm:ss')
    );

    // There should not be results for this time period.
    cy.get('[aria-rowcount="0"]').should('exist');

    const currDate = new Date();
    currDate.setHours(0, 0, 0, 0);

    cy.get('input[id="Requested Date filter from"]').clear();
    cy.get('input[id="Requested Date filter to"]').clear();
    cy.get('[aria-rowcount="4"]').should('exist');

    cy.get('input[id="Requested Date filter from"]').type(
      format(currDate, 'yyyy-MM-dd HH:mm:ss')
    );

    cy.get('[aria-rowcount="4"]').should('exist');

    // account for whether the download progress feature is enabled or not
    cy.get('[role="columnheader"]')
      .eq(3)
      .then(($fourthColHeader) => {
        if ($fourthColHeader.text().includes('Progress')) {
          cy.get('[aria-rowindex="1"] [aria-colindex="5"]').should(
            'contain',
            format(currDate, 'yyyy-MM-dd')
          );
        } else {
          cy.get('[aria-rowindex="1"] [aria-colindex="4"]').should(
            'contain',
            format(currDate, 'yyyy-MM-dd')
          );
        }
      });

    cy.get('[aria-label="Filter by Access Method"]').first().type('globus');

    cy.get('[aria-rowcount="2"]').should('exist');

    cy.get('[aria-label="Filter by Availability"]').first().type('restoring');

    cy.get('[aria-rowcount="1"]').should('exist');
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
