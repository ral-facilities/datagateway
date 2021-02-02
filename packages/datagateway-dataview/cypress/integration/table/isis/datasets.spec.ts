describe('ISIS - Datasets Table', () => {
  beforeEach(() => {
    cy.intercept('/datasets/count').as('datasetsCount');
    cy.intercept('/datasets?order=').as('datasetsOrder');
    cy.login('user', 'password');
    cy.visit(
      '/browse/instrument/1/facilityCycle/14/investigation/87/dataset'
    ).wait(['@datasetsCount', '@datasetsOrder', '@datasetsOrder'], {
      timeout: 10000,
    });
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
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
      '/browse/instrument/1/facilityCycle/14/investigation/87/dataset/118'
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
    it('ascending order', () => {
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datasetsOrder', { timeout: 10000 });

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 327');
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
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 87');
    });

    it('no order', () => {
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datasetsOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datasetsOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datasetsOrder', { timeout: 10000 });

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 87');
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

      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 87');
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Name"]').find('input').type('DATASET 327');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="5"]').contains(
        '2005-06-12 08:15:28'
      );
    });

    it('date between', () => {
      cy.get('[aria-label="Create Time date filter from"]').type('2005-06-12');

      cy.get('[aria-label="Create Time date filter to"]')
        .parent()
        .find('button')
        .click();

      cy.get('.MuiPickersDay-day[tabindex="0"]').first().click();

      cy.contains('OK').click();

      const date = new Date();
      date.setDate(1);

      cy.get('[aria-label="Create Time date filter to"]').should(
        'have.value',
        date.toISOString().slice(0, 10)
      );

      cy.get('[aria-rowcount="2"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 87');
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Name"]')
        .find('input')
        .type('87')
        .wait(['@datasetsCount', '@datasetsOrder'], { timeout: 10000 });

      cy.get('[aria-label="Create Time date filter to"]')
        .type('2007-06-23')
        .wait(['@datasetsCount', '@datasetsOrder'], { timeout: 10000 });

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 87');
    });
  });

  describe('should be able to view details', () => {
    beforeEach(() => {
      // Check that we have received the size from the API as this will produce
      // a re-render which can prevent the click.
      cy.contains('[aria-rowindex="1"] [aria-colindex="4"]', '5.23 GB').should(
        'exist'
      );

      cy.contains('[aria-rowindex="2"] [aria-colindex="4"]', '5.84 GB').should(
        'exist'
      );
    });

    it('when no other row is showing details', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    it('when another other row is showing details', () => {
      cy.get('[aria-label="Show details"]').eq(1).click();

      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').contains('DATASET 87').should('be.visible');
      cy.get('#details-panel').contains('DATASET 327').should('not.exist');
      cy.get('[aria-label="Hide details"]').should('have.length', 1);
    });

    it('and view dataset details and type', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('[aria-controls="dataset-details-panel"]').should('be.visible');

      cy.get('#details-panel')
        .contains(
          'Onto wind media return. Cultural area while friend who rich detail. Word allow education. Across share be. Along month decide eye. Media foot war available organization could performance.'
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
        '/browse/instrument/1/facilityCycle/14/investigation/87/dataset/118/datafile'
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
