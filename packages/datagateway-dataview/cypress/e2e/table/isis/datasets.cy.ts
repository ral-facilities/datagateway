describe('ISIS - Datasets Table', () => {
  beforeEach(() => {
    cy.intercept('**/datasets/count?*').as('datasetsCount');
    cy.intercept('**/datasets?order=*').as('datasetsOrder');
    cy.login();
    cy.visit(
      '/browse/instrument/1/facilityCycle/16/investigation/97/dataset'
    ).wait(['@datasetsCount', '@datasetsOrder'], {
      timeout: 10000,
    });
    // Check that we have received the size from the API as this will produce
    // a re-render which can prevent some interactions.
    cy.contains('[aria-rowindex="1"] [aria-colindex="4"]', '6.21 GB').should(
      'exist'
    );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    //Default sort
    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
  });

  it('should not load incorrect URL', () => {
    cy.visit('/browse/instrument/2/facilityCycle/15/investigation/87/dataset');

    cy.contains('Oops!').should('be.visible');
    cy.get('[role="grid"]').should('not.exist');
  });

  it('should be able to click a dataset to see its landing page', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });

    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/16/investigation/97/dataset/97'
    );
  });

  // Current example data only has 2 datasets in the investigation,
  // so cannot test lazy loading.
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
        // Account for select, details and actions column widths
        columnWidth = (windowWidth - 40 - 40 - 70) / 4;
      })
      .then(() => expect(columnWidth).to.not.equal(0));

    cy.get('[role="columnheader"]').eq(2).as('nameColumn');
    cy.get('[role="columnheader"]').eq(3).as('sizeColumn');

    cy.get('@nameColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('@sizeColumn').should(($column) => {
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

    cy.get('@sizeColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.lessThan(columnWidth);
    });

    // table width should grow if a column grows too large
    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 800 })
      .trigger('mouseup');

    cy.get('@sizeColumn').should(($column) => {
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
      cy.contains('[role="button"]', 'Create Time')
        .click()
        .wait('@datasetsOrder', { timeout: 10000 });
    });

    it('ascending order', () => {
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datasetsOrder', { timeout: 10000 });

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 337');
    });

    it('descending order', () => {
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datasetsOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datasetsOrder', { timeout: 10000 });

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 97');
    });

    it('no order', () => {
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datasetsOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datasetsOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 97');
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Create Time')
        .click()
        .wait('@datasetsOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'Create Time')
        .click()
        .wait('@datasetsOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datasetsOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datasetsOrder', { timeout: 10000 });

      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 97');
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Name"]').first().type('DATASET 337');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="5"]').contains(
        '2001-09-30 04:00:59'
      );
      // check that size is correct after filtering
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains('5.53 GB');
    });

    it('date between', () => {
      cy.get('input[id="Create Time filter from"]').type('2005-06-12');

      cy.get('input[aria-label="Create Time filter to"]')
        .parent()
        .find('button')
        .click();

      cy.get('.MuiPickersDay-root[tabindex="-1"]').first().click();

      const date = new Date();
      date.setDate(1);

      cy.get('input[id="Create Time filter to"]').should(
        'have.value',
        date.toISOString().slice(0, 10)
      );

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 97');
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Name"]')
        .first()
        .type('337')
        .wait(['@datasetsCount', '@datasetsOrder'], { timeout: 10000 });

      cy.get('input[id="Create Time filter to"]')
        .type('2007-06-23')
        .wait(['@datasetsCount', '@datasetsOrder'], { timeout: 10000 });

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 337');
    });
  });

  describe('should be able to view details', () => {
    it('when no other row is showing details', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    it('when another other row is showing details', () => {
      cy.get('[aria-label="Show details"]').eq(1).click();

      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').contains('DATASET 97').should('be.visible');
      cy.get('#details-panel').contains('DATASET 337').should('not.exist');
      cy.get('[aria-label="Hide details"]').should('have.length', 1);
    });

    it('and view dataset details and type', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('[aria-controls="dataset-details-panel"]').should('be.visible');

      cy.get('#details-panel')
        .contains(
          'Professor issue much especially seem together skin. Data or bill American figure condition call.'
        )
        .should('be.visible');

      cy.get('[aria-controls="dataset-type-panel"]').should('be.visible');
      cy.get('[aria-controls="dataset-type-panel"]').click();

      cy.get('#details-panel')
        .contains(
          'Many last prepare small. Maintain throw hope parent. Entire soon option bill fish against power. Rather why rise month shake voice.'
        )
        .should('be.visible');
    });

    it('and view datafiles', () => {
      cy.get('[aria-label="Show details"]').first().click();
      cy.get('#dataset-datafiles-tab').click({ force: true });

      cy.location('pathname').should(
        'eq',
        '/browse/instrument/1/facilityCycle/16/investigation/97/dataset/97/datafile'
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
