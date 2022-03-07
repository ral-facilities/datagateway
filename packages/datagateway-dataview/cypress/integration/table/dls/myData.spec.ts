describe('DLS - MyData Table', () => {
  it('Should redirect when logged in anonymously', () => {
    cy.login();
    cy.visit('/my-data/DLS');
    cy.url().should('include', '/login');
  });

  describe('Logged in tests', () => {
    beforeEach(() => {
      cy.intercept('**/investigations/count').as('getInvestigationCount');
      cy.intercept('**/investigations?*').as('getInvestigations');
      cy.login({
        username: 'root',
        password: 'pw',
        mechanism: 'simple',
      });
      cy.visit('/my-data/DLS').wait('@getInvestigations');
    });

    it('should load correctly', () => {
      cy.title().should('equal', 'DataGateway DataView');
      cy.get('#datagateway-dataview').should('be.visible');

      //Default sort
      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
    });

    it('should be able to click clear filters button to clear filters', () => {
      cy.url().should('include', 'filters');

      cy.url().then((url) => {
        cy.get('[aria-rowcount="4"]').should('exist');
        cy.get('input[id="Title-filter"]').type('night');

        cy.wait('@getInvestigations');

        cy.get('[aria-rowcount="1"]').should('exist');
        cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('56');

        cy.get('[data-testid="clear-filters-button"]').click();
        cy.url().should('eq', url);
      });
    });

    it('should be able to click an investigation to see its datasets', () => {
      cy.get('[role="gridcell"] a').first().click({ force: true });

      cy.location('pathname').should(
        'eq',
        '/browse/proposal/INVESTIGATION%20131/investigation/131/dataset'
      );
    });

    it('should disable the hover tool tip by pressing escape', () => {
      // The hover tool tip has a enter delay of 500ms.
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get('[data-testid="dls-mydata-table-name"]')
        .first()
        .trigger('mouseover', { force: true })
        .wait(700)
        .get('[data-testid="arrow-tooltip-component-true"]')
        .should('exist');

      cy.get('body').type('{esc}');

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get('[data-testid="dls-mydata-table-name"]')
        .wait(700)
        .first()
        .get('[data-testid="arrow-tooltip-component-false"]')
        .first()
        .should('exist');
    });

    it('should be able to resize a column', () => {
      let columnWidth = 0;

      cy.window()
        .then((window) => {
          const windowWidth = window.innerWidth;
          columnWidth = (windowWidth - 40) / 6;
        })
        .then(() => expect(columnWidth).to.not.equal(0));

      cy.get('[role="columnheader"]').eq(1).as('titleColumn');
      cy.get('[role="columnheader"]').eq(2).as('visitIdColumn');

      cy.get('@titleColumn').should(($column) => {
        const { width } = $column[0].getBoundingClientRect();
        expect(width).to.equal(columnWidth);
      });

      cy.get('@visitIdColumn').should(($column) => {
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

      cy.get('@visitIdColumn').should(($column) => {
        const { width } = $column[0].getBoundingClientRect();
        expect(width).to.be.lessThan(columnWidth);
      });

      // table width should grow if a column grows too large
      cy.get('.react-draggable')
        .first()
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 800 })
        .trigger('mouseup');

      cy.get('@visitIdColumn').should(($column) => {
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
        cy.contains('[role="button"]', 'Title').click();

        cy.get('[aria-sort="ascending"]').should('exist');
        cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
        cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
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
        cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
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
        cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
          'Standard country something spend sign.'
        );
      });

      it('multiple columns', () => {
        cy.contains('[role="button"]', 'Title').click();
        cy.contains('[role="button"]', 'Instrument').click();

        cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
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

        cy.get('#role-selector').click();
        cy.get('[role="option"]').first().click();
        cy.get('[aria-rowcount="4"]').should('exist');
      });

      it('text', () => {
        cy.get('[aria-rowcount="4"]').should('exist');
        cy.get('input[id="Title-filter"]').type('night');

        cy.get('[aria-rowcount="1"]').should('exist');
        cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('56');
      });

      it('date between', () => {
        cy.get('[aria-rowcount="4"]').should('exist');

        cy.get('button[aria-label="Start Date filter to, date picker"]')
          .parent()
          .find('button')
          .click();

        cy.get('.MuiPickersDay-day[tabindex="0"]').first().click();

        cy.contains('OK').click();

        const date = new Date();
        date.setDate(1);

        cy.get('input[id="Start Date filter to"]').should(
          'have.value',
          date.toISOString().slice(0, 10)
        );

        cy.get('[aria-rowcount="4"]').should('exist');

        cy.get('input[id="Start Date filter from"]').type('2006-04-04');

        cy.get('[aria-rowcount="2"]').should('exist');
      });

      it('multiple columns', () => {
        cy.get('input[id="Start Date filter from"]').first().type('2003-04-04');

        cy.get('[aria-rowcount="3"]').should('exist');

        cy.get('[aria-label="Filter by Title"]').first().type('us');

        cy.get('[aria-rowcount="1"]').should('exist');
      });
    });

    describe('should be able to view details', () => {
      it('when no other row is showing details', () => {
        cy.get('[aria-label="Show details"]').first().click();

        cy.get('#details-panel').should('be.visible');
        cy.get('[aria-label="Hide details"]').should('exist');
      });

      it('and view visit users, samples and publications', () => {
        cy.contains('[aria-rowindex="1"] [aria-colindex="4"]', '2').should(
          'exist'
        );

        cy.get('[aria-label="Show details"]').first().click();

        cy.get('[aria-controls="visit-samples-panel"]').click();
        cy.get('#visit-samples-panel').should('not.have.attr', 'hidden');
        cy.get('#details-panel').contains('SAMPLE 131').should('be.visible');

        cy.get('[aria-controls="visit-users-panel"]').click();
        cy.get('#visit-users-panel').should('not.have.attr', 'hidden');
        cy.get('#details-panel')
          .contains('Kimberly Sharp')
          .should('be.visible');

        cy.get('[aria-controls="visit-publications-panel"]').click();
        cy.get('#visit-publications-panel').should('not.have.attr', 'hidden');
        cy.get('#details-panel').contains(
          'Guess including understand bed father.'
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
