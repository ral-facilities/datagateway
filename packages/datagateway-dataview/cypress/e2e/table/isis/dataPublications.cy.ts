describe('ISIS - Data Publication Table', () => {
  beforeEach(() => {
    cy.intercept('**/datapublications/count*').as('getDataPublicationsCount');
    cy.intercept('**/datapublications?order*').as('getDataPublicationsOrder');
    cy.login();
    cy.visit('/browseDataPublications/instrument/8/dataPublication').wait(
      ['@getDataPublicationsCount', '@getDataPublicationsOrder'],
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

  it('should be able to click a data publication to see its landing page', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseDataPublications/instrument/8/dataPublication/51'
    );
  });

  it('should have the correct url for the DOI link', () => {
    cy.get('[data-testid="isis-datapublication-table-doi-link"]')
      .first()
      .then(($doi) => {
        const doi = $doi.text();

        const url = `https://doi.org/${doi}`;

        cy.get('[data-testid="isis-datapublication-table-doi-link"]')
          .first()
          .should('have.attr', 'href', url);
      });
  });

  // Not enough data in datapublications to load.
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  it('should be able to resize a column', () => {
    let columnWidth = 0;

    // Using Math.round to solve rounding errors when calculating 1000 / 3
    cy.window()
      .then((window) => {
        const windowWidth = window.innerWidth;
        columnWidth = Math.round(windowWidth / 3);
        columnWidth = Math.round((columnWidth * 100) / 100);
      })
      .then(() => expect(columnWidth).to.not.equal(0));

    cy.get('[role="columnheader"]').eq(0).as('titleColumn');
    cy.get('[role="columnheader"]').eq(1).as('doiColumn');

    cy.get('@titleColumn').should(($column) => {
      let { width } = $column[0].getBoundingClientRect();
      width = Math.round((width * 100) / 100);
      expect(width).to.equal(columnWidth);
    });

    cy.get('@doiColumn').should(($column) => {
      let { width } = $column[0].getBoundingClientRect();
      width = Math.round((width * 100) / 100);
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

    cy.get('@doiColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.lessThan(columnWidth);
    });

    // table width should grow if a column grows too large
    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 900 })
      .trigger('mouseup');

    cy.get('@doiColumn').should(($column) => {
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
      cy.contains('[role="button"]', 'Publication Date').click();
    });

    it('ascending order', () => {
      cy.contains('[role="button"]', 'Title').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
        'Article subject amount'
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
        'Daughter experience discussion'
      );
    });

    it('no order', () => {
      cy.contains('[role="button"]', 'Title').click();
      cy.contains('[role="button"]', 'Title').click();
      cy.contains('[role="button"]', 'Title').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.be.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
        'Article subject amount'
      );
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Publication Date').click();
      cy.contains('[role="button"]', 'Publication Date').click();
      cy.contains('[role="button"]', 'Title').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
        'Church child time Congress'
      );
    });
  });

  describe('should be able to filter by', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Publication Date').click();
    });

    it('text', () => {
      cy.get('[aria-label="Filter by Title"]').first().type('wat');

      cy.get('[aria-rowcount="2"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
        'Consider author watch'
      );
    });

    it('date between', () => {
      cy.get('input[id="Publication Date filter from"]').type('2014-04-02');

      cy.get('[aria-rowcount="2"]').should('exist');
      cy.get('[aria-rowindex="2"] [aria-colindex="1"]').contains(
        'Church child time Congress'
      );
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by DOI"]').first().type('0');

      cy.get('[aria-label="Filter by Title"]').first().type('wat');

      cy.get('[aria-rowcount="1"]').should('exist');
    });
  });
});
