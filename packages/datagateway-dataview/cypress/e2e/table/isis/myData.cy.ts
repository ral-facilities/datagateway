describe('ISIS - MyData Table', () => {
  it('Should redirect when logged in anonymously', () => {
    cy.login();
    cy.visit('/my-data/ISIS');
    cy.url().should('include', '/login');
  });
  describe('Logged in tests', () => {
    beforeEach(() => {
      cy.intercept('**/investigations/count?*').as('getInvestigationCount');
      cy.intercept('**/investigations?order*', (req) => {
        req.continue((res) => {
          // add type study to related data publication to emulate ISIS like data
          if (
            res.body?.[0]?.dataCollectionInvestigations?.[0]?.dataCollection
              ?.dataPublications?.[0]
          )
            res.body[0].dataCollectionInvestigations[0].dataCollection.dataPublications[0].type =
              { id: 1, name: 'study' };
        });
      });
      cy.login(
        {
          username: 'root',
          password: 'pw',
          mechanism: 'simple',
        },
        'Richard459'
      );
      // TODO - Does wait() need to be removed?
      cy.visit('/my-data/ISIS').wait(['@getInvestigationCount'], {
        timeout: 10000,
      });
      // Check that we have received the size from the API as this will produce
      // a re-render which can prevent some interactions.
      cy.contains('[aria-rowindex="1"] [aria-colindex="8"]', '3.31 GB').should(
        'exist'
      );
    });

    it('should load correctly', () => {
      cy.title().should('equal', 'DataGateway DataView');
      cy.get('#datagateway-dataview').should('be.visible');

      //Default sort
      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('exist');
    });

    it('should be able to click an investigation to see its landing page', () => {
      cy.get('[role="gridcell"] a').first().click({ force: true });
      cy.location('pathname').should(
        'eq',
        '/browse/instrument/13/facilityCycle/12/investigation/31'
      );
    });

    it('should have the correct url for the DOI link', () => {
      cy.get('[data-testid="isis-mydata-table-doi-link"]')
        .first()
        .then(($doi) => {
          const doi = $doi.text();

          const url = `https://doi.org/${doi}`;

          cy.get('[data-testid="isis-mydata-table-doi-link"]')
            .first()
            .should('have.attr', 'href', url);
        });
    });

    // Not enough investigations to test scrolling.
    it.skip('should be able to scroll down and load more rows', () => {
      cy.get('[aria-rowcount="50"]').should('exist');
      cy.get('[aria-label="grid"]').scrollTo('bottom');
      cy.get('[aria-rowcount="75"]').should('exist');
    });

    // only 1 investigation, so sort test kind of pointless
    it.skip('should be able to sort by all sort directions on single and multiple columns', () => {
      // Revert the default sort
      cy.contains('[role="button"]', 'Start Date').click();

      // ascending order
      cy.contains('[role="button"]', 'Title')
        .as('titleSortButton')
        .first()
        .click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Stop system investment'
      );

      // descending order
      cy.get('@titleSortButton').click();
      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Stop system investment'
      );

      // no order
      cy.get('@titleSortButton').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Stop system investment'
      );

      // multiple columns
      cy.get('@titleSortButton').click();
      cy.contains('[role="button"]', 'Instrument').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Stop system investment'
      );
    });

    it('should be able to filter with role, text & date filters on multiple columns', () => {
      // role selector
      cy.get('[aria-rowcount="1"]').should('exist');

      cy.get('#role-selector').click();
      cy.get('[role="listbox"]')
        .find('[role="option"]')
        .should('have.length', 2);
      cy.get('[role="option"][data-value="CI"]').click();

      cy.get('[role="progressbar"]').should('be.visible');
      cy.get('[role="progressbar"]').should('not.exist');

      cy.get('[aria-rowcount="1"]').should('exist');

      // check that size is correct after filtering
      cy.get('[aria-rowindex="1"] [aria-colindex="8"]').contains('3.31 GB');

      cy.get('#role-selector').click();
      cy.get('[role="option"]').first().click();

      cy.get('[aria-rowcount="1"]').should('exist');

      // text filter
      cy.get('[aria-label="Filter by Title"]').type('stop');

      cy.get('[role="progressbar"]').should('be.visible');
      cy.get('[role="progressbar"]').should('not.exist');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="6"]').contains(
        'INVESTIGATION 31'
      );

      cy.get('input[aria-label="Start Date filter to"]')
        .parent()
        .find('button')
        .click();

      cy.get('.MuiPickersDay-root[type="button"]').first().click();

      cy.get('[role="progressbar"]').should('be.visible');
      cy.get('[role="progressbar"]').should('not.exist');

      cy.get('[aria-rowcount="1"]').should('exist');

      cy.get('input[aria-label="Start Date filter from"]').type('2008-01-01');

      cy.get('[aria-rowcount="0"]').should('exist');
    });

    describe('should be able to view details', () => {
      it('and all the details are correct & also able to hide the panel', () => {
        cy.get('[aria-label="Show details"]').first().click();

        // DataPublication PID

        cy.get('[data-testid="investigation-details-panel-pid-link"]')
          .first()
          .then(($pid) => {
            const pid = $pid.text();

            const url = `https://doi.org/${pid}`;

            cy.get('[data-testid="investigation-details-panel-pid-link"]')
              .first()
              .should('have.attr', 'href', url);
          });

        // DOI

        cy.get('[data-testid="investigation-details-panel-doi-link"]')
          .first()
          .then(($doi) => {
            const doi = $doi.text();

            const url = `https://doi.org/${doi}`;

            cy.get('[data-testid="investigation-details-panel-doi-link"]')
              .first()
              .should('have.attr', 'href', url);
          });

        cy.get('#details-panel').should('be.visible');
        cy.get('[aria-label="Hide details"]').should('exist');

        cy.get('[aria-controls="investigation-details-panel"]').should(
          'be.visible'
        );

        cy.get('#details-panel')
          .contains('Stop system investment')
          .should('be.visible');

        cy.get('[aria-controls="investigation-samples-panel"]').should(
          'be.visible'
        );
        cy.get('[aria-controls="investigation-samples-panel"]').click();

        cy.get('#details-panel').contains('SAMPLE 31').should('be.visible');

        cy.get('[aria-controls="investigation-users-panel"]').should(
          'be.visible'
        );
        cy.get('[aria-controls="investigation-users-panel"]').click();

        cy.get('#details-panel').contains('Dustin Hall').should('be.visible');

        cy.get('[aria-controls="investigation-publications-panel"]').should(
          'be.visible'
        );
        cy.get('[aria-controls="investigation-publications-panel"]').click();

        cy.get('#details-panel')
          .contains('Pressure meeting would year but energy.')
          .should('be.visible');

        cy.get('[aria-label="Hide details"]').first().click();

        cy.get('#details-panel').should('not.exist');
        cy.get('[aria-label="Hide details"]').should('not.exist');
      });

      it('and view datasets', () => {
        cy.get('[aria-label="Show details"]').first().click();
        cy.get('#investigation-datasets-tab').click({ force: true });

        cy.location('pathname').should(
          'eq',
          '/browse/instrument/13/facilityCycle/12/investigation/31/dataset'
        );
      });
    });
  });
});
