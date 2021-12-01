describe('DLS - Datasets Table', () => {
  beforeEach(() => {
    cy.intercept('/investigations/1').as('investigations');
    cy.intercept('/investigations/findone').as('investigationsFindOne');
    cy.intercept('/datasets/count?').as('datasetsCount');
    cy.intercept('/datasets?').as('datasets');
    cy.login();
    cy.visit(
      '/browse/proposal/INVESTIGATION%201/investigation/1/dataset'
    ).wait(
      [
        '@investigations',
        '@investigations',
        '@investigationsFindOne',
        '@datasetsCount',
        '@datasets',
        '@datasets',
      ],
      { timeout: 10000 }
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
    cy.visit('/browse/proposal/INVESTIGATION%202/investigation/1/dataset');

    cy.contains('Oops!').should('be.visible');
    cy.get('[role="grid"]').should('not.exist');
  });

  it('should be able to click a dataset to see its datafiles', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });

    cy.location('pathname').should(
      'eq',
      '/browse/proposal/INVESTIGATION%201/investigation/1/dataset/241/datafile'
    );
  });

  // Lazy loading can't be tested at the moment since there are only 2 datasets in this investigation.
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
        columnWidth = (windowWidth - 40 - 40) / 4;
      })
      .then(() => expect(columnWidth).to.not.equal(0));

    cy.get('[role="columnheader"]').eq(2).as('nameColumn');
    cy.get('[role="columnheader"]').eq(3).as('datafileCountColumn');

    cy.get('@nameColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('@datafileCountColumn').should(($column) => {
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

    cy.get('@datafileCountColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.lessThan(columnWidth);
    });

    // table width should grow if a column grows too large
    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 800 })
      .trigger('mouseup');

    cy.get('@datafileCountColumn').should(($column) => {
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
      cy.contains('[role="button"]', 'Create Time').click();
    });

    it('ascending order', () => {
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datasets', { timeout: 10000 });

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 1');
    });

    it('descending order', () => {
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datasets', { timeout: 10000 });
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datasets', { timeout: 10000 });

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 241');
    });

    it('no order', () => {
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datasets', { timeout: 10000 });
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datasets', { timeout: 10000 });
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 1');
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Name"]')
        .first()
        .type('1')
        .wait('@datasets', { timeout: 10000 });

      cy.get('input[id="Create Time filter from"]')
        .type('2006-11-21')
        .wait('@datasets', { timeout: 10000 });

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 241');
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Name"]').first().type('DATASET 1');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="5"]').contains(
        '2002-11-27 06:20:36'
      );
    });

    it('date between', () => {
      cy.get('input[id="Create Time filter from"]').type('2002-01-01');
      cy.get('input[id="Create Time filter to"]').type('2006-01-01');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 1');
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Name"]')
        .first()
        .type('1')
        .wait(['@datasetsCount', '@datasets'], { timeout: 10000 });

      cy.get('input[id="Create Time filter from"]')
        .type('2006-11-21')
        .wait(['@datasetsCount', '@datasets'], { timeout: 10000 });

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 241');
    });
  });

  describe('should be able to view details', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Create Time').click();
    });

    it('when no other row is showing details', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    it('when another row is showing details', () => {
      cy.get('[aria-label="Show details"]').eq(1).click();

      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').contains('DATASET 1').should('be.visible');
      cy.get('#details-panel').contains('DATASET 241').should('not.exist');
      cy.get('[aria-label="Hide details"]').should('have.length', 1);
    });

    it('and view dataset details', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel')
        .contains(
          'Many last prepare small. Maintain throw hope parent. Entire soon option bill fish against power. Rather why rise month shake voice.'
        )
        .should('be.visible');
    });

    it('and then calculate file size', () => {
      // need to wait for counts to finish, otherwise cypress might interact with the details panel
      // too quickly and it rerenders during the test
      cy.contains('[aria-rowindex="1"] [aria-colindex="4"]', '55').should(
        'exist'
      );
      cy.contains('[aria-rowindex="2"] [aria-colindex="4"]', '55').should(
        'exist'
      );

      cy.get('[aria-label="Show details"]').first().click();

      cy.contains('#calculate-size-btn', 'Calculate')
        .should('exist')
        .click({ force: true });
      cy.contains('4.24 GB', { timeout: 10000 }).should('be.visible');
    });

    it('and view the dataset type panel', () => {
      // need to wait for counts to finish, otherwise cypress might interact with the details panel
      // too quickly and it rerenders during the test
      cy.contains('[aria-rowindex="1"] [aria-colindex="4"]', '55').should(
        'exist'
      );
      cy.contains('[aria-rowindex="2"] [aria-colindex="4"]', '55').should(
        'exist'
      );

      cy.get('[aria-label="Show details"]').first().click();

      cy.get('[aria-controls="dataset-type-panel"]').click();

      cy.get('#dataset-type-panel').should('not.have.attr', 'hidden');
      cy.get('#details-panel').contains('DATASETTYPE 2').should('be.visible');
    });

    it('and then not view details anymore', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('[aria-label="Hide details"]').first().click();

      cy.get('#details-panel').should('not.exist');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });

  it('should display correct datafile count after filtering', () => {
    cy.visit('/browse/proposal/INVESTIGATION%202/investigation/2/dataset').wait(
      ['@investigationsFindOne', '@datasetsCount', '@datasets'],
      {
        timeout: 10000,
      }
    );

    cy.get('[aria-label="Filter by Name"]')
      .first()
      .type('DATASET 242')
      .wait(['@datasetsCount', '@datasets'], {
        timeout: 10000,
      });

    cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains('55');
  });
});
