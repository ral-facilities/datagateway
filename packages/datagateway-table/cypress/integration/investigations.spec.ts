describe('Investigations Table', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.visit('/browse/investigation');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Table');
    cy.get('#datagateway-table').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('a')
      .first()
      .click({ force: true });
    cy.location('pathname').should('eq', '/browse/investigation/1407/dataset');
  });

  describe('should be able to sort by', () => {
    it('ascending order', () => {
      cy.contains('Title').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'accusamus molestias qui'
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
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'voluptates fuga harum'
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
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'quas accusantium omnis'
      );
    });

    it('multiple columns', () => {
      cy.contains('Start Date').click();
      cy.contains('Title').click();
      cy.contains('Title').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'voluptates fuga harum'
      );
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Title"]')
        .find('input')
        .type('eos est et');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Proposal 11 - 3'
      );
    });

    it('date between');

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Title"]')
        .find('input')
        .type('et');

      cy.get('[aria-label="Filter by Visit ID"]')
        .find('input')
        .type('14');

      cy.get('[aria-rowcount="2"]').should('exist');
    });
  });

  describe('should be able to view details', () => {
    it('when no other row is showing details', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.contains('Title: quas accusantium omnis').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    it('when another other row is showing details', () => {
      cy.get('[aria-label="Show details"]')
        .eq(1)
        .click();

      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.contains('Title: quas accusantium omnis').should('be.visible');
      cy.contains('Title: voluptatem corrupti dolorem').should(
        'not.be.visible'
      );
      cy.get('[aria-label="Hide details"]').should('have.length', 1);
    });

    it('and then not view details anymore', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.get('[aria-label="Hide details"]')
        .first()
        .click();

      cy.contains('Title: quas accusantium omnis').should('not.be.visible');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });
});
