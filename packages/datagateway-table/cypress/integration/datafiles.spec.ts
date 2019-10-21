describe('Datafiles Table', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.visit('/browse/investigation/1407/dataset/2506/datafile');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Table');
    cy.get('#datagateway-table').should('be.visible');
  });

  describe('should be able to sort by', () => {
    it('ascending order', () => {
      cy.contains('Location').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('ab/odio/eos');
    });

    it('descending order', () => {
      cy.contains('Location').click();
      cy.contains('Location').click();

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc')
        .eq(1)
        .should('not.have.css', 'opacity', '0');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'voluptatibus/odio/dolor'
      );
    });

    it('no order', () => {
      cy.contains('Location').click();
      cy.contains('Location').click();
      cy.contains('Location').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.be.visible');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'quidem/omnis/iure'
      );
    });

    it('multiple columns', () => {
      cy.contains('Modified Time').click();
      cy.contains('Name').click();
      cy.contains('Name').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('Datafile 29');
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Name"]')
        .find('input')
        .type('Datafile 13');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'id/error/nulla'
      );
    });

    it('date between', () => {
      cy.get('[aria-label="Modified Time date filter from"]').type(
        '2019-01-01'
      );

      cy.get('[aria-label="Modified Time date filter to"]')
        .parent()
        .find('button')
        .click();

      cy.get('.MuiPickersDay-day[tabindex="0"]')
        .first()
        .click();

      cy.contains('OK').click();

      let date = new Date();
      date.setDate(1);

      cy.get('[aria-label="Modified Time date filter to"]').should(
        'have.value',
        date.toISOString().slice(0, 10)
      );

      cy.get('[aria-rowcount="100"]').should('exist');
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Name"]')
        .find('input')
        .type('1');

      cy.get('[aria-label="Filter by Location"]')
        .find('input')
        .type('est');

      cy.get('[aria-rowcount="2"]').should('exist');
    });
  });

  describe('should be able to view details', () => {
    it('when no other row is showing details', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.contains('Name: Datafile 1').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    it('when another other row is showing details', () => {
      cy.get('[aria-label="Show details"]')
        .eq(1)
        .click();

      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.contains('Name: Datafile 1').should('be.visible');
      cy.contains('Name: Datafile 2').should('not.be.visible');
      cy.get('[aria-label="Hide details"]').should('have.length', 1);
    });

    it('and then not view details anymore', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.get('[aria-label="Hide details"]')
        .first()
        .click();

      cy.contains('Name: Datafile 1').should('not.be.visible');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });
});
