describe('DLS - Datafiles Table', () => {
  beforeEach(() => {
    Cypress.currentTest.retries(3);
    cy.server();
    cy.route('/datafiles/count*').as('datafilesCount');
    cy.route('/datasets/25').as('datasets');
    cy.route('/datafiles?order=*').as('datafilesOrder');
    cy.login('user', 'password');
    cy.visit(
      '/browse/proposal/INVESTIGATION%201/investigation/1/dataset/25/datafile'
    );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should not load incorrect URL', () => {
    cy.visit(
      '/browse/proposal/INVESTIGATION%201/investigation/2/dataset/25/datafile'
    );

    cy.contains('Oops!').should('be.visible');
    cy.get('[role="grid"]').should('not.exist');
  });

  it('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="56"]').should('exist');
  });

  it('should be able to resize a column', () => {
    let columnWidth = 0;

    cy.window()
      .then((window) => {
        const windowWidth = window.innerWidth;
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
      expect(width).to.be.equal(70);
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
      cy.wait(['@datafilesCount', '@datasets', '@datafilesOrder'], {
        timeout: 10000,
      });
    });

    it('ascending order', () => {
      cy.contains('[role="button"]', 'Location')
        .click()
        .wait('@datafilesCount', { timeout: 10000 });

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
        '/act/friend/general.jpeg'
      );
    });

    it('descending order', () => {
      cy.contains('[role="button"]', 'Location')
        .click()
        .wait('@datafilesCount', { timeout: 10000 });
      cy.contains('[role="button"]', 'Location')
        .click()
        .wait('@datafilesCount', { timeout: 10000 });

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc')
        .eq(1)
        .should('not.have.css', 'opacity', '0');
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
        'yes/glass/them.jpg'
      );
    });

    it('no order', () => {
      cy.contains('[role="button"]', 'Location')
        .click()
        .wait('@datafilesCount', { timeout: 10000 });
      cy.contains('[role="button"]', 'Location')
        .click()
        .wait('@datafilesCount', { timeout: 10000 });
      cy.contains('[role="button"]', 'Location')
        .click()
        .wait('@datafilesCount', { timeout: 10000 });

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.be.visible');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
        '/year/how/structure.tiff'
      );
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Create Time')
        .click()
        .wait('@datafilesCount', { timeout: 10000 });
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datafilesCount', { timeout: 10000 });
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datafilesCount', { timeout: 10000 });

      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Datafile 1940'
      );
    });
  });

  describe('should be able to filter by', () => {
    beforeEach(() => {
      cy.wait(['@datafilesCount', '@datasets', '@datafilesOrder'], {
        timeout: 10000,
      });
    });

    it('text', () => {
      cy.get('[aria-label="Filter by Location"]').find('input').type('ok');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Datafile 13915'
      );
    });

    it('date between', () => {
      cy.get('[aria-label="Create Time date filter from"]').type('2019-01-01');

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
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Datafile 14873'
      );
      cy.get('[aria-rowindex="2"] [aria-colindex="3"]').contains(
        'Datafile 20621'
      );
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Name"]')
        .find('input')
        .type('5')
        .wait('@datafilesCount', { timeout: 10000 });

      cy.get('[aria-label="Filter by Location"]')
        .find('input')
        .type('.png')
        .wait('@datafilesCount', { timeout: 10000 });

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Datafile 15352'
      );
    });
  });

  describe('should be able to view details', () => {
    it('when no other row is showing details', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    it('when another row is showing details', () => {
      cy.get('[aria-label="Show details"]').eq(1).click();

      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').contains('Datafile 24').should('be.visible');
      cy.get('#details-panel')
        .contains('Datafile 3377')
        .should('not.be.visible');
      cy.get('[aria-label="Hide details"]').should('have.length', 1);
    });

    it('and then not view details anymore', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('[aria-label="Hide details"]').first().click();

      cy.get('#details-panel').should('not.be.visible');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });
});
