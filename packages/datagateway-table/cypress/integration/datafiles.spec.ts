describe('Datafiles Table', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.clearDownloadCart();
    cy.visit('/browse/investigation/1/dataset/1/datafile');
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

    it('date between');

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

  describe.only('should be able to select items', () => {
    it('individually', () => {
      //TODO remove when preloader exists
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

      cy.get('[aria-label="select row 0"]').check();
      cy.get('[aria-label="select row 0"]').should('be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'true');
    });

    it('and unselect them individually', () => {
      //TODO remove when preloader exists
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

      cy.get('[aria-label="select row 0"]').check();
      cy.get('[aria-label="select row 0"]').should('be.checked');

      cy.get('[aria-label="select row 0"]').uncheck();
      cy.get('[aria-label="select row 0"]').should('not.be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');
    });

    it('by all items', () => {
      //TODO remove when preloader exists
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

      cy.get('[aria-label="select all rows"]').check();
      cy.get('[aria-label="select all rows"]').should('be.checked');
      cy.get(
        `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
      ).should('be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');
    });

    it('by all items in a filtered table', () => {
      cy.get('[aria-label="Filter by Location"]')
        .find('input')
        .type('.png');

      cy.server();
      cy.route('**/datafiles**').as('getDatafiles');
      cy.wait('@getDatafiles');

      cy.get('[aria-label="select all rows"]').check();
      cy.get('[aria-label="select all rows"]').should('be.checked');
      cy.get(
        `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
      ).should('be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');

      cy.get('[aria-label="Filter by Location"]')
        .find('input')
        .clear();

      cy.wait('@getDatafiles');
      cy.get('[aria-label="select all rows"]').should('not.be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'true');

      cy.get('[aria-label="select row 0"]').should('not.be.checked');
      cy.get('[aria-label="select row 1"]').should('be.checked');
      cy.get('[aria-label="select row 2"]').should('not.be.checked');
      cy.get('[aria-label="select row 3"]').should('be.checked');
    });

    it('and unselect all items', () => {
      //TODO remove when preloader exists
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

      cy.get('[aria-label="select all rows"]').check();
      cy.get('[aria-label="select all rows"]').should('be.checked');

      cy.get('[aria-label="select all rows"]').uncheck();
      cy.get('[aria-label="select all rows"]').should('not.be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');
      cy.get(
        `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
      ).should('not.be.checked');
    });

    it('by shift clicking', () => {
      //TODO remove when preloader exists
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

      cy.get('[aria-label="select row 0"]').click();
      cy.get('[aria-label="select row 0"]').should('be.checked');

      cy.get('body')
        .type('{shift}', { release: false })
        .get('[aria-label="select row 5"]')
        .click();
      cy.get('[aria-label="select row 5"]').should('be.checked');

      cy.get('[aria-label="grid"]').scrollTo('top');
      cy.get('[aria-label="select row 4"]').should('be.checked');
      cy.get('[aria-label="select row 3"]').should('be.checked');
      cy.get('[aria-label="select row 2"]').should('be.checked');
      cy.get('[aria-label="select row 1"]').should('be.checked');
    });

    it('and unselect by shift clicking', () => {
      //TODO remove when preloader exists
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

      cy.get('[aria-label="select row 0"]').click();
      cy.get('[aria-label="select row 0"]').should('be.checked');

      cy.get('body')
        .type('{shift}', { release: false })
        .get('[aria-label="select row 5"]')
        .click();
      cy.get('[aria-label="select row 5"]').should('be.checked');

      cy.get('[aria-label="grid"]').scrollTo('top');
      cy.get('body')
        .type('{shift}', { release: false })
        .get('[aria-label="select row 2"]')
        .click();
      cy.get('[aria-label="select row 2"]').should('not.be.checked');

      cy.get('[aria-label="grid"]').scrollTo('top');
      cy.get('[aria-label="select row 5"]').should('not.be.checked');
      cy.get('[aria-label="select row 4"]').should('not.be.checked');
      cy.get('[aria-label="select row 3"]').should('not.be.checked');
      cy.get('[aria-label="select row 2"]').should('not.be.checked');

      cy.get('[aria-label="select row 1"]').should('be.checked');
      cy.get('[aria-label="select row 0"]').should('be.checked');
    });
  });
});
