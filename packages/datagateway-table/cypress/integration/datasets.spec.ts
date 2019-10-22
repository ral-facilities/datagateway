describe('Datasets Table', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.visit('/browse/investigation/1407/dataset');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Table');
    cy.get('#datagateway-table').should('be.visible');
  });

  it('should be able to click a dataset to see its datafiles', () => {
    cy.get('a')
      .first()
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/investigation/1407/dataset/2506/datafile'
    );
  });

  // current example data only has 3 datasets per investigation, so can't test lazy loading
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  describe('should be able to sort by', () => {
    it('ascending order', () => {
      cy.contains('Name').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('Dataset 1');
    });

    it('descending order', () => {
      cy.contains('Name').click();
      cy.contains('Name').click();

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('Dataset 3');
    });

    it('no order', () => {
      cy.contains('Name').click();
      cy.contains('Name').click();
      cy.contains('Name').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.be.visible');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('Dataset 1');
    });

    it('multiple columns', () => {
      cy.contains('Create Time').click();
      cy.contains('Create Time').click();
      cy.contains('Name').click();
      cy.contains('Name').click();

      cy.get('[aria-rowindex="2"] [aria-colindex="2"]').contains('Dataset 2');
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Name"]')
        .find('input')
        .type('Dataset 3');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
        '2019-02-27 10:36:25'
      );
    });

    it('date between', () => {
      cy.get('[aria-label="Create Time date filter from"]').type('2019-01-01');

      cy.get('[aria-label="Create Time date filter to"]')
        .parent()
        .find('button')
        .click();

      cy.get('.MuiPickersDay-day[tabindex="0"]')
        .first()
        .click();

      cy.contains('OK').click();

      let date = new Date();
      date.setDate(1);

      cy.get('[aria-label="Create Time date filter to"]').should(
        'have.value',
        date.toISOString().slice(0, 10)
      );

      cy.get('[aria-rowcount="3"]').should('exist');
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Name"]')
        .find('input')
        .type('2');

      cy.get('[aria-label="Create Time date filter from"]').type('2019-01-01');

      cy.get('[aria-rowcount="1"]').should('exist');
    });
  });

  describe('should be able to view details', () => {
    it('when no other row is showing details', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.contains('Name: Dataset 1').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    it('when another other row is showing details', () => {
      cy.get('[aria-label="Show details"]')
        .eq(1)
        .click();

      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.contains('Name: Dataset 1').should('be.visible');
      cy.contains('Name: Dataset 2').should('not.be.visible');
      cy.get('[aria-label="Hide details"]').should('have.length', 1);
    });

    it('and then not view details anymore', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.get('[aria-label="Hide details"]')
        .first()
        .click();

      cy.contains('Name: Dataset 1').should('not.be.visible');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });
});
