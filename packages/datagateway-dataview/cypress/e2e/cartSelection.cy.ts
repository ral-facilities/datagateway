describe('Add/remove from cart functionality', () => {
  beforeEach(() => {
    cy.login();
    cy.clearDownloadCart();
    cy.intercept('**/datasets/*').as('getDataset');
    cy.intercept('**/investigations/**').as('getInvestigation');
    cy.intercept('**/instruments/1/*').as('getInstrument');
    cy.intercept('**/facilitycycles/19/**').as('getFacilityCycle');
  });

  describe('should be able to select datafiles', () => {
    beforeEach(() => {
      cy.intercept('**/datafiles?*').as('getDatafiles');
      cy.intercept('**/datafiles/count?*').as('getDatafileCount');
    });

    describe('in generic table', () => {
      beforeEach(() => {
        cy.visit('/browse/investigation/1/dataset/1/datafile').wait([
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
        cy.get('[aria-label="selection-alert-text"]')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal('1 item has been added to selection.');
          });
      });

      it('and unselect them individually', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="select row 0"]').uncheck();
        cy.get('[aria-label="select row 0"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get('[aria-label="selection-alert-text"]')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal(
              '1 item has been removed from selection.'
            );
          });
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

        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get(`[aria-label="select row 14"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 })
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get('[aria-label="selection-alert-text"]')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal('15 items have been added to selection.');
          });
      });

      it('by all items in a filtered table', () => {
        cy.get('[aria-label="Filter by Location"]')
          .first()
          .type('s')
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

        cy.get('[aria-label="Filter by Location"]').first().clear();

        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');

        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select row 1"]').should('not.be.checked');

        //cy.get('[aria-label="grid"]').scrollTo(0, 350);
        cy.get('[aria-label="select row 9"]').should('not.be.checked');

        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="select row 12"]').should('be.checked');
        cy.get('[aria-label="select row 14"]').should('be.checked');
      });

      it('and unselect all items', () => {
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });

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

        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get(`[aria-label="select row 14"]`).should('not.be.checked');
        cy.get('[aria-label="select all rows"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');

        cy.get('[aria-label="selection-alert-text"]')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal(
              '15 items have been removed from selection.'
            );
          });
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

        cy.get('[aria-label="selection-alert-text"]')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal('5 items have been added to selection.');
          });
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

        cy.get('[aria-label="selection-alert-text"]')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal(
              '4 items have been removed from selection.'
            );
          });
      });

      it('and navigate to selection using banner', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="selection-alert-link"]').click();
        cy.location().should((loc) => {
          expect(loc.pathname).to.equal('/download');
        });
      });
    });

    describe('in DLS table', () => {
      beforeEach(() => {
        cy.visit(
          '/browse/proposal/INVESTIGATION%201/investigation/1/dataset/1/datafile'
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

        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get(`[aria-label="select row 14"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 })
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items in a filtered table', () => {
        cy.get('[aria-label="Filter by Location"]')
          .first()
          .type('s')
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

        cy.get('[aria-label="Filter by Location"]').first().clear();

        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');

        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select row 1"]').should('not.be.checked');

        //cy.get('[aria-label="grid"]').scrollTo(0, 350);
        //cy.get('[aria-label="select row 14"]').should('not.be.checked');

        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="select row 13"]').should('not.be.checked');
        cy.get('[aria-label="select row 14"]').should('be.checked');
      });

      it('and unselect all items', () => {
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        }); //.wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });

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

        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get(`[aria-label="select row 14"]`).should('not.be.checked');
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

      it('and navigate to selection using banner', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="selection-alert-link"]').click();
        cy.location().should((loc) => {
          expect(loc.pathname).to.equal('/download');
        });
      });
    });

    describe('in ISIS table', () => {
      beforeEach(() => {
        cy.visit(
          '/browse/instrument/1/facilityCycle/19/investigation/19/dataset/79/datafile'
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

        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get(`[aria-label="select row 14"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 })
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items in a filtered table', () => {
        cy.get('[aria-label="Filter by Location"]')
          .first()
          .type('g')
          .wait(['@getDatafiles', '@getDatafiles']);

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get(
          `[aria-label="select row ${Math.floor(Math.random() * 6)}"]`
        ).should('be.checked');

        cy.get('[aria-label="Filter by Location"]').first().clear();

        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');

        cy.get('[aria-label="select row 4"]').should('be.checked');
        cy.get('[aria-label="select row 10"]').should('not.be.checked');
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="grid"]')
          .scrollTo('bottom', { ensureScrollable: false })
          .wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="select row 13"]').should('not.be.checked');
        cy.get('[aria-label="select row 14"]').should('be.checked');
      });

      it('and unselect all items', () => {
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });

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

        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get(`[aria-label="select row 14"]`).should('not.be.checked');
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

      it('and navigate to selection using banner', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="selection-alert-link"]').click();
        cy.location().should((loc) => {
          expect(loc.pathname).to.equal('/download');
        });
      });
    });
  });

  describe('should be able to select datasets', () => {
    beforeEach(() => {
      cy.intercept('**/datasets?*').as('getDatasets');
      cy.intercept('**/datasets/count?*').as('getDatasetCount');
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
        cy.get('[aria-label="selection-alert-text"]')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal('1 item has been added to selection.');
          });
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
        cy.get('[aria-label="selection-alert-text"]')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal(
              '1 item has been removed from selection.'
            );
          });
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
        cy.get('[aria-label="selection-alert-text"]')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal('2 items have been added to selection.');
          });
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
        cy.get('[aria-label="selection-alert-text"]')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal(
              '2 items have been removed from selection.'
            );
          });
      });

      it('and navigate to selection using banner', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="selection-alert-link"]').click();
        cy.location().should((loc) => {
          expect(loc.pathname).to.equal('/download');
        });
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

      it('and navigate to selection using banner', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="selection-alert-link"]').click();
        cy.location().should((loc) => {
          expect(loc.pathname).to.equal('/download');
        });
      });
    });

    describe('in ISIS table', () => {
      beforeEach(() => {
        cy.visit(
          '/browse/instrument/1/facilityCycle/19/investigation/79/dataset'
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

      it('and navigate to selection using banner', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="selection-alert-link"]').click();
        cy.location().should((loc) => {
          expect(loc.pathname).to.equal('/download');
        });
      });
    });
  });

  describe('should be able to select investigations', () => {
    beforeEach(() => {
      cy.intercept('**/investigations?*').as('getInvestigations');
      cy.intercept('**/investigations/count').as('getInvestigationCount');
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
        cy.get('[aria-label="selection-alert-text"]')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal('1 item has been added to selection.');
          });
      });

      it('and unselect them individually', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="select row 0"]').uncheck();
        cy.get('[aria-label="select row 0"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get('[aria-label="selection-alert-text"]')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal(
              '1 item has been removed from selection.'
            );
          });
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

        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get(`[aria-label="select row 54"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 })
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get('[aria-label="selection-alert-text"]')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal('59 items have been added to selection.');
          });
      });

      it('by all items in a filtered table', () => {
        cy.get('[aria-label="Filter by Visit ID"]')
          .first()
          .type('4')
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

        cy.get('[aria-label="Filter by Visit ID"]').first().clear();

        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');

        cy.get('[aria-label="select row 1"]').should('be.checked');
        cy.get('[aria-label="select row 2"]').should('not.be.checked');
        cy.get('[aria-label="select row 7"]').should('not.be.checked');
        cy.get('[aria-label="select row 8"]').should('be.checked');

        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="select row 11"]').should('be.checked');
        cy.get('[aria-label="select row 13"]').should('be.checked');
      });

      it('and unselect all items', () => {
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });

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

        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get('[aria-label="grid"]').scrollTo('bottom', {
          ensureScrollable: false,
        });
        cy.get(`[aria-label="select row 14"]`).should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');

        cy.get('[aria-label="selection-alert-text"]')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal(
              '59 items have been removed from selection.'
            );
          });
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

        cy.get('[aria-label="selection-alert-text"]')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal('5 items have been added to selection.');
          });
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

        cy.get('[aria-label="selection-alert-text"]')
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal(
              '4 items have been removed from selection.'
            );
          });
      });

      it('and navigate to selection using banner', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="selection-alert-link"]').click();
        cy.location().should((loc) => {
          expect(loc.pathname).to.equal('/download');
        });
      });
    });

    describe('in ISIS browse table', () => {
      beforeEach(() => {
        cy.visit('/browse/instrument/1/facilityCycle/19/investigation').wait([
          '@getInvestigations',
          '@getInvestigations',
          '@getInvestigationCount',
        ]);
      });

      it('individually', () => {
        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 1"]').click();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select row 1"]').should('be.checked');
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

      it('and navigate to selection using banner', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="selection-alert-link"]').click();
        cy.location().should((loc) => {
          expect(loc.pathname).to.equal('/download');
        });
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

      it.skip('individually', () => {
        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get('[aria-label="select all rows"]').should('be.checked');
      });

      it.skip('and unselect them individually', () => {
        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="select row 0"]').click();
        cy.get('[aria-label="select row 0"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
        cy.get('[aria-label="select all rows"]').should('not.be.checked');
      });

      it.skip('by all items', () => {
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

      it.skip('and unselect all items', () => {
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

      it.skip('and navigate to selection using banner', () => {
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="selection-alert-link"]').click();
        cy.location().should((loc) => {
          expect(loc.pathname).to.equal('/download');
        });
      });
    });
  });
});
