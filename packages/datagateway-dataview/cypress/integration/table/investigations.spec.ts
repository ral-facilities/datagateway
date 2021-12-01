describe('Investigations Table', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/browse/investigation');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });
    cy.location('pathname').should('eq', '/browse/investigation/1/dataset');
  });

  it('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  it('should disable the hover tool tip by pressing escape', () => {
    // The hover tool tip has a enter delay of 500ms.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="investigation-table-title"]')
      .first()
      .trigger('mouseover', { force: true })
      .wait(700);

    cy.get('body').type('{esc}');
  });

  it('should have the correct url for the DOI link', () => {
    cy.get('[data-testid="investigation-table-doi-link"]')
      .first()
      .then(($doi) => {
        const doi = $doi.text();

        const url = `https://doi.org/${doi}`;

        cy.get('[data-testid="investigation-table-doi-link"]')
          .first()
          .should('have.attr', 'href', url);
      });
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
    cy.get('[role="columnheader"]').eq(3).as('visitColumn');

    cy.get('@titleColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('@visitColumn').should(($column) => {
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
    it('ascending order', () => {
      cy.contains('[role="button"]', 'Title').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'About quickly both stop. Population buy on poor. Avoid teacher summer positive feel sing.'
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
        'Yourself smile either I pass significant. Avoid sound suddenly development line get executive ahead.'
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
        'Including spend increase ability music skill former. Agreement director concern once technology sometimes someone staff.'
      );
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Start Date').click();
      cy.contains('[role="button"]', 'Title').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Discussion risk amount hour exist. Off fund usually large else go. Check reflect officer wind main.'
      );
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Title"]').first().type('dog');

      cy.get('[aria-rowcount="7"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains('1');

      // check that size is correct after filtering
      cy.get('[aria-rowindex="1"] [aria-colindex="7"]').contains('10.54 GB');
    });

    it('date between', () => {
      cy.get('input[id="Start Date filter from"]').type('2019-01-01');

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

      cy.get('[aria-rowcount="12"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Old ok order wall bank. Floor science physical ask activity alone. Language sort test bill to century.'
      );
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Title"]').first().type('dog');

      cy.get('[aria-label="Filter by Visit ID"]').first().type('9');

      cy.get('[aria-rowcount="2"]').should('exist');
    });
  });

  describe('should be able to view details', () => {
    it('when no other row is showing details', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    it('when another row is showing details', () => {
      cy.get('[aria-label="Show details"]').eq(2).click();

      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel')
        .contains(
          'Show fly image herself yard challenge by. Past site her number. Not weight half far move. Leader everyone skin still.'
        )
        .should('be.visible');
      cy.get('#details-panel')
        .contains(
          'Dog want single resource major. Necessary bit always available term small stock game.'
        )
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
