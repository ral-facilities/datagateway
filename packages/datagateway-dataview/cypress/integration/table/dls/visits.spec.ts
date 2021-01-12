describe('DLS - Visits Table', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.visit('/browse/proposal/INVESTIGATION%201/investigation/');
    cy.intercept('/datasets/count').as('getDatasetCount');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });

    cy.location('pathname').should(
      'eq',
      '/browse/proposal/INVESTIGATION%201/investigation/1/dataset'
    );
  });

  // Lazy loading can't be tested on this table at the moment since there is only 1 investigation.
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
        columnWidth = (windowWidth - 40) / 5;
      })
      .then(() => expect(columnWidth).to.not.equal(0));

    cy.get('[role="columnheader"]').eq(1).as('nameColumn');
    cy.get('[role="columnheader"]').eq(2).as('datasetCountColumn');

    cy.get('@nameColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('@datasetCountColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 400 })
      .trigger('mouseup');

    cy.get('@nameColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.greaterThan(columnWidth);
    });

    cy.get('@datasetCountColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.lessThan(columnWidth);
    });

    // table width should grow if a column grows too large
    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 800 })
      .trigger('mouseup');

    cy.get('@datasetCountColumn').should(($column) => {
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
      cy.contains('[role="button"]', 'Visit ID').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('64');
    });

    it('descending order', () => {
      cy.contains('[role="button"]', 'Visit ID').click();
      cy.contains('[role="button"]', 'Visit ID').click();

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('64');
    });

    it('no order', () => {
      cy.contains('[role="button"]', 'Visit ID').click();
      cy.contains('[role="button"]', 'Visit ID').click();
      cy.contains('[role="button"]', 'Visit ID').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('64');
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Start Date').click();
      cy.contains('[role="button"]', 'Visit ID').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('64');
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Visit ID"]').find('input').type('64');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('64');
    });

    it('date between', () => {
      cy.get('[aria-label="Start Date date filter from"]').type('2000-04-03');

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

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('64');
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Visit ID"]').find('input').type('64');

      cy.get('[aria-label="Filter by Instrument')
        .find('input')
        .type('INSTRUMENT 8');

      cy.get('[aria-rowcount="1"').should('exist');
    });
  });

  describe('should be able to view details', () => {
    it('when no other row is showing details', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    it('and then calculate file size', () => {
      // We need to wait for counts to finish, otherwise cypress
      // might interact with the details panel too quickly and
      // it re-renders during the test.
      cy.contains('[aria-rowindex="1"] [aria-colindex="3"]', '2').should(
        'exist'
      );
      cy.get('[aria-label="Show details"]').first().click();

      cy.contains('#calculate-size-btn', 'Calculate')
        .should('exist')
        .click({ force: true });
      cy.contains('10.8 GB').should('be.visible');
    });

    // TODO: Since we only have one investigation, we cannot test
    // showing details when another row is showing details at the moment.

    it('and view visit users, samples and publications', () => {
      // We need to wait for counts to finish, otherwise cypress
      // might interact with the details panel too quickly and
      // it re-renders during the test.
      cy.contains('[aria-rowindex="1"] [aria-colindex="3"]', '2').should(
        'exist'
      );

      cy.get('[aria-label="Show details"]').first().click();

      cy.get('[aria-controls="visit-users-panel"]').click();
      cy.get('#visit-users-panel').should('not.have.attr', 'hidden');
      cy.get('#details-panel').contains('Robert499').should('be.visible');

      cy.get('[aria-controls="visit-samples-panel"]').click();
      cy.get('#visit-samples-panel').should('not.have.attr', 'hidden');
      cy.get('#details-panel').contains('SAMPLE 1').should('be.visible');

      cy.get('[aria-controls="visit-publications-panel"]').click();
      cy.get('#visit-publications-panel').should('not.have.attr', 'hidden');
      cy.get('#details-panel').contains(
        'Democrat sea gas road police. Citizen relationship southern affect. Thousand national especially. In edge far education.'
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
