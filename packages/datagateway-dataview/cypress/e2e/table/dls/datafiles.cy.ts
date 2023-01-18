describe('DLS - Datafiles Table', () => {
  beforeEach(() => {
    cy.intercept('**/datafiles/count?*').as('datafilesCount');
    cy.intercept('**/datasets/61').as('datasets');
    cy.intercept('**/datafiles?order=*').as('datafilesOrder');
    cy.login();
    cy.visit(
      '/browse/proposal/INVESTIGATION%201/investigation/1/dataset/61/datafile'
    ).wait(['@datafilesCount', '@datasets', '@datafilesOrder'], {
      timeout: 10000,
    });
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    //Default sort
    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
  });

  it('should not load incorrect URL', () => {
    cy.visit(
      '/browse/proposal/INVESTIGATION%201/investigation/2/dataset/25/datafile'
    );

    cy.contains('Oops!').should('be.visible');
    cy.get('[role="grid"]').should('not.exist');
  });

  // Lazy loading cannot be tested at the moment as there are only 15 files in this dataset
  it.skip('should be able to scroll down and load more rows', () => {
    // Will need to figure out a way to have this be mocked.
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="55"]').should('exist');
  });

  it('should be able to resize a column', () => {
    // Filtering results so vertical scrollbar won't appear as this can impact on the
    // column width causing these types of tests to intermittently fail
    cy.get('[aria-label="Filter by Location"]').first().type('rise');

    let columnWidth = 0;

    cy.window()
      .then((window) => {
        const windowWidth = window.innerWidth;
        // Account for select and details column widths
        columnWidth = (windowWidth - 40 - 40) / 4;
      })
      .then(() => expect(columnWidth).to.not.equal(0));

    cy.get('[role="columnheader"]').eq(2).as('nameColumn');
    cy.get('[role="columnheader"]').eq(3).as('locationColumn');

    cy.get('@nameColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('@locationColumn').should(($column) => {
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

    cy.get('@locationColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.lessThan(columnWidth);
    });

    // table width should grow if a column grows too large
    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 800 })
      .trigger('mouseup');

    cy.get('@locationColumn').should(($column) => {
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
        .wait('@datafilesOrder', { timeout: 10000 });
    });

    it('ascending order', () => {
      cy.contains('[role="button"]', 'Location')
        .click()
        .wait('@datafilesOrder', { timeout: 10000 });

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
        '/analysis/unit/bank.tiff'
      );
    });

    it('descending order', () => {
      cy.contains('[role="button"]', 'Location')
        .click()
        .wait('@datafilesOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'Location')
        .click()
        .wait('@datafilesOrder', { timeout: 10000 });

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
        '/to/total/according.tiff'
      );
    });

    it('no order', () => {
      cy.contains('[role="button"]', 'Location')
        .click()
        .wait('@datafilesOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'Location')
        .click()
        .wait('@datafilesOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'Location')
        .click()
        .wait('@datafilesOrder', { timeout: 10000 });

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
        '/time/run/drug.jpeg'
      );
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Create Time')
        .click()
        .wait('@datafilesOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datafilesOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datafilesOrder', { timeout: 10000 });

      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Datafile 60');
    });
  });

  describe('should be able to filter by', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Create Time')
        .click()
        .wait('@datafilesOrder', { timeout: 10000 });
    });

    it('text', () => {
      cy.get('[aria-label="Filter by Location"]').first().type('unit');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Datafile 1369'
      );
    });

    it('date between', () => {
      cy.get('input[id="Create Time filter from"]').type('2019-01-01');

      const date = new Date();

      cy.get('input[aria-label="Create Time filter to"]').type(
        date.toISOString().slice(0, 10)
      );
      //.parent()
      //.find('button')
      //.click();

      //cy.get('.MuiPickersDay-root[tabindex="-1"]').first().click();

      //cy.get('input[id="Create Time filter to"]').should(
      //  'have.value',
      //  date.toISOString().slice(0, 10)
      //);

      cy.get('[aria-rowcount="15"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Datafile 60');
      cy.get('[aria-rowindex="2"] [aria-colindex="3"]').contains(
        'Datafile 179'
      );
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Name"]')
        .first()
        .type('5')
        .wait('@datafilesCount', { timeout: 10000 });

      cy.get('[aria-label="Filter by Location"]')
        .first()
        .type('.gif')
        .wait('@datafilesCount', { timeout: 10000 });

      cy.get('[aria-rowcount="2"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Datafile 536'
      );
    });
  });

  describe('should be able to view details', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Create Time')
        .click()
        .wait('@datafilesOrder', { timeout: 10000 });
    });

    it('when no other row is showing details', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    it('when another row is showing details', () => {
      cy.get('[aria-label="Show details"]').eq(1).click();

      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').contains('Datafile 60').should('be.visible');
      cy.get('#details-panel').contains('Datafile 179').should('not.exist');
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
