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
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('64');
    });

    it.only('date between', () => {
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
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('64');
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
});
