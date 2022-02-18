describe('ISIS - Datafiles Table', () => {
  beforeEach(() => {
    cy.intercept('/instruments/1').as('instruments');
    cy.intercept('/facilitycycles/16').as('facilityCycles');
    cy.intercept('/datasets/337').as('datasets');
    cy.intercept('/datafiles/count').as('datafilesCount');
    cy.intercept('/datafiles?order=').as('datafilesOrder');
    cy.login();
  });

  describe('Wait for initial requests', () => {
    beforeEach(() => {
      cy.visit(
        '/browse/instrument/1/facilityCycle/16/investigation/97/dataset/337/datafile'
      ).wait(
        [
          '@instruments',
          '@instruments',
          '@facilityCycles',
          '@datasets',
          '@datafilesCount',
          '@datafilesOrder',
        ],
        {
          timeout: 10000,
        }
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
      cy.visit(
        '/browse/instrument/2/facilityCycle/14/investigation/88/dataset/118/datafile'
      );

      cy.contains('Oops!').should('be.visible');
      cy.get('[role="grid"]').should('not.exist');
    });

    it('should be able to scroll down and load more rows', () => {
      cy.get('[aria-rowcount="50"]').should('exist');
      cy.get('[aria-label="grid"]').scrollTo('bottom');
      cy.get('[aria-rowcount="55"]').should('exist');
    });

    describe('should be able to sort by', () => {
      beforeEach(() => {
        //Revert the default sort
        cy.contains('[role="button"]', 'Modified Time')
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
          '/according/wrong/only.tiff'
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
          '/yes/beyond/property.jpeg'
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
          'Datafile 25244'
        );
      });
    });

    describe('should be able to filter by', () => {
      it('text', () => {
        cy.get('[aria-label="Filter by Location"]').first().type('star');

        cy.get('[aria-rowcount="1"]').should('exist');
        cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
          'Datafile 336'
        );
      });

      it('date between', () => {
        cy.get('input[id="Modified Time filter from"]').type('2018-08-12');

        cy.get('input[aria-label="Modified Time filter to"]')
          .parent()
          .find('button')
          .click();

        cy.get('.MuiPickersDay-root[tabindex="-1"]').first().click();

        const date = new Date();
        date.setDate(1);

        cy.get('input[id="Modified Time filter to"]').should(
          'have.value',
          date.toISOString().slice(0, 10)
        );

        cy.get('[aria-rowcount="2"]').should('exist');
        cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
          'Datafile 6084'
        );
      });

      it('multiple columns', () => {
        cy.get('[aria-label="Filter by Name"]')
          .first()
          .type('5')
          .wait('@datafilesOrder', { timeout: 10000 });

        cy.get('[aria-label="Filter by Location"]')
          .first()
          .type('.png')
          .wait('@datafilesOrder', { timeout: 10000 });

        cy.get('[aria-rowcount="3"]').should('exist');
        cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
          'Datafile 6563'
        );
      });
    });

    describe('should be able to view details', () => {
      beforeEach(() => {
        //Revert the default sort
        cy.contains('[role="button"]', 'Modified Time')
          .click()
          .wait('@datafilesOrder', { timeout: 10000 });
      });

      it('when no other row is showing details', () => {
        cy.get('[aria-label="Show details"]').first().click();

        cy.get('#details-panel').should('be.visible');
        cy.get('[aria-label="Hide details"]').should('exist');
      });

      it('when another other row is showing details', () => {
        cy.get('[aria-label="Show details"]').eq(1).click();

        cy.get('[aria-label="Show details"]').first().click();

        cy.get('#details-panel').contains('Datafile 336').should('be.visible');
        cy.get('#details-panel').contains('Datafile 3470').should('not.exist');
        cy.get('[aria-label="Hide details"]').should('have.length', 1);
      });

      it('and view datafile details and parameters', () => {
        cy.get('[aria-label="Show details"]').first().click();

        cy.get('[aria-controls="datafile-details-panel"]').should('be.visible');

        cy.get('#details-panel')
          .contains(
            'Near stand agreement music character require same. Can news some government. Ahead information tree station. Painting see attack space.'
          )
          .should('be.visible');

        cy.get('[aria-controls="datafile-parameters-panel"]').should(
          'be.visible'
        );
        cy.get('[aria-controls="datafile-parameters-panel"]').click();

        cy.get('#parameter-grid').should('be.visible');
      });

      it('and then not view details anymore', () => {
        cy.get('[aria-label="Show details"]').first().click();

        cy.get('[aria-label="Hide details"]').first().click();

        cy.get('#details-panel').should('not.exist');
        cy.get('[aria-label="Hide details"]').should('not.exist');
      });
    });
  });

  describe('Do not wait for initial requests', () => {
    beforeEach(() => {
      cy.visit(
        '/browse/instrument/1/facilityCycle/16/investigation/97/dataset/337/datafile'
      );
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
  });
});
