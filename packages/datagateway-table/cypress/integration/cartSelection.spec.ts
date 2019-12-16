describe('Add/remove from cart functionality', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.clearDownloadCart();

    cy.server();
  });

  describe('should be able to select datafiles', () => {
    beforeEach(() => {
      cy.route('**/datafiles*').as('getDatafiles');
      cy.route('**/datafiles/count*').as('getDatafileCount');
      cy.route('**/datafiles*&distinct="ID"').as('getAllIds');
    });

    describe('in generic table', () => {
      beforeEach(() => {
        cy.visit('/browse/investigation/1/dataset/25/datafile');
      });

      it('individually', () => {
        cy.wait(['@getDatafiles', '@getAllIds']);
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');
      });

      it('and unselect them individually', () => {
        cy.wait(['@getDatafiles', '@getAllIds']);
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="select row 0"]').uncheck();
        cy.get('[aria-label="select row 0"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items', () => {
        cy.wait(['@getDatafiles', '@getAllIds']);
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
        cy.wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get(`[aria-label="select row 55"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 })
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items in a filtered table', () => {
        cy.wait('@getDatafiles');
        cy.get('[aria-label="Filter by Location"]')
          .find('input')
          .type('e');

        cy.wait(['@getDatafiles', '@getAllIds']);

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
          .clear();

        cy.wait(['@getDatafiles', '@getAllIds']);
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');

        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select row 1"]').should('be.checked');
        cy.get('[aria-label="select row 17"]').should('not.be.checked');
        cy.get('[aria-label="select row 24"]').should('not.be.checked');

        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get('[aria-label="select row 54"]').should('be.checked');
        cy.get('[aria-label="select row 55"]').should('be.checked');
      });

      it('and unselect all items', () => {
        cy.wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );

        cy.reload();
        cy.wait(['@getDatafiles', '@getAllIds']);

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

        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get(`[aria-label="select row 55"]`).should('not.be.checked');
        cy.get('[aria-label="select all rows"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by shift clicking', () => {
        cy.wait(['@getDatafiles', '@getAllIds']);
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
        cy.wait(['@getDatafiles', '@getAllIds']);
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
        );
      });

      it('individually', () => {
        cy.wait(['@getDatafiles', '@getAllIds']);
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');
      });

      it('and unselect them individually', () => {
        cy.wait(['@getDatafiles', '@getAllIds']);
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="select row 0"]').uncheck();
        cy.get('[aria-label="select row 0"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items', () => {
        cy.wait(['@getDatafiles', '@getAllIds']);
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
        cy.wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get(`[aria-label="select row 55"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 })
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items in a filtered table', () => {
        cy.wait('@getDatafiles');
        cy.get('[aria-label="Filter by Location"]')
          .find('input')
          .type('e');

        cy.wait(['@getDatafiles', '@getAllIds']);

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
          .clear();

        cy.wait(['@getDatafiles', '@getAllIds']);
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'not.be.checked'
        );
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');

        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select row 1"]').should('be.checked');
        cy.get('[aria-label="select row 17"]').should('not.be.checked');
        cy.get('[aria-label="select row 24"]').should('not.be.checked');

        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get('[aria-label="select row 54"]').should('be.checked');
        cy.get('[aria-label="select row 55"]').should('be.checked');
      });

      it('and unselect all items', () => {
        cy.wait(['@getDatafiles', '@getAllIds']);
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );

        cy.reload();
        cy.wait(['@getDatafiles', '@getAllIds']);

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

        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get(`[aria-label="select row 55"]`).should('not.be.checked');
        cy.get('[aria-label="select all rows"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by shift clicking', () => {
        cy.wait(['@getDatafiles', '@getAllIds']);
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
        cy.wait(['@getDatafiles', '@getAllIds']);
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
        );
      });

      it('individually', () => {
        cy.wait(['@getDatafiles', '@getAllIds']);
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');
      });

      it('and unselect them individually', () => {
        cy.wait(['@getDatafiles', '@getAllIds']);
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="select row 0"]').uncheck();
        cy.get('[aria-label="select row 0"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items', () => {
        cy.wait(['@getDatafiles', '@getAllIds']);
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
        cy.wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get(`[aria-label="select row 54"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 })
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items in a filtered table', () => {
        cy.wait('@getDatafiles');
        cy.get('[aria-label="Filter by Location"]')
          .find('input')
          .type('e');

        cy.wait(['@getDatafiles', '@getAllIds']);

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
          .clear();

        cy.wait(['@getDatafiles', '@getAllIds']);
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

        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get('[aria-label="select row 53"]').should('not.be.checked');
        cy.get('[aria-label="select row 54"]').should('be.checked');
      });

      it('and unselect all items', () => {
        cy.wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );

        cy.reload();
        cy.wait(['@getDatafiles', '@getAllIds']);

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

        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.wait('@getDatafiles');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get(`[aria-label="select row 55"]`).should('not.be.checked');
        cy.get('[aria-label="select all rows"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by shift clicking', () => {
        cy.wait(['@getDatafiles', '@getAllIds']);
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
        cy.wait(['@getDatafiles', '@getAllIds']);
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
    describe('in generic table', () => {
      beforeEach(() => {
        cy.visit('/browse/investigation/1/dataset');
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
        cy.get(`[aria-label="select row 0"]`).should('be.visible');

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
        cy.get(`[aria-label="select row 0"]`).should('be.visible');

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
        cy.visit('/browse/proposal/INVESTIGATION%201/investigation/1/dataset');
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
        cy.get(`[aria-label="select row 0"]`).should('be.visible');

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
        cy.get(`[aria-label="select row 0"]`).should('be.visible');

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
        );
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
        cy.get(`[aria-label="select row 0"]`).should('be.visible');

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
        cy.get(`[aria-label="select row 0"]`).should('be.visible');

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
      cy.route('**/investigations*').as('getInvestigations');
      cy.route('**/investigations/count*').as('getInvestigationCount');
      cy.route('**/investigations*&distinct="ID"').as('getAllIds');
    });

    describe('in generic table', () => {
      beforeEach(() => {
        cy.visit('/browse/investigation');
      });

      it('individually', () => {
        cy.wait(['@getInvestigations', '@getAllIds']);
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'true');
      });

      it('and unselect them individually', () => {
        cy.wait(['@getInvestigations', '@getAllIds']);
        cy.get('[aria-label="select row 0"]').check();
        cy.get('[aria-label="select row 0"]').should('be.checked');

        cy.get('[aria-label="select row 0"]').uncheck();
        cy.get('[aria-label="select row 0"]').should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items', () => {
        cy.wait(['@getInvestigations', '@getAllIds']);
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
        cy.wait('@getInvestigations');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get(`[aria-label="select row 55"]`).should('be.checked');
        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 })
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by all items in a filtered table', () => {
        cy.wait('@getInvestigations');
        cy.get('[aria-label="Filter by Visit ID"]')
          .find('input')
          .type('6');

        cy.wait(['@getInvestigations', '@getAllIds']);

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
          .clear();

        cy.wait(['@getInvestigations', '@getAllIds']);
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

        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.wait('@getInvestigations');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get('[aria-label="select row 54"]').should('be.checked');
        cy.get('[aria-label="select row 58"]').should('be.checked');
      });

      it('and unselect all items', () => {
        cy.wait(['@getInvestigations', '@getAllIds']);
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.wait('@getInvestigations');
        cy.get('[aria-label="grid"]').scrollTo('bottom');

        cy.get('[aria-label="select all rows"]').check();
        cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
          'be.checked'
        );

        cy.reload();
        cy.wait(['@getInvestigations', '@getAllIds']);

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

        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.wait('@getInvestigations');
        cy.get('[aria-label="grid"]').scrollTo('bottom');
        cy.get(`[aria-label="select row 55"]`).should('not.be.checked');
        cy.get('[aria-label="select all rows"]')
          .should('have.attr', 'data-indeterminate')
          .and('eq', 'false');
      });

      it('by shift clicking', () => {
        cy.wait(['@getInvestigations', '@getAllIds']);
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
        cy.wait(['@getInvestigations', '@getAllIds']);
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
        cy.visit('/browse/instrument/1/facilityCycle/14/investigation');
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
        cy.get(`[aria-label="select row 0"]`).should('be.visible');

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
        cy.get(`[aria-label="select row 0"]`).should('be.visible');

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
