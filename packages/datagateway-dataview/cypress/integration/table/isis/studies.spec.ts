describe('ISIS - Studies Table', () => {
  beforeEach(() => {
    cy.intercept('**/studies/count*').as('getStudiesCount');
    cy.intercept('**/studies?order*').as('getStudiesOrder');
    cy.login();
    cy.visit('/browseStudyHierarchy/instrument/1/study').wait(
      ['@getStudiesCount', '@getStudiesOrder'],
      { timeout: 10000 }
    );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    //Default sort
    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
  });

  it('should be able to click a study to see its landing page', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseStudyHierarchy/instrument/1/study/314'
    );
  });

  it('should have the correct url for the DOI link', () => {
    cy.get('[data-testid="isis-study-table-doi-link"]')
      .first()
      .then(($doi) => {
        const doi = $doi.text();

        const url = `https://doi.org/${doi}`;

        cy.get('[data-testid="isis-study-table-doi-link"]')
          .first()
          .should('have.attr', 'href', url);
      });
  });

  // Not enough data in studies to load.
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

  describe('should be able to sort by', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Start Date').click();
    });

    it('ascending order', () => {
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Western year few however.'
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
        'Religious production expect those security door.'
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
        'He represent address cut environmental special size. Activity entire which reality not. Better focus people receive.'
      );
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Start Date').click();
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Help music rate image common worry reason. Rich green either require. Garden leader answer sort generation. Question decision window send food loss society.'
      );
    });
  });

  describe('should be able to filter by', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Start Date').click();
    });

    it('text', () => {
      cy.get('[aria-label="Filter by Name"]').first().type('3');

      cy.get('[aria-rowcount="3"]').should('exist');
      cy.get('[aria-rowindex="3"] [aria-colindex="2"]').contains(
        'Help music rate image common worry reason.'
      );
    });

    it('date between', () => {
      cy.get('input[id="Start Date filter from"]').type('2010-04-02');

      cy.get('[aria-rowcount="5"]').should('exist');
      cy.get('[aria-rowindex="5"] [aria-colindex="2"]').contains(
        'Old ok order wall bank.'
      );
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Name"]').first().type('1');

      cy.get('[aria-label="Filter by Title"]').first().type('science');

      cy.get('[aria-rowcount="1"]').should('exist');
    });
  });
});
