describe('ISIS - FacilityCycles Table', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/browse/instrument/1/facilityCycle');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click a facility cycle to see its investigations', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/14/investigation'
    );
  });

  // Not enough data in facility cycles to load.
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  // TODO: Having three columns does not work since the width not calulated correctly.
  it('should be able to resize a column', () => {
    let columnWidth = 0;

    // Using Math.floor to solve rounding errors when calculating 1000 / 3
    cy.window()
      .then((window) => {
        const windowWidth = window.innerWidth;
        columnWidth = windowWidth / 3;
        columnWidth = Math.floor(columnWidth * 100) / 100;
      })
      .then(() => expect(columnWidth).to.not.equal(0));

    cy.get('[role="columnheader"]').eq(0).as('titleColumn');
    cy.get('[role="columnheader"]').eq(1).as('startDateColumn');

    // Filtering results to remove vertical scroll bar affecting width calculations
    cy.get('[aria-label="Filter by Name"]').find('input').first().type('2004');

    cy.get('@titleColumn').should(($column) => {
      let { width } = $column[0].getBoundingClientRect();
      width = Math.floor(width * 100) / 100;
      expect(width).to.equal(columnWidth);
    });

    cy.get('@startDateColumn').should(($column) => {
      let { width } = $column[0].getBoundingClientRect();
      width = Math.floor(width * 100) / 100;
      expect(width).to.equal(columnWidth);
    });

    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 400 })
      .trigger('mouseup');

    cy.get('@titleColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.greaterThan(columnWidth);
    });

    cy.get('@startDateColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.lessThan(columnWidth);
    });

    // table width should grow if a column grows too large
    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 1000 })
      .trigger('mouseup');

    cy.get('@startDateColumn').should(($column) => {
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
    it('ascending order', () => {
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        '2004-02-01 00:00:00+00:00'
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
        '2019-08-04 00:00:00+01:00'
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
        '2006-06-03 00:00:00+01:00'
      );
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Start Date').click();
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        '2004-02-01 00:00:00+00:00'
      );
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Name"]')
        .find('input')
        .first()
        .type('2010');

      cy.get('[aria-rowcount="2"]').should('exist');
      cy.get('[aria-rowindex="2"] [aria-colindex="2"]').contains(
        '2010-02-01 00:00:00+00:00'
      );
    });

    it('date between', () => {
      cy.get('[aria-label="Start Date date filter from"]').type('2010-04-02');

      cy.get('[aria-label="Start Date date filter to"]')
        .parent()
        .find('button')
        .click();

      cy.get('.MuiPickersDay-day[tabindex="0"]').first().click();

      cy.contains('OK').click();

      const date = new Date();
      date.setDate(1);

      cy.get('[aria-label="Start Date date filter to"]').should(
        'have.value',
        date.toISOString().slice(0, 10)
      );

      cy.get('[aria-rowcount="7"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        '2010-04-02 00:00:00+01:00'
      );
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Name"]').find('input').first().type('3');

      cy.get('[aria-label="Start Date date filter from"]').type('2019-06-03');

      cy.get('[aria-rowcount="1"]').should('exist');
    });
  });
});
