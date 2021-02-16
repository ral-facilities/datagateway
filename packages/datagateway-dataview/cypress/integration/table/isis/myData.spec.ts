describe('ISIS - MyData Table', () => {
  beforeEach(() => {
    cy.intercept('/investigations/count').as('getInvestigationCount');
    cy.login();
    cy.visit('/my-data/ISIS').wait(['@getInvestigationCount'], {
      timeout: 10000,
    });
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/5/facilityCycle/10/investigation/1/dataset'
    );
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

  describe.skip('should be able to sort by', () => {
    // we only have one row - so can't properly test sorting
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-label="Filter by Title"]')
        .find('input')
        .first()
        .type('invalid');

      cy.get('[aria-rowcount="0"]').should('exist');
    });

    it('date between', () => {
      cy.get('[aria-rowcount="1"]').should('exist');

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

      cy.get('[aria-label="Start Date date filter from"]').type('2006-08-05');
      cy.get('[aria-rowcount="0"]').should('exist');
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Instrument"]')
        .find('input')
        .first()
        .type('INSTRUMENT 8');

      cy.get('[aria-rowcount="1"]').should('exist');

      cy.get('[aria-label="Filter by Title"]')
        .find('input')
        .first()
        .type('invalid');

      cy.get('[aria-rowcount="0"]').should('exist');
    });
  });

  describe('should be able to view details', () => {
    beforeEach(() => {
      // Check that we have received the size from the API as this will produce
      // a re-render which can prevent the click.
      cy.contains('[aria-rowindex="1"] [aria-colindex="8"]', '10.8 GB').should(
        'exist'
      );
    });

    it('when not other row is showing details', () => {
      cy.get('[aria-label="Show details"]').first().click();

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

      cy.get('#details-panel')
        .contains('Drug something increase common nature reflect purpose.')
        .should('be.visible');

      cy.get('[aria-controls="investigation-samples-panel"]').should(
        'be.visible'
      );
      cy.get('[aria-controls="investigation-samples-panel"]').click();

      cy.get('#details-panel').contains('SAMPLE 1').should('be.visible');

      cy.get('[aria-controls="investigation-users-panel"]').should(
        'be.visible'
      );
      cy.get('[aria-controls="investigation-users-panel"]').click();

      cy.get('#details-panel').contains('Robert499').should('be.visible');

      cy.get('[aria-controls="investigation-publications-panel"]').should(
        'be.visible'
      );
      cy.get('[aria-controls="investigation-publications-panel"]').click();

      cy.get('#details-panel')
        .contains('Democrat sea gas road police.')
        .should('be.visible');
    });

    it('and then not view details anymore', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('[aria-label="Hide details"]').first().click();

      cy.get('#details-panel').should('not.exist');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });
});
