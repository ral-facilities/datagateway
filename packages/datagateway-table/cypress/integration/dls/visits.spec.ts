describe('DLS - Visits Table', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.visit('/browse/proposal/INVESTIGATION%201/investigation/');
    cy.server();
    cy.route('**/datasets/count*').as('getDatasetCount');
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
      '/browse/proposal/INVESTIGATION%201/investigation/1/dataset'
    );
  });

  // Lazy loading can't be tested on this table at the moment since there is only 1 investigation.
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  describe('should be able to sort by', () => {
    it('ascending order', () => {
      cy.contains('[role="button"]', 'Visit Id').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('64');
    });

    it('descending order', () => {
      cy.contains('[role="button"]', 'Visit Id').click();
      cy.contains('[role="button"]', 'Visit Id').click();

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('64');
    });

    it('no order', () => {
      cy.contains('[role="button"]', 'Visit Id').click();
      cy.contains('[role="button"]', 'Visit Id').click();
      cy.contains('[role="button"]', 'Visit Id').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.be.visible');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('64');
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Start Date').click();
      cy.contains('[role="button"]', 'Visit Id').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('64');
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Visit Id"]')
        .find('input')
        .type('64');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('64');
    });

    it('date between', () => {
      cy.get('[aria-label="Start Date date filter from"]').type('2000-04-03');

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

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('64');
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Visit Id"]')
        .find('input')
        .type('64');

      cy.get('[aria-label="Filter by Beamline')
        .find('input')
        .type('INSTRUMENT 8');

      cy.get('[aria-rowcount="1"').should('exist');
    });
  });

  describe('should be able to view details', () => {
    it('when no other row is showing details', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.contains(
        'Title: Including spend increase ability music skill former. Agreement director concern once technology sometimes someone staff.'
      ).should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    // TODO: Since we only have one investigation, we cannot test
    // showing details when another row is showing details at the moment.

    it('and view visit users, samples and publications', () => {
      // We need to wait for counts to finish, otherwise cypress
      // might interact with the details panel too quickly and
      // it re-renders during the test.
      cy.contains('[aria-rowindex="1"] [aria-colindex="3"]', '2').should(
        'exist'
      );

      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.get('[aria-controls="visit-users-panel"]').click();
      cy.get('#visit-users-panel').should('not.have.attr', 'hidden');
      cy.contains('Investigator: Robert499').should('be.visible');

      cy.get('[aria-controls="visit-samples-panel"]').click();
      cy.get('#visit-samples-panel').should('not.have.attr', 'hidden');
      cy.contains('Sample: SAMPLE 1').should('be.visible');

      cy.get('[aria-controls="visit-publications-panel"]').click();
      cy.get('#visit-publications-panel').should('not.have.attr', 'hidden');
      cy.contains(
        'Reference: Democrat sea gas road police. Citizen relationship southern affect.\nThousand national especially. In edge far education.'
      );
    });

    it('and then not view details anymore', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.get('[aria-label="Hide details"]')
        .first()
        .click();

      cy.contains(
        'Title: Including spend increase ability music skill former. Agreement director concern once technology sometimes someone staff.'
      ).should('not.be.visible');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });
});
