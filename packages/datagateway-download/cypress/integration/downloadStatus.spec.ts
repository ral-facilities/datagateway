describe.only('Download Status', () => {
  beforeEach(() => {
    // Ensure the downloads are cleared before running tests.
    cy.login('user', 'password');

    Cypress.currentTest.retries(2);
    cy.visit('/');
    cy.get('[aria-label="Downloads tab"]').should('exist');
    cy.get('[aria-label="Downloads tab"]').click();
  });

  it('should load correctly and display download status table', () => {
    cy.title().should('equal', 'DataGateway Download');
    cy.get('#datagateway-download').should('be.visible');

    cy.get('[aria-label="Download status table"]').should('exist');
  });

  //   it('should refresh the table when clicking the refresh downloads button', () => {});

  describe('should be able to sort download items by', () => {
    it('ascending order', () => {
      cy.contains('[role="button"]', 'Download Name').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');

      // TODO: Update download name with new test entries.
      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
        'have.text',
        'LILS_2018-11-30_0-0-0'
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
        'test-file-name'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').should(
        'have.text',
        '2020-01-31 09:53:49'
      );
    });

    it('no order', () => {
      cy.contains('[role="button"]', 'Download Name').click();
      cy.contains('[role="button"]', 'Download Name').click();
      cy.contains('[role="button"]', 'Download Name').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.be.visible');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
        'have.text',
        'LILS_2019-12-16_17-15-13'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').should(
        'have.text',
        '2019-12-16 17:15:13'
      );
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Requested Date').click();
      cy.contains('[role="button"]', 'Availability').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').should(
        'have.text',
        'LILS_2019-12-16_17-15-13'
      );
    });
  });

  //   describe('should be able to filter download items by', () => {
  //     before(() => {});

  //     it('text', () => {

  //     });

  //     it('date between', () => {

  //     });

  //     it('multiple columns', () => {

  //     });
  //   });

  //   it('should be able to click to download an item', () => {

  //   });
});
