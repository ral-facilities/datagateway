describe('DLS - MyData Table', () => {
  it('Should redirect when logged in anonymously', () => {
    cy.login();
    cy.visit('/my-dois/DLS');
    cy.url().should('include', '/login');
  });

  describe('Logged in tests', () => {
    beforeEach(() => {
      cy.intercept('**/datapublications/count').as('getDataPublicationCount');
      cy.intercept('**/datapublications?*').as('getDataPublications');
      cy.login(
        {
          username: 'root',
          password: 'pw',
          mechanism: 'simple',
        },
        'Chris481'
      );
      cy.visit('/my-dois/DLS').wait('@getDataPublications');
    });

    it('should load correctly', () => {
      cy.title().should('equal', 'DataGateway DataView');
      cy.get('#datagateway-dataview').should('be.visible');

      //Default sort
      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
    });

    it('should be able to click an investigation to see its datasets', () => {
      cy.get('[role="gridcell"] a').first().click({ force: true });

      cy.location('pathname').should('eq', '/browse/dataPublication/14');
    });

    it('should disable the hover tool tip by pressing escape', () => {
      // The hover tool tip has a enter delay of 500ms.
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get('[data-testid="dls-datapublication-table-id"]')
        .first()
        .trigger('mouseover', { force: true })
        .wait(700)
        .get('[role="tooltip"]')
        .should('exist');

      cy.get('body').type('{esc}');

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get('[data-testid="dls-datapublication-table-id"]')
        .wait(700)
        .first()
        .get('[role="tooltip"]')
        .should('not.exist');
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

    // can't test sorting as there's only 1 table item

    describe('should be able to filter by', () => {
      it('text', () => {
        cy.get('[aria-rowcount="1"]').should('exist');
        cy.get('[aria-label="Filter by Title"]').type('random text');

        cy.get('[aria-rowcount="0"]').should('exist');
      });

      it('date between', () => {
        cy.get('[aria-rowcount="1"]').should('exist');

        const date = new Date();

        cy.get('input[aria-label="Publication Date filter to"]').type(
          date.toISOString().slice(0, 10)
        );

        cy.get('[aria-rowcount="1"]').should('exist');

        cy.get('input[id="Publication Date filter from"]').type('2018-05-14');

        cy.get('[aria-rowcount="0"]').should('exist');
      });

      it('multiple columns', () => {
        cy.get('[aria-label="Filter by Title"]').type('Officer');

        cy.get('[aria-rowcount="1"]').should('exist');

        cy.get('input[id="Publication Date filter from"]')
          .first()
          .type('2023-01-01');

        cy.get('[aria-rowcount="0"]').should('exist');
      });
    });

    it('should be able to click clear filters button to clear filters', () => {
      cy.url().then((url) => {
        cy.get('[aria-rowcount="1"]').should('exist');
        cy.get('[aria-label="Filter by Title"]').type('random text');

        cy.wait('@getDataPublications');

        cy.get('[aria-rowcount="0"]').should('exist');

        cy.get('[data-testid="clear-filters-button"]').click();
        cy.url().should('eq', url);
        cy.get('[aria-rowcount="1"]').should('exist');
      });
    });
  });
});
