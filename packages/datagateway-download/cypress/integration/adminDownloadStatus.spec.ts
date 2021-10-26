describe('Admin Download Status', () => {
  before(() => {
    // Ensure the downloads are cleared before running tests.
    cy.login({ username: 'root', password: 'pw', mechanism: 'simple' });

    // Seed the initial downloads.
    cy.clearDownloads();
  });

  beforeEach(() => {
    cy.intercept('GET', '**/topcat/admin/downloads**').as(
      'fetchAdminDownloads'
    );

    cy.login({ username: 'root', password: 'pw', mechanism: 'simple' });

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
    cy.get('[aria-rowindex="1"] [aria-colindex="4"]')
      .find('p')
      .should(($preparedId) => {
        expect($preparedId[0].textContent).match(
          /[0-9a-zA-Z]{8}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{12}/
        );
      });

    cy.get('[aria-label="Refresh download status table"]').click();

    cy.get('[aria-rowindex="1"] [aria-colindex="4"]')
      .find('p')
      .should(($preparedId) => {
        expect($preparedId[0].textContent).match(
          /[0-9a-zA-Z]{8}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{12}/
        );
      });
  });

  it('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]', { timeout: 30000 }).should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]', { timeout: 30000 }).should('exist');
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
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]')
        .find('p')
        .should(($preparedId) => {
          expect($preparedId[0].textContent).match(
            /[0-9a-zA-Z]{8}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{4}\-[0-9a-zA-Z]{12}/
          );
        });
    });

    it('multiple columns', () => {
      cy.get('.react-draggable')
        .eq(4)
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 550 })
        .trigger('mouseup');
      cy.contains('[role="button"]', 'Access Method').click();

      cy.get('.react-draggable')
        .eq(2)
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 400 })
        .trigger('mouseup');
      cy.contains('[role="button"]', 'Username').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="5"]').should(
        'have.text',
        'globus'
      );
    });
  });

  describe('should be able to filter download items by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Availability"]')
        .first()
        .type('Available', { force: true });

      cy.get('[aria-rowindex="1"] [aria-colindex="6"]').should(
        'have.text',
        'Available'
      );
    });

    it('date between', () => {
      const currDate = new Date();

      cy.get('input[id="Requested Date filter from"]').type(
        currDate.toISOString().slice(0, 10)
      );

      cy.get('input[id="Requested Date filter to"]').type(
        currDate.toISOString().slice(0, 10)
      );

      cy.get('[aria-rowcount="0"]').should('not.exist');
    });

    it('multiple columns', () => {
      cy.get('[role="columnheader"]').eq(4).as('accessColumn');
      cy.get('[role="columnheader"]').eq(5).as('availabilityColumn');

      cy.get('.react-draggable')
        .eq(4)
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 500 })
        .trigger('mouseup');

      cy.get('.react-draggable')
        .eq(5)
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 700 })
        .trigger('mouseup');

      cy.get('[aria-label="Filter by Access Method')
        .first()
        .type('globus', { force: true });
      cy.get('[aria-label="Filter by Availability"]')
        .first()
        .type('restoring', { force: true });

      cy.get('[aria-rowindex="1"] [aria-colindex="5"]').should(
        'have.text',
        'globus'
      );
    });
  });
});
