describe('DLS - Visits Table', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.visit('/browse/proposal/INVESTIGATION%201/investigation/');
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

  describe('should be able to sort by', () => {
    it('ascending order', () => {
      cy.contains('Visit Id').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('64');
    });

    it('descending order', () => {
      cy.contains('Visit Id').click();
      cy.contains('Visit Id').click();

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('64');
    });

    it('no order', () => {
      cy.contains('Visit Id').click();
      cy.contains('Visit Id').click();
      cy.contains('Visit Id').click();

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
      cy.contains('Start Date').click();
      cy.contains('Visit Id').click();

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
      cy.get('[aria-label="Start Date date filter from').type('2000-04-03');

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
    beforeEach(() => {
      cy.get('[aria-label="Show details"]')
        .eq(0)
        .click();
    });

    it('when no other row is showing details', () => {
      cy.contains(
        'Title: Including spend increase ability music skill former. Agreement director concern once technology sometimes someone staff.'
      ).should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    it('and view users, samples and publications', () => {
      cy.get('[aria-controls="visit-users-panel"]').click();
      cy.contains('Investigator: Robert499').should('be.visible');

      cy.get('[aria-controls="visit-samples-panel"]').click();
      cy.contains('Sample: SAMPLE 1').should('be.visible');

      cy.get('[aria-controls="visit-publications-panel"]').click();
      cy.contains(
        'Reference: Democrat sea gas road police. Citizen relationship southern affect.\nThousand national especially. In edge far education.'
      );
    });

    it('and then not view details anymore', () => {
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
