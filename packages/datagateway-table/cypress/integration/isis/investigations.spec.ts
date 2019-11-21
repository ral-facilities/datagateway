describe('ISIS - Investigations Table', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.clearDownloadCart();
    cy.visit('/browse/instrument/1/facilityCycle/14/investigation');
    cy.server();
    cy.route('**/investigations*').as('getInvestigations');
    cy.route('**/investigations/count*').as('getInvestigationCount');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Table');
    cy.get('#datagateway-table').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('[role="gridcell"] a')
      .first()
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/14/investigation/87/dataset'
    );
  });

  // Not enough investigations to test scrolling.
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  describe('should be able to sort by', () => {
    it('ascending order', () => {
      cy.contains('Title').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Series toward yes cost analysis. Name town other state action like. Culture fill either collection phone. Space few should lawyer various quite today well.'
      );
    });

    it('descending order', () => {
      cy.contains('Title').click();
      cy.contains('Title').click();

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Series toward yes cost analysis. Name town other state action like. Culture fill either collection phone. Space few should lawyer various quite today well.'
      );
    });

    it('no order', () => {
      cy.contains('Title').click();
      cy.contains('Title').click();
      cy.contains('Title').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.be.visible');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Series toward yes cost analysis. Name town other state action like. Culture fill either collection phone. Space few should lawyer various quite today well.'
      );
    });

    it('multiple columns', () => {
      cy.contains('Start Date').click();
      cy.contains('Title').click();
      cy.contains('Visit Id').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Series toward yes cost analysis. Name town other state action like. Culture fill either collection phone. Space few should lawyer various quite today well.'
      );
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Title"]')
        .find('input')
        .type('series');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains('15');
    });

    it('date between', () => {
      cy.get('[aria-label="Start Date date filter from"]').type('2006-08-05');

      cy.get('[aria-label="Start Date date filter to"]')
        .parent()
        .find('button')
        .click();

      cy.get('.MuiPickersDay-day[tabindex="0"]')
        .first()
        .click();

      cy.contains('OK').click();

      let date = new Date();
      date.setDate(1);

      cy.get('[aria-label="Start Date date filter to"]').should(
        'have.value',
        date.toISOString().slice(0, 10)
      );

      cy.get('[aria-rowcount="1"]').should('not.exist');
      cy.contains(
        'Series toward yes cost analysis. Name town other state action like. Culture fill either collection phone. Space few should lawyer various quite today well.'
      ).should('not.be.visible');
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Title"]')
        .find('input')
        .type('series');

      cy.get('[aria-label="Filter by Visit Id"]')
        .find('input')
        .type('15');

      cy.get('[aria-rowcount="1"]').should('exist');
    });
  });

  describe('should be able to view details', () => {
    it('when not other row is showing details', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.contains('Proposal: INVESTIGATION 107').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    // Cannot test showing details when another row is showing details
    // as well since we are currently limited to 1 investigation to test.

    it('and view investigation details, users, samples and publications', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.get('[aria-controls="investigation-details-panel"]').should(
        'be.visible'
      );

      cy.contains(
        'Summary: Most within thus represent stock entire. Shoulder table board. Tax step street early either third life.\nEdge building say wife use upon. If half true media matter Mr. Still support shake.'
      ).should('be.visible');

      cy.get('[aria-controls="investigation-users-panel"]').should(
        'be.visible'
      );
      cy.get('[aria-controls="investigation-users-panel"]').click();

      cy.contains('Name: Michelle228').should('be.visible');

      cy.get('[aria-controls="investigation-samples-panel"]').should(
        'be.visible'
      );
      cy.get('[aria-controls="investigation-samples-panel"]').click();

      cy.contains('Sample: SAMPLE 87').should('be.visible');

      cy.get('[aria-controls="investigation-publications-panel"]').should(
        'be.visible'
      );
      cy.get('[aria-controls="investigation-publications-panel"]').click();

      cy.contains(
        'Reference: Follow team before this.\nBeat likely soldier anyone. By management look activity economic plant others. Take move turn pay.\nWalk project charge against sell.'
      ).should('be.visible');
    });

    it('and then not view details anymore', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.get('[aria-label="Hide details"]')
        .first()
        .click();

      cy.contains('Proposal: INVESTIGATION 107').should('not.be.visible');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });

  describe('should be able to select items', () => {
    it('individually', () => {
      cy.get('[aria-label="select row 0"]').click();
      cy.get('[aria-label="select row 0"]').should('be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');
      cy.get('[aria-label="select all rows"]').should('be.checked');
    });

    it('and unselect them individually', () => {
      cy.get('[aria-label="select row 0"]').click();
      cy.get('[aria-label="select row 0"]').should('be.checked');

      cy.get('[aria-label="select row 0"]').click();
      cy.get('[aria-label="select row 0"]').should('not.be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');
      cy.get('[aria-label="select all rows"]').should('not.be.checked');
    });

    it('by all items', () => {
      cy.get(`[aria-label="select row 0"]`).should('be.visible');

      cy.get('[aria-label="select all rows"]').check();
      cy.get('[aria-label="select all rows"]').should('be.checked');
      cy.get(`[aria-label="select row 0"]`).should('be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');
    });

    it('and unselect all items', () => {
      cy.get(`[aria-label="select row 0"]`).should('be.visible');

      cy.get('[aria-label="select all rows"]').check();
      cy.get('[aria-label="select all rows"]').should('be.checked');

      cy.get('[aria-label="select all rows"]').uncheck();
      cy.get('[aria-label="select all rows"]').should('not.be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');
      cy.get(`[aria-label="select row 0"]`).should('not.be.checked');
    });
  });
});
