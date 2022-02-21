describe('ISIS - MyData Table', () => {
  it('Should redirect when logged in anonymously', () => {
    cy.login();
    cy.visit('/my-data/ISIS');
    cy.url().should('include', '/login');
  });
  describe('Logged in tests', () => {
    beforeEach(() => {
      cy.intercept('/investigations/count').as('getInvestigationCount');
      cy.login({
        username: 'root',
        password: 'pw',
        mechanism: 'simple',
      });
      // TODO - Does wait() need to be removed?
      cy.visit('/my-data/ISIS').wait(['@getInvestigationCount'], {
        timeout: 10000,
      });
      // Check that we have received the size from the API as this will produce
      // a re-render which can prevent some interactions.
      cy.contains('[aria-rowindex="1"] [aria-colindex="8"]', '10.38 GB').should(
        'exist'
      );
    });

    it('should load correctly', () => {
      cy.title().should('equal', 'DataGateway DataView');
      cy.get('#datagateway-dataview').should('be.visible');

      //Default sort
      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('exist');
    });

    it('should disable the hover tool tip by pressing escape', () => {
      // The hover tool tip has a enter delay of 500ms.
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get('[data-testid="isis-mydata-table-title"]')
        .first()
        .trigger('mouseover', { force: true })
        .wait(700)
        .get('[role="tooltip"]')
        .should('exist');

      cy.get('body').type('{esc}');

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get('[data-testid="isis-mydata-table-title"]')
        .wait(700)
        .first()
        .get('[role="tooltip"]')
        .should('not.exist');
    });

    it('should be able to click an investigation to see its landing page', () => {
      cy.get('[role="gridcell"] a').first().click({ force: true });
      cy.location('pathname').should(
        'eq',
        '/browse/instrument/10/facilityCycle/50/investigation/131'
      );
    });

    it('should have the correct url for the DOI link', () => {
      cy.get('[data-testid="isis-mydata-table-doi-link"]')
        .first()
        .then(($doi) => {
          const doi = $doi.text();

          const url = `https://doi.org/${doi}`;

          cy.get('[data-testid="isis-mydata-table-doi-link"]')
            .first()
            .should('have.attr', 'href', url);
        });
    });

    // Not enough investigations to test scrolling.
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
          // Account for select and details column widths
          columnWidth = (windowWidth - 40 - 40) / 8;
        })
        .then(() => expect(columnWidth).to.not.equal(0));

      cy.get('[role="columnheader"]').eq(2).as('titleColumn');
      cy.get('[role="columnheader"]').eq(3).as('doiColumn');

      cy.get('@titleColumn').should(($column) => {
        const { width } = $column[0].getBoundingClientRect();
        expect(width).to.equal(columnWidth);
      });

      cy.get('@doiColumn').should(($column) => {
        const { width } = $column[0].getBoundingClientRect();
        expect(width).to.equal(columnWidth);
      });

      cy.get('.react-draggable')
        .first()
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 200 })
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
        .trigger('mousemove', { clientX: 800 })
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
        cy.contains('[role="button"]', 'Start Date').click();
      });

      it('ascending order', () => {
        cy.contains('[role="button"]', 'Title').first().click();

        cy.get('[aria-sort="ascending"]').should('exist');
        cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
        cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
          'Experience ready course option.'
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
        cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
          'Standard country something spend sign.'
        );
      });

      it('no order', () => {
        cy.get('[aria-sort="ascending"]').should('not.exist');
        cy.get('[aria-sort="descending"]').should('not.exist');
        cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
        cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
          'have.css',
          'opacity',
          '0'
        );
        cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
          'Standard country something spend sign.'
        );
      });

      it('multiple columns', () => {
        cy.contains('[role="button"]', 'Title').click();
        cy.contains('[role="button"]', 'Instrument').click();

        cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
          'Experience ready course option.'
        );
      });
    });

    describe('should be able to filter by', () => {
      it('role', () => {
        cy.get('[aria-rowcount="4"]').should('exist');

        cy.get('#role-selector').click();
        cy.get('[role="listbox"]')
          .find('[role="option"]')
          .should('have.length', 3);
        cy.get('[role="option"][data-value="PI"]').click();

        cy.get('[aria-rowcount="3"]').should('exist');

        // check that size is correct after filtering
        cy.get('[aria-rowindex="1"] [aria-colindex="8"]').contains('12.91 GB');

        cy.get('#role-selector').click();
        cy.get('[role="option"]').first().click();
        cy.get('[aria-rowcount="4"]').should('exist');
      });

      it('text', () => {
        cy.get('[aria-rowcount="4"]').should('exist');
        cy.get('input[id="Title-filter"]').type('night');

        cy.get('[aria-rowcount="1"]').should('exist');
        cy.get('[aria-rowindex="1"] [aria-colindex="6"]').contains(
          'INVESTIGATION 165'
        );
      });

      it('date between', () => {
        cy.get('[aria-rowcount="4"]').should('exist');

        cy.get('input[aria-label="Start Date filter to"]')
          .parent()
          .find('button')
          .click();

        cy.get('.MuiPickersDay-root[tabindex="-1"]').first().click();

        const date = new Date();
        date.setDate(1);

        cy.get('input[id="Start Date filter to"]').should(
          'have.value',
          date.toISOString().slice(0, 10)
        );

        cy.get('input[id="Start Date filter from"]').type('2006-08-05');
        cy.get('[aria-rowcount="2"]').should('exist');
      });

      it('multiple columns', () => {
        cy.get('[aria-label="Filter by DOI"]').first().type('69');

        cy.get('[aria-rowcount="3"]').should('exist');

        cy.get('[aria-label="Filter by Title"]').first().type('us');

        cy.get('[aria-rowcount="2"]').should('exist');
      });
    });

    describe('should be able to view details', () => {
      it('when no other row is showing details', () => {
        cy.get('[aria-label="Show details"]').first().click();

        // Study PID

        cy.get('[data-testid="investigation-details-panel-pid-link"]')
          .first()
          .then(($pid) => {
            const pid = $pid.text();

            const url = `https://doi.org/${pid}`;

            cy.get('[data-testid="investigation-details-panel-pid-link"]')
              .first()
              .should('have.attr', 'href', url);
          });

        // DOI

        cy.get('[data-testid="investigation-details-panel-doi-link"]')
          .first()
          .then(($doi) => {
            const doi = $doi.text();

            const url = `https://doi.org/${doi}`;

            cy.get('[data-testid="investigation-details-panel-doi-link"]')
              .first()
              .should('have.attr', 'href', url);
          });

        cy.get('#details-panel').should('be.visible');
        cy.get('[aria-label="Hide details"]').should('exist');
      });

      it('and view investigation details, users, samples and publications', () => {
        cy.get('[aria-label="Show details"]').first().click();

        cy.get('[aria-controls="investigation-details-panel"]').should(
          'be.visible'
        );

        cy.get('#details-panel')
          .contains('Resource himself season pattern which cold spring.')
          .should('be.visible');

        cy.get('[aria-controls="investigation-samples-panel"]').should(
          'be.visible'
        );
        cy.get('[aria-controls="investigation-samples-panel"]').click();

        cy.get('#details-panel').contains('SAMPLE 131').should('be.visible');

        cy.get('[aria-controls="investigation-users-panel"]').should(
          'be.visible'
        );
        cy.get('[aria-controls="investigation-users-panel"]').click();

        cy.get('#details-panel')
          .contains('Kimberly Sharp')
          .should('be.visible');

        cy.get('[aria-controls="investigation-publications-panel"]').should(
          'be.visible'
        );
        cy.get('[aria-controls="investigation-publications-panel"]').click();

        cy.get('#details-panel')
          .contains('Guess including understand bed father.')
          .should('be.visible');
      });

      it('and view datasets', () => {
        cy.get('[aria-label="Show details"]').first().click();
        cy.get('#investigation-datasets-tab').click({ force: true });

        cy.location('pathname').should(
          'eq',
          '/browse/instrument/10/facilityCycle/50/investigation/131/dataset'
        );
      });

      it('when another row is showing details', () => {
        cy.get('[aria-label="Show details"]').eq(1).click();

        cy.get('[aria-label="Show details"]').first().click();

        cy.get('#details-panel')
          .contains('Resource himself season pattern which cold spring.')
          .should('be.visible');
        cy.get('#details-panel')
          .contains('Experience ready course option.')
          .should('not.exist');
        cy.get('[aria-label="Hide details"]').should('have.length', 1);
      });

      it('and then not view details anymore', () => {
        cy.get('[aria-label="Show details"]').first().click();

        cy.get('[aria-label="Hide details"]').first().click();

        cy.get('#details-panel').should('not.exist');
        cy.get('[aria-label="Hide details"]').should('not.exist');
      });
    });
  });
});
