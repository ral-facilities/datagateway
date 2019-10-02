describe('Datafiles Table', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.visit('/browse/investigation/1407/dataset/2506/datafile');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Table');
    cy.get('#datagateway-table').should('be.visible');
  });

  it('should be able to resize a column', () => {
    let columnWidth = 0;

    cy.window()
      .then(window => {
        const windowWidth = window.innerWidth;
        columnWidth = (windowWidth - 50 - 70) / 4;
      })
      .then(() => expect(columnWidth).to.not.equal(0));

    cy.get('[role="columnheader"]')
      .eq(1)
      .as('nameColumn');
    cy.get('[role="columnheader"]')
      .eq(2)
      .as('locationColumn');

    cy.get('@nameColumn').should($column => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('@locationColumn').should($column => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 400 })
      .trigger('mouseup');

    cy.get('@nameColumn').should($column => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.greaterThan(columnWidth);
    });

    cy.get('@locationColumn').should($column => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.lessThan(columnWidth);
    });
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
});
