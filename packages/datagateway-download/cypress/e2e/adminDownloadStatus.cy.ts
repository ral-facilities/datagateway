describe('Admin Download Status', () => {
  beforeEach(() => {
    // set the viewport larger so all columns display nicely
    // and sort indicators aren't covered
    cy.viewport(1920, 1080);

    cy.intercept('GET', '**/getPercentageComplete**', '100');
    cy.intercept('GET', '**/topcat/admin/downloads**').as(
      'fetchAdminDownloads'
    );

    cy.login({ username: 'root', password: 'pw', mechanism: 'simple' });

    // Ensure the downloads are cleared before running tests.
    cy.clearDownloads();

    cy.seedDownloads().then(() => {
      cy.visit('/admin/download');

      cy.wait('@fetchAdminDownloads');
    });
  });

  it('should refresh the table when clicking the refresh downloads button', () => {
    cy.get('[aria-label="Refresh download status table"]').should('exist');

    cy.get('[aria-label="Refresh Downloads"]')
      .next()
      .then(($refreshTimeElem) => {
        cy.wrap($refreshTimeElem.text()).as('lastRefreshTime');
      });

    // fake the clock to advance time forward by 5 mins
    cy.clock(Date.now());
    cy.tick(5 * 60 * 1000);

    cy.get('[aria-label="Refresh download status table"]').click();

    cy.get('[aria-label="Refresh Downloads"]')
      .next()
      .then(($refreshTimeElem) => {
        cy.get('@lastRefreshTime').should('not.equal', $refreshTimeElem.text());
      });
  });

  it('should be able to sort by all sort directions on single and multiple columns', () => {
    // remove default sort
    cy.contains('[role="button"]', 'Requested Date').click();

    // ascending order
    cy.contains('[role="button"]', 'Access Method')
      .as('accessMethodSortButton')
      .click();

    cy.get('[aria-sort="ascending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
    cy.get('[aria-rowindex="1"] [aria-colindex="5"]').should(
      'have.text',
      'globus'
    );

    // descending order
    cy.get('@accessMethodSortButton').click();

    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
      'not.have.css',
      'opacity',
      '0'
    );
    cy.get('[aria-rowindex="1"] [aria-colindex="5"]').should(
      'have.text',
      'https'
    );

    // no order
    cy.get('@accessMethodSortButton').click();

    cy.get('[aria-sort="ascending"]').should('not.exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
      'have.css',
      'opacity',
      '0'
    );
    cy.get('[aria-rowindex="1"] [aria-colindex="5"]').should(
      'have.text',
      'https'
    );

    // multiple columns
    cy.contains('[role="button"]', 'Deleted').click();
    cy.contains('[role="button"]', 'Availability').click();

    cy.get('[aria-rowindex="2"] [aria-colindex="6"]').should(
      'have.text',
      'Available'
    );
    cy.get('[aria-rowindex="3"] [aria-colindex="6"]').should(
      'have.text',
      'Expired'
    );
  });

  it('should be able to filter with both text & date filters on multiple columns', () => {
    cy.get('[aria-rowcount]')
      .invoke('attr', 'aria-rowcount')
      .as('initialRowCount');
    const now = Date.now();
    // plus and minus 5 seconds from "now"
    const fromDate = new Date(now - 5000);
    const toDate = new Date(now + 5000);

    cy.get('input[id="Requested Date filter from"]').type(
      fromDate.toLocaleString('sv')
    );

    cy.get('input[id="Requested Date filter to"]').type(
      toDate.toLocaleString('sv')
    );

    cy.get('@initialRowCount').then((initialRowCount) => {
      cy.get(`[aria-rowcount="${initialRowCount}"]`).should('not.exist');
    });
    cy.get('[aria-rowcount="0"]').should('not.exist');

    cy.get('[aria-rowcount]')
      .invoke('attr', 'aria-rowcount')
      .as('dateFilterRowCount');

    cy.get('[aria-label="Filter by Availability"]')
      .first()
      .type('Available', { force: true });

    cy.get('[aria-rowindex="1"] [aria-colindex="6"]').should(
      'have.text',
      'Available'
    );

    cy.get('@dateFilterRowCount').then((dateFilterRowCount) => {
      cy.get(`[aria-rowcount="${dateFilterRowCount}"]`).should('not.exist');
    });
    cy.get('[aria-rowcount="0"]').should('not.exist');
  });
});
