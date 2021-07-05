describe('Admin Download Status', () => {
  before(() => {
    // Ensure the downloads are cleared before running tests.
    cy.login('root', 'pw');

    // Seed the initial downloads.
    cy.clearDownloads();
  });

  beforeEach(() => {
    cy.intercept('GET', '**/topcat/admin/downloads**').as(
      'fetchAdminDownloads'
    );

    cy.login('root', 'pw');

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
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').should(
      'have.text',
      '675eea67-bad7-4209-b54e-87f0d97eb50d'
    );

    cy.get('[aria-label="Refresh download status table"]').click();

    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').should(
      'have.text',
      '675eea67-bad7-4209-b54e-87f0d97eb50d'
    );
  });

  describe('should be able to sort download items by', () => {
    it('ascending order', () => {
      cy.get('.react-draggable')
        .eq(1)
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 300 })
        .trigger('mouseup');
      cy.contains('[role="button"]', 'Prepared ID').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').should(
        'have.text',
        '000137b1-9f20-4731-b48c-58a6effdd060'
      );
    });

    it.skip('descending order', () => {
      cy.get('.react-draggable')
        .eq(1)
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 300 })
        .trigger('mouseup');
      cy.contains('[role="button"]', 'Prepared ID').click();
      cy.contains('[role="button"]', 'Prepared ID').click();

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );

      // Skipping due to an incorrect expected result here
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').should(
        'have.text',
        'fffc2df5-bf1e-4403-8a9f-b75f1a0a4d57'
      );
    });

    it('no order', () => {
      cy.get('.react-draggable')
        .eq(1)
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 300 })
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
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').should(
        'have.text',
        '675eea67-bad7-4209-b54e-87f0d97eb50d'
      );
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Username').click();
      cy.contains('[role="button"]', 'Prepared ID').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').should(
        'have.text',
        '06bb426b-845f-486a-b5eb-10bfb7e8fb10'
      );
    });
  });

  describe('should be able to filter download items by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Prepared ID"]')
        .find('input')
        .first()
        .type('675eea67');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').should(
        'have.text',
        '675eea67-bad7-4209-b54e-87f0d97eb50d'
      );
    });

    it.skip('date between', () => {
      // TODO: Test Requested Date fukter
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

      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').should(
        'have.text',
        '9751a310-e489-4c56-a724-f91dd00cd54d'
      );
    });
  });
});
