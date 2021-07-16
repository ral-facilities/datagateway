describe('Admin Download Status', () => {
  before(() => {
    // Ensure the downloads are cleared before running tests.
    cy.login({username: 'root', password: 'pw', mechanism: 'simple'});

    // Seed the initial downloads.
    cy.clearDownloads();
  });

  beforeEach(() => {
    cy.intercept('GET', '**/topcat/admin/downloads**').as(
      'fetchAdminDownloads'
    );

    cy.login({username: 'root', password: 'pw', mechanism: 'simple'});

    // Ensure the downloads are cleared before running tests.
    cy.clearDownloads();

    cy.seedDownloads().then(() => {
      cy.visit('/admin-download');
    });
  });

  afterEach(() => {
    // Ensure to clear sessionStorage to prevent the app
    // storing tab data.
    sessionStorage.clear();
  });

  it('should load correctly and display admin download status table', () => {
    cy.title().should('equal', 'DataGateway Download');
    cy.get('#datagateway-download').should('be.visible');
  });

  it('should refresh the table when clicking the refresh downloads button', () => {
    cy.get('[aria-label="Refresh download status table"]').should('exist');

    // Typical `.should('match'...)`  doesn't work for text, tries to match the element,
    // hence a slightly different approach for doing regex on the actual text
    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').find('p').should(($preparedId) => {
      expect($preparedId[0].textContent).match(
        /[0-9a-zA-Z]{8}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{12}/
      );
    });

    cy.get('[aria-label="Refresh download status table"]').click();

    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').find('p').should(($preparedId) => {
      expect($preparedId[0].textContent).match(
        /[0-9a-zA-Z]{8}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{12}/
      );
    });
  });

  describe('should be able to sort download items by', () => {
    it('ascending order', () => {
      cy.get('.react-draggable')
        .eq(4)
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 600 })
        .trigger('mouseup');
      cy.contains('[role="button"]', 'Access Method').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="5"]').should(
        'have.text',
        'globus'
      );
    });

    it('descending order', () => {
      cy.get('.react-draggable')
        .eq(4)
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 600 })
        .trigger('mouseup');
      cy.contains('[role="button"]', 'Access Method').click();
      cy.contains('[role="button"]', 'Access Method').click();

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
    });

    it('no order', () => {
      cy.get('.react-draggable')
        .eq(3)
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 500 })
        .trigger('mouseup');
      cy.contains('[role="button"]', 'Prepared ID').click();
      cy.contains('[role="button"]', 'Prepared ID').click();
      cy.contains('[role="button"]', 'Prepared ID').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').find('p').should(($preparedId) => {
        expect($preparedId[0].textContent).match(
          /[0-9a-zA-Z]{8}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{12}/
        );
      });
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Username').click();
      cy.get('.react-draggable')
        .eq(4)
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 600 })
        .trigger('mouseup');
      cy.contains('[role="button"]', 'Access Method').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="5"]').should(
        'have.text',
        'globus'
      );
    });
  });

  describe('should be able to filter download items by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Availability"]')
        .find('input')
        .first()
        .type('Available', { force: true });

      cy.get('[aria-rowindex="1"] [aria-colindex="6"]').should(
        'have.text',
        'Available'
      );
    });

    it.skip('date between', () => {
      // TODO: Test Requested Date fukter
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Access Method')
        .find('input')
        .first()
        .type('globus', { force: true });
      cy.get('[aria-label="Filter by Availability"]')
        .find('input')
        .first()
        .type('restoring', { force: true });

        cy.get('[aria-rowindex="1"] [aria-colindex="5"]').should(
          'have.text',
          'globus'
        );
    });
  });
});
