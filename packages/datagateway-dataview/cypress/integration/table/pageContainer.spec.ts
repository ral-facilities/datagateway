describe('PageContainer Component', () => {
  it('should not display the open data warning when logged in', () => {
    cy.login({
      username: 'root',
      password: 'pw',
      mechanism: 'simple',
    });
    cy.get('[aria-label="page-breadcrumbs"]').should('exist');
    cy.get('[aria-label="open-data-warning"]').should('not.exist');
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/browse/investigation/');
    cy.clearDownloadCart();
  });

  it('should display the open data warning when not logged in', () => {
    cy.get('[aria-label="open-data-warning"]').should('exist');
  });

  it('should be able to click clear filters button to clear filters', () => {
    const url = 'http://127.0.0.1:3000/browse/investigation/?view=table';
    cy.visit(url);
    cy.get('input[id="Title-filter"]').type('South');

    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains('42');

    cy.get('[data-testid="clear-filters-button"]').click();
    cy.url().should('eq', url);
  });

  it('should disable the hover tool tip by pressing escape (open data warning)', () => {
    // The hover tool tip has an enter delay of 500ms.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="arrow-tooltip-component-false"]')
      .eq(2)
      .trigger('mouseover')
      .wait(700)
      .get('[data-testid="arrow-tooltip-component-true"]')
      .should('exist');

    cy.get('body').type('{esc}');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="arrow-tooltip-component-false"]')
      .eq(2)
      .wait(700)
      .first()
      .get('[data-testid="arrow-tooltip-component-false"]')
      .eq(2)
      .should('exist');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');

    cy.get('[aria-label="page-breadcrumbs"]').should('exist');

    cy.get('[aria-label="view-count"]').should('exist');

    cy.get('[aria-label="view-search"]').should('exist');

    cy.get('[aria-label="view-cart"]').should('exist');

    cy.get('[aria-label="page-view Display as cards"]').should('exist');
  });

  it('should display correct entity count', () => {
    // Check that the entity count has displayed correctly.
    cy.get('[aria-label="view-count"]')
      .should('be.visible')
      .contains('Results: 239');
  });

  it('should display number of items in cart correctly', () => {
    cy.get('[aria-label="view-cart-badge"]', { timeout: 10000 })
      .children()
      .should('be.hidden');

    cy.get('[aria-label="select row 0"]', { timeout: 10000 }).check();
    cy.get('[aria-label="select row 0"]', { timeout: 10000 }).should(
      'be.checked'
    );

    cy.get('[aria-label="view-cart-badge"]', { timeout: 10000 })
      .children()
      .should('not.be.hidden')
      .contains('1');

    cy.get('[aria-label="select row 1"]', { timeout: 10000 }).check();
    cy.get('[aria-label="select row 1"]', { timeout: 10000 }).should(
      'be.checked'
    );

    cy.get('[aria-label="view-cart-badge"]', { timeout: 10000 })
      .children()
      .should('not.be.hidden')
      .contains('2');
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

  it('should display tooltips correctly', () => {
    // The hover tool tip has an enter delay of 500ms.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="investigation-table-title"]')
      .first()
      .trigger('mouseover', { force: true })
      .wait(700)
      .get('[data-testid="arrow-tooltip-component-true"]')
      .should('exist');
  });

  it('should not display tooltips after column resizing', () => {
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
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 1500 })
      .trigger('mouseup');

    cy.get('@titleColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.greaterThan(columnWidth);
    });

    // The hover tool tip has an enter delay of 500ms.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="investigation-table-title"]')
      .first()
      .trigger('mouseover', { force: true })
      .wait(700)
      .get('[data-testid="arrow-tooltip-component-true"]')
      .should('not.exist');
  });

  it('should not display tooltips after making the window bigger', () => {
    cy.viewport(10000, 750);
    // The hover tool tip has an enter delay of 500ms.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="investigation-table-title"]')
      .first()
      .trigger('mouseover', { force: true })
      .wait(700)
      .get('[data-testid="arrow-tooltip-component-true"]')
      .should('not.exist');
  });
});
