describe('Download Status', () => {
  before(() => {
    // Ensure the downloads are cleared before running tests.
    cy.login('download-e2e-tests', 'pw');
    // cy.seedDownloadCart();
    // cy.seedDownloads();
  });

  beforeEach(() => {
    // Cypress.currentTest.retries(2);
    cy.server();
    cy.route('GET', '**/topcat/user/downloads**').as('fetchDownloads');
    cy.visit('/');

    cy.get('[aria-label="Downloads tab"]').should('exist');
    cy.get('[aria-label="Downloads tab"]')
      .click()
      .then(() => {
        cy.wait('@fetchDownloads');
      });
  });

  // afterEach(() => {
  //   // cy.clearDownloads();

  //   // Ensure to clear sessionStorage to prevent the app
  //   // storing tab data.
  //   sessionStorage.clear();
  // });

  it('should load correctly and display download status table', () => {
    cy.title().should('equal', 'DataGateway Download');
    cy.get('#datagateway-download').should('be.visible');

    cy.get('[aria-label="Download status panel"]').should('exist');
  });

  // it('should refresh the table when clicking the refresh downloads button', () => {
  //   cy.get('[aria-label="Refresh download status table"]').should('exist');
  //   cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
  //     'have.text',
  //     'LILS_2019-12-16_17-15-13'
  //   );

  //   cy.get('[aria-label="Refresh download status table"]').click();
  // });

  // describe('should be able to sort download items by', () => {
  //   it('ascending order', () => {
  //     cy.contains('[role="button"]', 'Download Name').click();

  //     cy.get('[aria-sort="ascending"]').should('exist');
  //     cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');

  //     // TODO: Update download name with new test entries.
  //     cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
  //       'have.text',
  //       'LILS_2018-11-30_0-0-0'
  //     );
  //   });

  //   it('descending order', () => {
  //     cy.contains('[role="button"]', 'Download Name').click();
  //     cy.contains('[role="button"]', 'Download Name').click();

  //     cy.get('[aria-sort="descending"]').should('exist');
  //     cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
  //       'not.have.css',
  //       'opacity',
  //       '0'
  //     );
  //     cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
  //       'have.text',
  //       'test-file-name'
  //     );
  //     cy.get('[aria-rowindex="1"] [aria-colindex="4"]').should(
  //       'have.text',
  //       '2020-01-31 09:53:49'
  //     );
  //   });

  //   it('no order', () => {
  //     cy.contains('[role="button"]', 'Download Name').click();
  //     cy.contains('[role="button"]', 'Download Name').click();
  //     cy.contains('[role="button"]', 'Download Name').click();

  //     cy.get('[aria-sort="ascending"]').should('not.exist');
  //     cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.be.visible');
  //     cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
  //       'have.css',
  //       'opacity',
  //       '0'
  //     );
  //     cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
  //       'have.text',
  //       'LILS_2019-12-16_17-15-13'
  //     );
  //     cy.get('[aria-rowindex="1"] [aria-colindex="4"]').should(
  //       'have.text',
  //       '2019-12-16 17:15:13'
  //     );
  //   });

  //   it('multiple columns', () => {
  //     cy.contains('[role="button"]', 'Requested Date').click();
  //     cy.contains('[role="button"]', 'Availability').click();

  //     cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
  //       'have.text',
  //       'LILS_2019-12-16_17-15-13'
  //     );
  //   });
  // });

  // describe('should be able to filter download items by', () => {
  //   it('text', () => {
  //     cy.get('[aria-label="Filter by Download Name"]')
  //       .find('input')
  //       .type('file');

  //     // TODO: Rowcount will be unstable until we can clear and seed downloads.
  //     // cy.get('[aria-rowcount="3"]').should('exist');
  //     cy.get('[aria-rowindex="1"] [aria-colindex="4"]').should(
  //       'have.text',
  //       '2020-01-31 09:53:49'
  //     );
  //   });

  //   it('date between', () => {
  //     cy.get('[aria-label="Requested Date date filter from"]').type(
  //       '2020-01-31'
  //     );

  //     cy.get('[aria-label="Requested Date date filter to"]')
  //       .parent()
  //       .find('button')
  //       .click();

  //     cy.get('.MuiPickersDay-day[tabindex="0"]')
  //       .first()
  //       .click();

  //     cy.contains('OK').click();

  //     let date = new Date();
  //     date.setDate(1);

  //     cy.get('[aria-label="Requested Date date filter to"]').should(
  //       'have.value',
  //       date.toISOString().slice(0, 10)
  //     );

  //     // TODO: Rowcount will be unstable until we can clear and seed downloads.
  //     // cy.get('[aria-rowcount="3"]').should('exist');
  //     cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
  //       'have.text',
  //       'LILS_2020-1-1_1-1-1'
  //     );
  //     cy.get('[aria-rowindex="1"] [aria-colindex="4"]').should(
  //       'have.text',
  //       '2020-01-31 09:53:40'
  //     );
  //   });

  //   it('multiple columns', () => {
  //     cy.get('[aria-label="Filter by Access Method')
  //       .find('input')
  //       .type('globus');

  //     cy.get('[aria-label="Filter by Availability"]')
  //       .find('input')
  //       .type('RESTORING');

  //     // TODO: Rowcount will be unstable until we can clear and seed downloads.
  //     // cy.get('[aria-rowcount="1"]').should('exist');
  //   });
  // });

  // it('should be able to download an item', () => {});

  // it('should be able to remove a download', () => {
  //   cy.route('PUT', '**/topcat/user/download/*/isDeleted').as(
  //     'removeFromDownloads'
  //   );
  //   cy.setDownload(17, false);

  //   cy.contains('[aria-colindex="1"]', 'LILS_2019-12-18_17-2-44').should(
  //     'be.visible'
  //   );
  //   cy.get(
  //     '[aria-label="Remove LILS_2019-12-18_17-2-44 from downloads"]'
  //   ).click({ force: true });
  //   cy.wait('@removeFromDownloads');
  //   cy.contains('LILS_2019-12-18_17-2-44').should('not.be.visible');
  //   cy.setDownload(17, false);
  // });
});
