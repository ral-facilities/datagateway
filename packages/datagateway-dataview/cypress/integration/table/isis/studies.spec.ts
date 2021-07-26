describe('ISIS - Studies Table', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/browseStudyHierarchy/instrument/1/study');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click a facility cycle to see its landing page', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseStudyHierarchy/instrument/1/study/405'
    );
  });

  // Not enough data in facility cycles to load.
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  it('should be able to resize a column', () => {
    let columnWidth = 0;

    cy.window()
      .then((window) => {
        const windowWidth = window.innerWidth;
        columnWidth = windowWidth / 5;
      })
      .then(() => expect(columnWidth).to.not.equal(0));

    cy.get('[role="columnheader"]').eq(0).as('titleColumn');
    cy.get('[role="columnheader"]').eq(1).as('descriptionColumn');

    cy.get('@titleColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('@descriptionColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
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

    cy.get('@descriptionColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.lessThan(columnWidth);
    });

    // table width should grow if a column grows too large
    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 800 })
      .trigger('mouseup');

    cy.get('@descriptionColumn').should(($column) => {
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

  // Sorting currently broken
  describe('should be able to sort by', () => {
    it('ascending order', () => {
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Economic always lawyer family. Girl amount available. Once great before. Per sure task commercial physical theory economic.'
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
        'Build few thought section wife myself occur. Moment my stand well impact. Ok laugh capital know cell significant window education. Yes save not.'
      );
    });

    it('no order', () => {
      cy.contains('[role="button"]', 'Name').click();
      cy.contains('[role="button"]', 'Name').click();
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.be.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Network find should century magazine happen natural. Environmental size market product laugh. First kid strong yard.'
      );
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Start Date').click();
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'It wish different however along whether knowledge media. Name determine wish something might development. Push sound process international scene call.'
      );
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Name"]').find('input').first().type('3');

      cy.get('[aria-rowcount="5"]').should('exist');
      cy.get('[aria-rowindex="5"] [aria-colindex="2"]').contains(
        'Number name during matter last nation both. Miss site ok minute size direction. Yeah edge method few. Free source someone.'
      );
    });

    it('date between', () => {
      cy.get('[aria-label="Start Date date filter from"]').type('2010-04-02');

      cy.get('[aria-rowcount="5"]').should('exist');
      cy.get('[aria-rowindex="5"] [aria-colindex="2"]').contains(
        'Number name during matter last nation both. Miss site ok minute size direction. Yeah edge method few. Free source someone.'
      );
    });

    // Cannot filter on two joined fields at the same time
    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Name"]').find('input').first().type('4');

      cy.get('[aria-label="Filter by Description"]')
        .find('input')
        .first()
        .type('energy');

      cy.get('[aria-rowcount="1"]').should('exist');
    });
  });
});
