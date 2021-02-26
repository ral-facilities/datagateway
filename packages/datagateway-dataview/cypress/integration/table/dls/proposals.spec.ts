describe('DLS - Proposals Table', () => {
  beforeEach(() => {
    cy.login('root', 'pw');
    cy.intercept('/investigations?').as('investigations');
    cy.intercept('/investigations/count?').as('investigationsCount');
    cy.visit('/browse/proposal');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click a proposal to see its investigations', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });

    cy.location('pathname').should(
      'eq',
      '/browse/proposal/INVESTIGATION%201/investigation'
    );
  });

  it('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  it('should be able to resize a column', () => {
    let columnWidth = 0;

    cy.window()
      .then((window) => {
        const windowWidth = window.innerWidth;
        columnWidth = windowWidth / 2;
      })
      .then(() => expect(columnWidth).to.not.equal(0));

    cy.get('[role="columnheader"]').eq(0).as('titleColumn');
    cy.get('[role="columnheader"]').eq(1).as('nameColumn');

    cy.get('@titleColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('@nameColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 500 })
      .trigger('mouseup');

    cy.get('@titleColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.greaterThan(columnWidth);
    });

    cy.get('@nameColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.lessThan(columnWidth);
    });

    // table width should grow if a column grows too large
    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 1000 })
      .trigger('mouseup');

    cy.get('@nameColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.equal(84);
    });

    cy.get('[aria-label="grid"]').then(($grid) => {
      const { width } = $grid[0].getBoundingClientRect();
      cy.window().should(($window) => {
        expect(width).to.be.greaterThan($window.innerWidth);
      });
    });
  });

  describe('should be able to sort by', () => {
    beforeEach(() => {
      cy.wait(['@investigations', '@investigationsCount'], { timeout: 10000 });
    });

    it('ascending order', () => {
      cy.contains('[role="button"]', 'Title').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
        'A nothing almost arrive I. Product middle design never. Cup camera then product father sort vote.'
      );
    });

    it('descending order', () => {
      cy.contains('[role="button"]', 'Title').click();
      cy.contains('[role="button"]', 'Title').click();

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
      cy.contains('[role="button"]', 'Title').click();
      cy.contains('[role="button"]', 'Title').click();
      cy.contains('[role="button"]', 'Title').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
        'Including spend increase ability music skill former. Agreement director concern once technology sometimes someone staff.'
      );
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Name').click();
      cy.contains('[role="button"]', 'Title').click();

      cy.get('[aria-rowindex="2"] [aria-colindex="1"]').contains(
        'Billion head kitchen peace appear sit civil car. State both itself only seat mean however treatment. ' +
          'Standard himself type care respond. Rise response speak worry none.'
      );
    });
  });

  describe('should be able to filter by', () => {
    beforeEach(() => {
      cy.wait(['@investigations', '@investigationsCount'], { timeout: 10000 });
    });
    it('text', () => {
      cy.get('[aria-label="Filter by Title"]').find('input').type('dog');

      cy.get('[aria-rowcount="4"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'INVESTIGATION 17'
      );
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Title"]').find('input').type('dog');

      cy.get('[aria-label="Filter by Name"]')
        .find('input')
        .type('INVESTIGATION 47');

      cy.get('[aria-rowcount="1"]').should('exist');
    });
  });
});
