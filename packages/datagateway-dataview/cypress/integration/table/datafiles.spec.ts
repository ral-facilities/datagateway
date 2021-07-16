describe('Datafiles Table', () => {
  beforeEach(() => {
    cy.intercept('/investigations/1').as('investigations');
    cy.intercept('/datasets/1').as('datasets');
    cy.intercept('/datafiles/count').as('datafilesCount');
    cy.intercept('/datafiles?order=').as('datafilesOrder');
    cy.login();
    cy.visit('/browse/investigation/1/dataset/1/datafile');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should not load incorrect URL', () => {
    cy.visit('/browse/investigation/2/dataset/1/datafile');

    cy.contains('Oops!').should('be.visible');
    cy.get('[role="grid"]').should('not.exist');
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

  it('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="55"]').should('exist');
  });

  describe('should be able to sort by', () => {
    beforeEach(() => {
      cy.wait(
        [
          '@investigations',
          '@datafilesCount',
          '@datasets',
          '@datafilesOrder',
          '@datafilesOrder',
        ],
        {
          timeout: 10000,
        }
      );
    });

    it('ascending order', () => {
      cy.contains('[role="button"]', 'Location')
        .click()
        .wait('@datafilesOrder', { timeout: 10000 });

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
        '/anyone/structure/my.jpg'
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
        '/you/want/special.jpeg'
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
        '/authority/thousand/treatment.tiff'
      );
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Modified Time')
        .click()
        .wait('@datafilesOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datafilesOrder', { timeout: 10000 });
      cy.contains('[role="button"]', 'Name')
        .click()
        .wait('@datafilesOrder', { timeout: 10000 });

      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Datafile 13412'
      );
    });
  });

  describe('should be able to filter by', () => {
    beforeEach(() => {
      cy.wait(
        [
          '@investigations',
          '@datafilesCount',
          '@datasets',
          '@datafilesOrder',
          '@datafilesOrder',
        ],
        {
          timeout: 10000,
        }
      );
    });

    it('text', () => {
      cy.get('[aria-label="Filter by Location"]')
        .find('input')
        .first()
        .type('treatment');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Datafile 479'
      );
    });

    it('date between', () => {
      cy.get('[aria-label="Modified Time date filter from"]').type(
        '2019-01-01'
      );

      cy.get('[aria-label="Modified Time date filter to"]')
        .parent()
        .find('button')
        .click();

      cy.get('.MuiPickersDay-day[tabindex="0"]').first().click();

      cy.contains('OK').click();

      const date = new Date();
      date.setDate(1);

      cy.get('[aria-label="Modified Time date filter to"]').should(
        'have.value',
        date.toISOString().slice(0, 10)
      );

      cy.get('[aria-rowcount="2"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Datafile 2395'
      );
      cy.get('[aria-rowindex="2"] [aria-colindex="3"]').contains(
        'Datafile 11975'
      );
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Name"]')
        .find('input')
        .first()
        .type('4')
        .wait('@datafilesCount', { timeout: 10000 });
      cy.get('[aria-label="Filter by Location"]')
        .find('input')
        .first()
        .type('.jpeg')
        .wait('@datafilesCount', { timeout: 10000 });

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Datafile 14370'
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

      cy.get('#details-panel').contains('Datafile 479').should('be.visible');
      cy.get('#details-panel').contains('Datafile 3377').should('not.exist');
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
