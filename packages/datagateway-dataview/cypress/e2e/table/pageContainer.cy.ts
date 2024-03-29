describe('PageContainer Component', () => {
  it('should not display the open data warning when logged in', () => {
    cy.login({
      username: 'root',
      password: 'pw',
      mechanism: 'simple',
    });
    cy.intercept('**/investigations/*').as('getInvestigations');
    cy.visit('/browse/investigation/').wait('@getInvestigations');
    cy.get('[aria-label="page-breadcrumbs"]').should('exist');
    cy.get('[aria-label="open-data-warning"]').should('not.exist');
  });

  beforeEach(() => {
    cy.login();
    cy.intercept('**/investigations/*').as('getInvestigations');
    cy.visit('/browse/investigation/').wait('@getInvestigations');
    cy.clearDownloadCart();
  });

  it('should be able to click clear filters button to clear filters', () => {
    cy.url().then((url) => {
      cy.get('input[id="Title-filter"]').type('South');
      cy.wait('@getInvestigations');

      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains('24');

      cy.get('[data-testid="clear-filters-button"]').click();
      cy.url().should('eq', url);
    });
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');

    // we're not logged in, so show open data warning
    cy.get('[aria-label="open-data-warning"]').should('exist');

    cy.get('[aria-label="page-breadcrumbs"]').should('exist');

    cy.get('[aria-label="view-count"]').should('exist');

    cy.get('[aria-label="view-search"]').should('exist');

    cy.get('[aria-label="Go to selections"]').should('exist');

    cy.get('[aria-label="page view Display as cards"]').should('exist');

    // Check that the entity count has displayed correctly.
    cy.get('[aria-label="view-count"]')
      .should('be.visible')
      .contains('Results: 59');
  });

  it('should display number of items in cart correctly', () => {
    cy.get('[aria-label="Go to selections"]', { timeout: 10000 }).contains(
      /^$/
    );

    cy.get('[aria-label="select row 0"]', { timeout: 10000 }).check();
    cy.get('[aria-label="select row 0"]', { timeout: 10000 }).should(
      'be.checked'
    );

    cy.get('[aria-label="Go to selections"]', { timeout: 10000 }).contains(
      /^1/
    );

    cy.get('[aria-label="select row 1"]', { timeout: 10000 }).check();
    cy.get('[aria-label="select row 1"]', { timeout: 10000 }).should(
      'be.checked'
    );

    cy.get('[aria-label="Go to selections"]', { timeout: 10000 }).contains(
      /^2/
    );
  });

  it('should display selection alert banner correctly', () => {
    cy.get('[aria-label="selection-alert"]', { timeout: 10000 }).should(
      'not.exist'
    );

    cy.get('[aria-label="select row 0"]', { timeout: 10000 }).check();
    cy.get('[aria-label="select row 0"]', { timeout: 10000 }).should(
      'be.checked'
    );

    cy.get('[aria-label="selection-alert"]', { timeout: 10000 }).should(
      'exist'
    );
    cy.get('[aria-label="selection-alert-text"]')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal('1 item has been added to selection.');
      });
    cy.get('[aria-label="selection-alert-close"]').click();
    cy.get('[aria-label="selection-alert"]', { timeout: 10000 }).should(
      'not.exist'
    );
  });

  // test any table.component.tsx functionality here
  // instead of any of the specs for instantiated tables
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
      .as('firstColumnDragHandler')
      .trigger('mousedown');
    cy.get('@firstColumnDragHandler').trigger('mousemove', { clientX: 200 });
    cy.get('@firstColumnDragHandler').trigger('mouseup');

    cy.get('@titleColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.greaterThan(columnWidth);
    });

    cy.get('@visitColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.lessThan(columnWidth);
    });

    // table width should grow if a column grows too large

    cy.get('@firstColumnDragHandler').trigger('mousedown');
    cy.get('@firstColumnDragHandler').trigger('mousemove', { clientX: 800 });
    cy.get('@firstColumnDragHandler').trigger('mouseup');

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

  it('should display table tooltips correctly (and be dismissable by pressing esc)', () => {
    cy.get('[data-testid="investigation-table-title"]')
      .first()
      .as('firstTitle')
      .trigger('mouseover', { force: true });
    cy.get('@firstTitle').get('[role="tooltip"]').should('exist');

    cy.get('body').type('{esc}');

    cy.get('@firstTitle').get('[role="tooltip"]').should('not.exist');
  });

  it('should not table display tooltips after column resizing', () => {
    let columnWidth = 0;

    cy.window()
      .then((window) => {
        const windowWidth = window.innerWidth;
        // Account for select and details column widths
        columnWidth = (windowWidth - 40 - 40) / 8;
      })
      .then(() => expect(columnWidth).to.not.equal(0));

    cy.get('[role="columnheader"]').eq(2).as('titleColumn');

    cy.get('@titleColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('.react-draggable')
      .first()
      .as('firstColumnDragHandler')
      .trigger('mousedown');
    cy.get('@firstColumnDragHandler').trigger('mousemove', { clientX: 1500 });
    cy.get('@firstColumnDragHandler').trigger('mouseup');

    cy.get('@titleColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.greaterThan(columnWidth);
    });

    cy.get('[data-testid="investigation-table-title"]')
      .first()
      .as('firstTitle')
      .trigger('mouseover', { force: true });
    cy.get('@firstTitle').get('[role="tooltip"]').should('not.exist');
  });

  it('should not display table tooltips after making the window bigger', () => {
    cy.viewport(10000, 750);

    cy.get('[data-testid="investigation-table-title"]')
      .first()
      .as('firstTitle')
      .trigger('mouseover', { force: true });

    cy.get('@firstTitle').get('[role="tooltip"]').should('not.exist');
  });
});
