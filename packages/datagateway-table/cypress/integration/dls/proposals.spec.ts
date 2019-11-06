describe('Proposals Table', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.visit('/browse/proposal');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Table');
    cy.get('#datagateway-table').should('be.visible');
  });

  it('should be able to click a proposal to see its investigations', () => {
    cy.get('[role="gridcell"] a')
      .first()
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/proposal/INVESTIGATION%201/investigation/'
    );
  });

  it('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  describe('should be able to sort by', () => {
    it('ascending order', () => {
      cy.contains('Title').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
        'A nothing almost arrive I. Product middle design never. Cup camera then product father sort vote.'
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
      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
        'Whom anything affect consider left. Entire order tough. White responsibility economic travel activity.'
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
      cy.get('[aria-rowindex="1"] [aria-colindex="1"').contains(
        'Including spend increase ability music skill former. Agreement director concern once technology sometimes someone staff.'
      );
    });

    it('multiple columns', () => {
      cy.contains('Name').click();
      cy.contains('Title').click();

      cy.get('[aria-rowindex="2"] [aria-colindex="1"]').contains(
        'Billion head kitchen peace appear sit civil car. State both itself only seat mean however treatment. ' +
          'Standard himself type care respond. Rise response speak worry none.'
      );
    });
  });
});
