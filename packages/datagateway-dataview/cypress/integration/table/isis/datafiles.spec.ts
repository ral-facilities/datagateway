describe('ISIS - Datafiles Table', () => {
  beforeEach(() => {
    cy.intercept('/instruments/1').as('instruments');
    cy.intercept('/facilitycycles/14').as('facilityCycles');
    cy.intercept('/datasets/118').as('datasets');
    cy.intercept('/datafiles/count').as('datafilesCount');
    cy.intercept('/datafiles?order=').as('datafilesOrder');
    cy.login();
  });

  describe('Wait for initial requests', () => {
    beforeEach(() => {
      cy.visit(
        '/browse/instrument/1/facilityCycle/14/investigation/87/dataset/118/datafile'
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
      it('ascending order', () => {
        cy.contains('[role="button"]', 'Location')
          .click()
          .wait('@datafilesOrder', { timeout: 10000 });

        cy.get('[aria-sort="ascending"]').should('exist');
        cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
        cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
          '/ability/save/time.png'
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
          '/worry/anything/able.bmp'
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
          'Datafile 13529'
        );
      });
    });

    describe('should be able to filter by', () => {
      it('text', () => {
        cy.get('[aria-label="Filter by Location"]')
          .find('input')
          .first()
          .type('sea');

        cy.get('[aria-rowcount="1"]').should('exist');
        cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
          'Datafile 17361'
        );
      });

      it('date between', () => {
        cy.get('[aria-label="Modified Time date filter from"]').type(
          '2018-08-12'
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

        cy.get('[aria-rowcount="1"]').should('exist');
        cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
          'Datafile 7302'
        );
      });

      it('multiple columns', () => {
        cy.get('[aria-label="Filter by Name"]')
          .find('input')
          .first()
          .type('5')
          .wait('@datafilesOrder', { timeout: 10000 });

        cy.get('[aria-label="Filter by Location"]')
          .find('input')
          .first()
          .type('.png')
          .wait('@datafilesOrder', { timeout: 10000 });

        cy.get('[aria-rowcount="4"]').should('exist');
        cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
          'Datafile 5865'
        );
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

        cy.get('#details-panel').contains('Datafile 117').should('be.visible');
        cy.get('#details-panel').contains('Datafile 3470').should('not.exist');
        cy.get('[aria-label="Hide details"]').should('have.length', 1);
      });

      it('and view datafile details and parameters', () => {
        cy.get('[aria-label="Show details"]').first().click();

        cy.get('[aria-controls="datafile-details-panel"]').should('be.visible');

        cy.get('#details-panel')
          .contains(
            'Remember word economic catch. After television scene alone. Partner send rise your. Exist room long success financial. Help itself culture money child realize take rise.'
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
        '/browse/instrument/1/facilityCycle/14/investigation/87/dataset/118/datafile'
      );
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
  });
});
