describe('Add/remove from cart functionality', () => {
  beforeEach(() => {
    cy.login();
    cy.clearDownloadCart();
    cy.intercept('/datasets/').as('getDataset');
    cy.intercept('/investigations/').as('getInvestigation');
    cy.intercept('/instruments/1').as('getInstrument');
    cy.intercept('/facilitycycles/14').as('getFacilityCycle');
  });

  describe('should be able to select datafiles', () => {
    beforeEach(() => {
      cy.intercept('/datafiles?').as('getDatafiles');
      cy.intercept('/datafiles/count').as('getDatafileCount');
    });

    describe('in generic table', () => {
      beforeEach(() => {
        cy.visit('/browse/investigation/1/dataset/25/datafile').wait([
          '@getDatafiles',
          '@getDatafiles',
          '@getDatafileCount',
          '@getDataset',
          '@getDataset',
          '@getInvestigation',
        ]);
      });

      it('individually', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');
      });

      it('and unselect them individually', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="select row 0"]').uncheck();
        cy.get('[aria-label="select row 0"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items', () => {
        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get(
          `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
        ).should('be.checked');

        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get(`[aria-label="select row 55"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 })
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items in a filtered table', () => {
        cy.get('[aria-label="Filter by Location"]')
          .find('input')
          .first()
          .type('e')
          .wait(['@getDatafiles', '@getDatafiles', '@getDatafileCount']);

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get(
          `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
        ).should('be.checked');

        cy.get('[aria-label="Filter by Location"]')
          .find('input')
          .first()
          .clear()
          .wait(['@getDatafiles', '@getDatafiles', '@getDatafileCount']);

        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');

        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select row 1"]').should('be.checked');

        cy.get('[aria-label="grid"]').scrollTo(0, 350);
        cy.get('[aria-label="select row 17"]').should('not.be.checked');

        cy.get('[aria-label="grid"]').scrollTo('bottom').wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get('[aria-label="select row 54"]').should('be.checked');
        cy.get('[aria-label="select row 55"]').should('be.checked');
      });

      it('and unselect all items', () => {
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get('[aria-label="grid"]').scrollTo('bottom');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );

        cy.reload().wait([
          '@getDatafiles',
          '@getDatafiles',
          '@getDatafileCount',
          '@getDataset',
          '@getDataset',
          '@getInvestigation',
        ]);

        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get('[aria-label="select all rows"]').uncheck();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get(
          `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
        ).should('not.be.checked');

        cy.get('[aria-label="grid"]').scrollTo('bottom').wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get(`[aria-label="select row 55"]`).should('not.be.checked');
        cy.get('[aria-label="select all rows"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by shift clicking', () => {
        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('body')
          .type('{shift}', { release: false })
          .get('[aria-label="select row 5"]')
          .click();
        cy.get('[aria-label="select row 5"]').should('be.checked');

        cy.get('[aria-label="grid"]').scrollTo('top');
        cy.get('[aria-label="select row 4"]').should('be.checked');
        cy.get('[aria-label="select row 3"]').should('be.checked');
        cy.get('[aria-label="select row 2"]').should('be.checked');
        cy.get('[aria-label="select row 1"]').should('be.checked');
      });

      it('and unselect by shift clicking', () => {
        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('body')
          .type('{shift}', { release: false })
          .get('[aria-label="select row 5"]')
          .click();
        cy.get('[aria-label="select row 5"]').should('be.checked');

        cy.get('[aria-label="grid"]').scrollTo('top');
        cy.get('[aria-label="select row 2"]').click();
        cy.get('[aria-label="select row 2"]').should('not.be.checked');

        cy.get('[aria-label="grid"]').scrollTo('top');
        cy.get('[aria-label="select row 5"]').should('not.be.checked');
        cy.get('[aria-label="select row 4"]').should('not.be.checked');
        cy.get('[aria-label="select row 3"]').should('not.be.checked');
        cy.get('[aria-label="select row 2"]').should('not.be.checked');

        cy.get('[aria-label="select row 1"]').should('be.checked');
        cy.get('[aria-label="select row 0"]').should('be.checked');
      });
    });

    describe('in DLS table', () => {
      beforeEach(() => {
        cy.visit(
          '/browse/proposal/INVESTIGATION%201/investigation/1/dataset/25/datafile'
        ).wait(['@getDatafiles', '@getDatafiles', '@getDatafileCount']);
      });

      it('individually', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');
      });

      it('and unselect them individually', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="select row 0"]').uncheck();
        cy.get('[aria-label="select row 0"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items', () => {
        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get(
          `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
        ).should('be.checked');

        cy.get('[aria-label="grid"]').scrollTo('bottom').wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get(`[aria-label="select row 55"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 })
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items in a filtered table', () => {
        cy.get('[aria-label="Filter by Location"]')
          .find('input')
          .first()
          .type('e')
          .wait(['@getDatafiles', '@getDatafiles', '@getDatafileCount']);

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get(
          `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
        ).should('be.checked');

        cy.get('[aria-label="Filter by Location"]')
          .find('input')
          .first()
          .clear()
          .wait(['@getDatafiles', '@getDatafiles', '@getDatafileCount']);

        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');

        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select row 1"]').should('be.checked');

        cy.get('[aria-label="grid"]').scrollTo(0, 350);
        cy.get('[aria-label="select row 17"]').should('not.be.checked');

        cy.get('[aria-label="grid"]').scrollTo('bottom').wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get('[aria-label="select row 54"]').should('be.checked');
        cy.get('[aria-label="select row 55"]').should('be.checked');
      });

      it('and unselect all items', () => {
        cy.get('[aria-label="grid"]').scrollTo('bottom').wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );

        cy.reload().wait(['@getDatafiles', '@getDatafiles']);

        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get('[aria-label="select all rows"]').uncheck();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get(
          `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
        ).should('not.be.checked');

        cy.get('[aria-label="grid"]').scrollTo('bottom').wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get(`[aria-label="select row 55"]`).should('not.be.checked');
        cy.get('[aria-label="select all rows"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by shift clicking', () => {
        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('body')
          .type('{shift}', { release: false })
          .get('[aria-label="select row 5"]')
          .click();
        cy.get('[aria-label="select row 5"]').should('be.checked');

        cy.get('[aria-label="grid"]').scrollTo('top');
        cy.get('[aria-label="select row 4"]').should('be.checked');
        cy.get('[aria-label="select row 3"]').should('be.checked');
        cy.get('[aria-label="select row 2"]').should('be.checked');
        cy.get('[aria-label="select row 1"]').should('be.checked');
      });

      it('and unselect by shift clicking', () => {
        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('body')
          .type('{shift}', { release: false })
          .get('[aria-label="select row 5"]')
          .click();
        cy.get('[aria-label="select row 5"]').should('be.checked');

        cy.get('[aria-label="grid"]').scrollTo('top');
        cy.get('[aria-label="select row 2"]').click();
        cy.get('[aria-label="select row 2"]').should('not.be.checked');

        cy.get('[aria-label="grid"]').scrollTo('top');
        cy.get('[aria-label="select row 5"]').should('not.be.checked');
        cy.get('[aria-label="select row 4"]').should('not.be.checked');
        cy.get('[aria-label="select row 3"]').should('not.be.checked');
        cy.get('[aria-label="select row 2"]').should('not.be.checked');

        cy.get('[aria-label="select row 1"]').should('be.checked');
        cy.get('[aria-label="select row 0"]').should('be.checked');
      });
    });

    describe('in ISIS table', () => {
      beforeEach(() => {
        cy.visit(
          '/browse/instrument/1/facilityCycle/14/investigation/87/dataset/118/datafile'
        ).wait(['@getDatafiles', '@getDatafiles', '@getDatafileCount']);
      });

      it('individually', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');
      });

      it('and unselect them individually', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="select row 0"]').uncheck();
        cy.get('[aria-label="select row 0"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items', () => {
        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get(
          `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
        ).should('be.checked');

        cy.get('[aria-label="grid"]').scrollTo('bottom').wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get(`[aria-label="select row 54"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 })
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items in a filtered table', () => {
        cy.get('[aria-label="Filter by Location"]')
          .find('input')
          .first()
          .type('e')
          .wait(['@getDatafiles', '@getDatafiles']);

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get(
          `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
        ).should('be.checked');

        cy.get('[aria-label="Filter by Location"]')
          .find('input')
          .first()
          .clear()
          .wait(['@getDatafiles', '@getDatafiles']);
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');

        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select row 1"]').should('be.checked');
        cy.get('[aria-label="select row 2"]').should('not.be.checked');
        cy.get('[aria-label="select row 3"]').should('not.be.checked');

        cy.get('[aria-label="grid"]').scrollTo('bottom').wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get('[aria-label="select row 53"]').should('not.be.checked');
        cy.get('[aria-label="select row 54"]').should('be.checked');
      });

      it('and unselect all items', () => {
        cy.get('[aria-label="grid"]').scrollTo('bottom').wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );

        cy.reload().wait([
          '@getDatafiles',
          '@getDatafiles',
          '@getDatafileCount',
        ]);

        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get('[aria-label="select all rows"]').uncheck();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get(
          `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
        ).should('not.be.checked');

        cy.get('[aria-label="grid"]').scrollTo('bottom').wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get(`[aria-label="select row 54"]`).should('not.be.checked');
        cy.get('[aria-label="select all rows"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by shift clicking', () => {
        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('body')
          .type('{shift}', { release: false })
          .get('[aria-label="select row 5"]')
          .click();
        cy.get('[aria-label="select row 5"]').should('be.checked');

        cy.get('[aria-label="grid"]').scrollTo('top');
        cy.get('[aria-label="select row 4"]').should('be.checked');
        cy.get('[aria-label="select row 3"]').should('be.checked');
        cy.get('[aria-label="select row 2"]').should('be.checked');
        cy.get('[aria-label="select row 1"]').should('be.checked');
      });

      it('and unselect by shift clicking', () => {
        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('body')
          .type('{shift}', { release: false })
          .get('[aria-label="select row 5"]')
          .click();
        cy.get('[aria-label="select row 5"]').should('be.checked');

        cy.get('[aria-label="grid"]').scrollTo('top');
        cy.get('[aria-label="select row 2"]').click();
        cy.get('[aria-label="select row 2"]').should('not.be.checked');

        cy.get('[aria-label="grid"]').scrollTo('top');
        cy.get('[aria-label="select row 5"]').should('not.be.checked');
        cy.get('[aria-label="select row 4"]').should('not.be.checked');
        cy.get('[aria-label="select row 3"]').should('not.be.checked');
        cy.get('[aria-label="select row 2"]').should('not.be.checked');

        cy.get('[aria-label="select row 1"]').should('be.checked');
        cy.get('[aria-label="select row 0"]').should('be.checked');
      });
    });
  });

  describe('should be able to select datasets', () => {
    beforeEach(() => {
      cy.intercept('/datasets?').as('getDatasets');
      cy.intercept('/datasets/count').as('getDatasetCount');
    });

    describe('in generic table', () => {
      beforeEach(() => {
        cy.visit('/browse/investigation/1/dataset').wait([
          '@getDatasets',
          '@getDatasets',
          '@getDatasetCount',
        ]);
      });

      it('individually', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');
        cy.get('[aria-label="select all rows"]').should('not.be.checked');
      });

      it('and unselect them individually', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="select row 0"]').uncheck();
        cy.get('[aria-label="select row 0"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get('[aria-label="select all rows"]').should('not.be.checked');
      });

      it('by all items', () => {
        cy.get(`[aria-label="select row 0"]`).should('exist');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get(`[aria-label="select row 0"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('and unselect all items', () => {
        cy.get(`[aria-label="select row 0"]`).should('exist');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );

        cy.get('[aria-label="select all rows"]').uncheck();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get(`[aria-label="select row 0"]`).should('not.be.checked');
      });
    });

    describe('in DLS table', () => {
      beforeEach(() => {
        cy.visit(
          '/browse/proposal/INVESTIGATION%201/investigation/1/dataset'
        ).wait(['@getDatasets', '@getDatasets', '@getDatasetCount']);
      });

      it('individually', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');
        cy.get('[aria-label="select all rows"]').should('not.be.checked');
      });

      it('and unselect them individually', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="select row 0"]').uncheck();
        cy.get('[aria-label="select row 0"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get('[aria-label="select all rows"]').should('not.be.checked');
      });

      it('by all items', () => {
        cy.get(`[aria-label="select row 0"]`).should('exist');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get(`[aria-label="select row 0"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('and unselect all items', () => {
        cy.get(`[aria-label="select row 0"]`).should('exist');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );

        cy.get('[aria-label="select all rows"]').uncheck();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get(`[aria-label="select row 0"]`).should('not.be.checked');
      });
    });

    describe('in ISIS table', () => {
      beforeEach(() => {
        cy.visit(
          '/browse/instrument/1/facilityCycle/14/investigation/87/dataset'
        ).wait(['@getDatasets', '@getDatasets', '@getDatasetCount']);
      });

      it('individually', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');
        cy.get('[aria-label="select all rows"]').should('not.be.checked');
      });

      it('and unselect them individually', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="select row 0"]').uncheck();
        cy.get('[aria-label="select row 0"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get('[aria-label="select all rows"]').should('not.be.checked');
      });

      it('by all items', () => {
        cy.get(`[aria-label="select row 0"]`).should('exist');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get(`[aria-label="select row 0"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('and unselect all items', () => {
        cy.get(`[aria-label="select row 0"]`).should('exist');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );

        cy.get('[aria-label="select all rows"]').uncheck();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get(`[aria-label="select row 0"]`).should('not.be.checked');
      });
    });
  });

  describe('should be able to select investigations', () => {
    beforeEach(() => {
      cy.intercept('/investigations?').as('getInvestigations');
      cy.intercept('/investigations/count').as('getInvestigationCount');
    });

    describe('in generic table', () => {
      beforeEach(() => {
        cy.visit('/browse/investigation').wait([
          '@getInvestigations',
          '@getInvestigations',
          '@getInvestigationCount',
        ]);
      });

      it('individually', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');
      });

      it('and unselect them individually', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="select row 0"]').uncheck();
        cy.get('[aria-label="select row 0"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items', () => {
        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get(
          `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
        ).should('be.checked');

        cy.get('[aria-label="grid"]')
          .scrollTo('bottom')
          .wait('@getInvestigations');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get(`[aria-label="select row 55"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 })
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items in a filtered table', () => {
        cy.get('[aria-label="Filter by Visit ID"]')
          .find('input')
          .first()
          .type('6')
          .wait(['@getInvestigations', '@getInvestigations']);

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get(
          `[aria-label="select row ${Math.floor(Math.random() * 3)}"]`
        ).should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');

        cy.get('[aria-label="Filter by Visit ID"]')
          .find('input')
          .first()
          .clear()
          .wait(['@getInvestigations', '@getInvestigations']);
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');

        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select row 1"]').should('not.be.checked');
        cy.get('[aria-label="select row 2"]').should('not.be.checked');
        cy.get('[aria-label="select row 3"]').should('be.checked');

        cy.get('[aria-label="grid"]')
          .scrollTo('bottom')
          .wait('@getInvestigations');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get('[aria-label="select row 54"]').should('be.checked');
        cy.get('[aria-label="select row 58"]').should('be.checked');
      });

      it('and unselect all items', () => {
        cy.get('[aria-label="grid"]')
          .scrollTo('bottom')
          .wait('@getInvestigations');
        cy.get('[aria-label="grid"]').scrollTo('bottom');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );

        cy.reload().wait(['@getInvestigations', '@getInvestigations']);

        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get('[aria-label="select all rows"]').uncheck();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get(
          `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
        ).should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');

        cy.get('[aria-label="grid"]')
          .scrollTo('bottom')
          .wait('@getInvestigations');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get(`[aria-label="select row 55"]`).should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by shift clicking', () => {
        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('body')
          .type('{shift}', { release: false })
          .get('[aria-label="select row 5"]')
          .click();
        cy.get('[aria-label="select row 5"]').should('be.checked');

        cy.get('[aria-label="grid"]').scrollTo('top');
        cy.get('[aria-label="select row 4"]').should('be.checked');
        cy.get('[aria-label="select row 3"]').should('be.checked');
        cy.get('[aria-label="select row 2"]').should('be.checked');
        cy.get('[aria-label="select row 1"]').should('be.checked');
      });

      it('and unselect by shift clicking', () => {
        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('body')
          .type('{shift}', { release: false })
          .get('[aria-label="select row 5"]')
          .click();
        cy.get('[aria-label="select row 5"]').should('be.checked');

        cy.get('[aria-label="grid"]').scrollTo('top');
        cy.get('[aria-label="select row 2"]').click();
        cy.get('[aria-label="select row 2"]').should('not.be.checked');

        cy.get('[aria-label="grid"]').scrollTo('top');
        cy.get('[aria-label="select row 5"]').should('not.be.checked');
        cy.get('[aria-label="select row 4"]').should('not.be.checked');
        cy.get('[aria-label="select row 3"]').should('not.be.checked');
        cy.get('[aria-label="select row 2"]').should('not.be.checked');

        cy.get('[aria-label="select row 1"]').should('be.checked');
        cy.get('[aria-label="select row 0"]').should('be.checked');
      });
    });

    describe('in ISIS browse table', () => {
      beforeEach(() => {
        cy.visit('/browse/instrument/1/facilityCycle/14/investigation').wait([
          '@getInvestigations',
          '@getInvestigations',
          '@getInvestigationCount',
        ]);
      });

      it('individually', () => {
        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get('[aria-label="select all rows"]').should('be.checked');
      });

      it('and unselect them individually', () => {
        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get('[aria-label="select all rows"]').should('not.be.checked');
      });

      it('by all items', () => {
        cy.get(`[aria-label="select row 0"]`).should('exist');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get(`[aria-label="select row 0"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('and unselect all items', () => {
        cy.get(`[aria-label="select row 0"]`).should('exist');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );

        cy.get('[aria-label="select all rows"]').uncheck();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get(`[aria-label="select row 0"]`).should('not.be.checked');
      });
    });

    describe('in ISIS my data table', () => {
      beforeEach(() => {
        cy.visit('/my-data/ISIS').wait([
          '@getInvestigations',
          '@getInvestigations',
          '@getInvestigationCount',
        ]);
      });

      it('individually', () => {
        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get('[aria-label="select all rows"]').should('be.checked');
      });

      it('and unselect them individually', () => {
        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get('[aria-label="select all rows"]').should('not.be.checked');
      });

      it('by all items', () => {
        cy.get(`[aria-label="select row 0"]`).should('exist');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get(`[aria-label="select row 0"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('and unselect all items', () => {
        cy.get(`[aria-label="select row 0"]`).should('exist');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );

        cy.get('[aria-label="select all rows"]').uncheck();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get(`[aria-label="select row 0"]`).should('not.be.checked');
      });
    });
  });
});
