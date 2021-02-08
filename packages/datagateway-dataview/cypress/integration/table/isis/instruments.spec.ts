describe('ISIS - Instruments Table', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.visit('/browse/instrument');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an instrument to see its facilityCycle', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });
    cy.location('pathname').should('eq', '/browse/instrument/1/facilityCycle');
  });

  // Not enough data in instruments to scroll down and load more rows.
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  describe('should be able to sort by', () => {
    it('ascending order', () => {
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Art very opportunity glass painting. Point wide toward natural Mrs Republican movie. Sea return sell edge with. Arrive data into and.'
      );
    });

    it('descending order', () => {
      cy.contains('[role="button"]', 'Name').click();
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Who set wind carry matter. South join quality serve food buy responsibility. Fight human situation raise manage positive.'
      );
    });

    it('no order', () => {
      cy.contains('[role="button"]', 'Name').click();
      cy.contains('[role="button"]', 'Name').click();
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Drug something increase common nature reflect purpose. Keep meet sing minute. Have run light final summer pass. Hour color maybe word side much team discussion.'
      );
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Name"]')
        .find('input')
        .first()
        .type('radio');

      cy.get('[aria-rowcount="2"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Radio land involve economic. Surface law how full election agency. Affect reality oil order catch work everybody. Husband partner do account more may power. Us police difficult fine reach what.'
      );
    });
  });

  describe('should be able to view details', () => {
    it('when no other row is showing details', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    it('when another row is showing details', () => {
      cy.get('[aria-label="Show details"]')
        .eq(2)
        .click({ scrollBehavior: 'center' });

      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel')
        .contains(
          'Drug something increase common nature reflect purpose. Keep meet sing minute. Have run light final summer pass. Hour color maybe word side much team discussion.'
        )
        .should('be.visible');
      cy.get('#details-panel')
        .contains(
          'North understand leader everyone skin. Actually prove begin boy those. Could size only. Late race city suddenly. Treat her wife training family effect.'
        )
        .should('not.exist');
      cy.get('[aria-label="Hide details"]').should('have.length', 1);
    });

    it('and view instrument details and scientists', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('[aria-controls="instrument-details-panel').should('be.visible');

      cy.get('#details-panel')
        .contains(
          'Many last prepare small. Maintain throw hope parent. Entire soon option bill fish against power. Rather why rise month shake voice.'
        )
        .should('be.visible');

      cy.get('[aria-controls="instrument-users-panel"]').should('be.visible');
      cy.get('[aria-controls="instrument-users-panel"]').click({
        scrollBehavior: 'center',
      });
      cy.get('#details-panel').contains('Matthew50').should('be.visible');
    });

    it('and then not view details anymore', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('[aria-label="Hide details"]').first().click();

      cy.get('#details-panel').should('not.exist');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });
});
