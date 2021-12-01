describe('ISIS - Investigations Table', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/browse/instrument/1/facilityCycle/16/investigation');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    //Default sort
    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('exist');
  });

  it('should be able to click an investigation to see its landing page', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/16/investigation/97'
    );
  });

  it('should have the correct url for the DOI link', () => {
    cy.get('[data-testid="isis-investigation-table-doi-link"]')
      .first()
      .then(($doi) => {
        const doi = $doi.text();

        const url = `https://doi.org/${doi}`;

        cy.get('[data-testid="isis-investigation-table-doi-link"]')
          .first()
          .should('have.attr', 'href', url);
      });
  });

  it('should disable the hover tool tip by pressing escape', () => {
    // The hover tool tip has a enter delay of 500ms.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="isis-investigations-table-title"]')
      .first()
      .trigger('mouseover', { force: true })
      .wait(700);

    cy.get('body').type('{esc}');
  });

  // Not enough investigations to test scrolling.
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  it('should be able to resize a column', () => {
    let columnWidth = 0;

    // Using Math.floor to solve rounding errors when calculating (1000 - 40 - 40) / 7
    cy.window()
      .then((window) => {
        const windowWidth = window.innerWidth;
        // Account for select and details column widths
        columnWidth = (windowWidth - 40 - 40 - 70) / 7;
        columnWidth = Math.floor(columnWidth * 10) / 10;
      })
      .then(() => expect(columnWidth).to.not.equal(0));

    cy.get('[role="columnheader"]').eq(2).as('titleColumn');
    cy.get('[role="columnheader"]').eq(3).as('visitColumn');

    cy.get('@titleColumn').should(($column) => {
      let { width } = $column[0].getBoundingClientRect();
      width = Math.floor(width * 10) / 10;
      expect(width).to.equal(columnWidth);
    });

    cy.get('@visitColumn').should(($column) => {
      let { width } = $column[0].getBoundingClientRect();
      width = Math.floor(width * 10) / 10;
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

    cy.get('@visitColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.lessThan(columnWidth);
    });

    // table width should grow if a column grows too large
    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 800 })
      .trigger('mouseup');

    cy.get('@visitColumn').should(($column) => {
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
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Again bad simply low summer. Left hand around position wonder sometimes. Body always prove husband. So understand edge outside prevent.'
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
        'He represent address cut environmental special size. Activity entire which reality not. Better focus people receive.'
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
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'He represent address cut environmental special size. Activity entire which reality not. Better focus people receive.'
      );
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Start Date').click();
      cy.contains('[role="button"]', 'Title').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'He represent address cut environmental special size. Activity entire which reality not. Better focus people receive.'
      );
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Title"]').first().type('again');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
        'INVESTIGATION 97'
      );
      // check that size is correct after filtering
      cy.get('[aria-rowindex="1"] [aria-colindex="6"]').contains('10.93 GB');
    });

    it('date between', () => {
      cy.get('input[id="Start Date filter from"]').type('2006-08-05');

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

      cy.get('[aria-rowcount="1"]').should('not.exist');
      cy.contains(
        'Series toward yes cost analysis. Name town other state action like. Culture fill either collection phone. Space few should lawyer various quite today well.'
      ).should('not.exist');
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Title"]').first().type('again');

      cy.get('[aria-rowcount="1"]').should('exist');
    });
  });

  describe('should be able to view details', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Start Date').click();

      // Check that we have received the size from the API as this will produce
      // a re-render which can prevent the click.
      cy.contains('[aria-rowindex="1"] [aria-colindex="6"]', '10.2 GB').should(
        'exist'
      );
    });

    it('when not other row is showing details', () => {
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

    // Cannot test showing details when another row is showing details
    // as well since we are currently limited to 1 investigation to test.

    it('and view investigation details, users, samples and publications', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('[aria-controls="investigation-details-panel"]').should(
        'be.visible'
      );

      // Waits needed due to suspected race condition on fetching the panels
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get('#details-panel')
        .contains(
          'He represent address cut environmental special size. Activity entire which reality not. Better focus people receive.'
        )
        .should('be.visible')
        .wait(200);

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get('[aria-controls="investigation-users-panel"]')
        .should('be.visible')
        .wait(200);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get('[aria-controls="investigation-users-panel"]').wait(200).click();

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get('#details-panel')
        .contains('Corey Cook')
        .should('be.visible')
        .wait(200);

      cy.get('[aria-controls="investigation-samples-panel"]').should(
        'be.visible'
      );
      cy.get('[aria-controls="investigation-samples-panel"]').click();

      cy.get('#details-panel').contains('SAMPLE 16').should('be.visible');

      cy.get('[aria-controls="investigation-publications-panel"]').should(
        'be.visible'
      );
      cy.get('[aria-controls="investigation-publications-panel"]').click();

      cy.get('#details-panel')
        .contains(
          'Fish page on factor nature everybody action. Sell police boy determine paper. Join six approach others method. Factor answer this design. Institution respond again area.'
        )
        .should('be.visible');
    });

    it('and view datasets', () => {
      cy.get('[aria-label="Show details"]').first().click();
      cy.get('#investigation-datasets-tab').click({ force: true });

      cy.location('pathname').should(
        'eq',
        '/browse/instrument/1/facilityCycle/16/investigation/16/dataset'
      );
    });

    it('and then not view details anymore', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('[aria-label="Hide details"]').first().click();

      cy.get('#details-panel').should('not.exist');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });
});
