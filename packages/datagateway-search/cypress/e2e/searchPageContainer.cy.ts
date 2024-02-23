describe('SearchPageContainer Component', () => {
  it('Should default back to 10 when any result is manually entered into the url', () => {
    cy.login();

    cy.visit('/search/data?view=card&results=100&restrict=false');

    cy.get('[aria-label="Submit search"]').click();

    cy.get('[data-testid="card"]:visible', { timeout: 10000 }).should(
      'have.length',
      10
    );
  });

  it('should be able to load results from a URL', () => {
    cy.login();

    cy.visit(
      '/search/data/?view=card&searchText=test&startDate=2000-06-01&restrict=false'
    );

    //Should be in card view
    cy.get('[aria-label="page view Display as table"]').should('exist');
    cy.get('[aria-label="page view Display as table"]').contains(
      'Display as table'
    );

    cy.get('[aria-label="Search table"]')
      .contains('Investigation')
      .contains('1')
      .should('exist');
    cy.get('[aria-label="Search table"]')
      .contains('Dataset')
      .contains('5')
      .should('exist');
    cy.get('[aria-label="Search table"]')
      .contains('Datafile')
      .contains('36')
      .should('exist');
  });

  describe('SearchPageContainer Components', () => {
    beforeEach(() => {
      cy.login();
      cy.clearDownloadCart();
      cy.visit('/search/data');

      cy.get('#filled-search').type('dog');

      cy.findByRole('checkbox', { name: 'My data' }).click();

      cy.get('[aria-label="Submit search"]').click();
    });

    it('should load correctly', () => {
      cy.title().should('equal', 'DataGateway Search');

      cy.get('#container-search-filters').should('exist');
      cy.get('#container-search-table').should('exist');

      cy.location().should((loc) => {
        expect(loc.search).to.eq('?searchText=dog&restrict=false');
      });

      // check table DOI link is correct

      cy.get('[data-testid="investigation-search-table-doi-link"]')
        .first()
        .then(($doi) => {
          const doi = $doi.text();

          const url = `https://doi.org/${doi}`;

          cy.get('[data-testid="investigation-search-table-doi-link"]')
            .first()
            .should('have.attr', 'href', url);
        });
    });

    it('should be able to click clear filters button to clear filters', () => {
      cy.url().then((unfilteredUrl) => {
        cy.visit(
          '/search/data?searchText=dog&restrict=false&filters={"Investigation.type.name":["INVESTIGATIONTYPE+2"],"InvestigationInstrument.instrument.name":["INSTRUMENT+14"]}'
        );

        cy.get('[aria-rowcount="1"]').should('exist');

        cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
          'Prove begin boy those always dream write inside. Cold drop season bill treat her wife. Nearly represent fire debate fish. Skin understand risk.'
        );

        cy.get('[data-testid="clear-filters-button"]').click();
        cy.url().should('eq', unfilteredUrl);
      });
    });

    it('should be able to switch between tabs (and filters & pagination state should not be lost)', () => {
      // visit url with pre-applied filters & pagination params
      cy.visit(
        '/search/data?view=card&page=2&results=20&searchText=&restrict=false&filters=%7B"Investigation.type.name"%3A%5B"INVESTIGATIONTYPE+3"%5D%7D'
      );

      cy.findByRole('tab', { name: 'Investigation' }).contains('23');

      cy.findByTestId('tabpanel-investigation').within(() => {
        cy.findByLabelText('Selected filters')
          .should('exist')
          .within(() => {
            cy.findByText('Type: INVESTIGATIONTYPE 3').should('exist');
          });
      });

      cy.get('[data-testid="card"]:visible')
        .as('cards')
        .should('have.length', 3);

      cy.findAllByRole('button', { name: /page 2/i, current: true });

      cy.findByRole('tab', { name: 'Dataset' }).click();

      cy.findByRole('tab', { name: 'Investigation' }).click();

      cy.findByRole('tab', { name: 'Investigation' }).contains('23');

      cy.findByTestId('tabpanel-investigation').within(() => {
        cy.findByLabelText('Selected filters')
          .should('exist')
          .within(() => {
            cy.findByText('Type: INVESTIGATIONTYPE 3').should('exist');
          });
      });

      cy.get('[data-testid="card"]:visible')
        .as('cards')
        .should('have.length', 3);

      cy.findAllByRole('button', { name: /page 2/i, current: true });
    });

    it('should be able to switch to card view', () => {
      cy.get('[aria-label="page view Display as cards"]').click();
      //Should now be in card view
      cy.get('[aria-label="page view Display as table"]').should('exist');
      cy.get('[aria-label="page view Display as table"]').contains(
        'Display as table'
      );

      cy.location().should((loc) => {
        expect(loc.search).to.eq('?view=card&searchText=dog&restrict=false');
      });

      // check card view DOI link is correct
      cy.get('[data-testid="investigation-search-card-doi-link"]')
        .first()
        .then(($doi) => {
          const doi = $doi.text();

          const url = `https://doi.org/${doi}`;

          cy.get('[data-testid="investigation-search-card-doi-link"]')
            .first()
            .should('have.attr', 'href', url);
        });

      cy.get('[aria-label="page view Display as table"]').click();

      //Should now be in table view
      cy.get('[aria-label="page view Display as cards"]').should('exist');
      cy.get('[aria-label="page view Display as cards"]').contains(
        'Display as cards'
      );

      cy.location().should((loc) => {
        expect(loc.search).to.eq('?view=table&searchText=dog&restrict=false');
      });
    });

    it('should be able to scroll down and load more rows', () => {
      cy.get('[aria-label="Search text input"').clear();
      cy.get('[aria-label="Submit search"]').click();

      cy.findByRole('tab', { name: 'Datafile' }).within(() => {
        cy.findByText('300+').should('exist');
        cy.findByText('300+').click();
      });
      cy.get('[data-testid="tabpanel-datafile"] [aria-label="grid"]').should(
        'be.visible'
      );

      cy.get('[aria-rowcount="300"]').should('exist');
      cy.get('[data-testid="tabpanel-datafile"] [aria-label="grid"]').scrollTo(
        'bottom'
      );
      cy.get('[aria-rowindex="300"] > [aria-colindex="3"]')
        .contains('Datafile 300')
        .should('exist');
      cy.findByRole('tab', { name: 'Datafile' }).within(() => {
        cy.findByText('600+').should('exist');
      });
      cy.get('[aria-rowcount="600"]').should('exist');
      cy.get('[aria-rowindex="301"] > [aria-colindex="3"]')
        .contains('Datafile 301')
        .should('exist');
    });

    it('should be able to choose number of results to display', () => {
      cy.get('[aria-label="Search text input"]').clear();

      cy.get('[aria-label="Submit search"]').click();
      cy.get('[aria-label="page view Display as cards"]').click();

      cy.findByRole('combobox', {
        name: /Max Results/i,
      })
        .as('maxResultsSelect')
        .find('option:selected', { timeout: 10000 })
        .should('have.text', '10');
      cy.get('[data-testid="card"]:visible')
        .as('cards')
        .should('have.length', 10);

      cy.get('@maxResultsSelect').select('20');

      cy.get('@maxResultsSelect')
        .find('option:selected', { timeout: 10000 })
        .should('have.text', '20');
      cy.get('@cards').should('have.length', 20);

      cy.get('@maxResultsSelect').select('30');

      cy.get('@maxResultsSelect')
        .find('option:selected', { timeout: 10000 })
        .should('have.text', '30');

      cy.get('@cards').should('have.length', 30);
    });

    it('should be able to change page in card view', () => {
      cy.viewport('macbook-11');

      cy.get('[aria-label="Search text input"]').clear();

      cy.get('[aria-label="Submit search"]').click();

      cy.findByRole('tab', { name: 'Dataset' }).click();

      cy.get('[aria-label="page view Display as cards"]').click();

      // we're testing cards in the middle of pages, as CI and SG-preprod can differ
      // by around 1 result, so using first/last item per page is going to be
      // wrong on one env or the other

      cy.get('[aria-label="Go to page 2"]', { timeout: 10000 }).first().click();
      cy.contains('[data-testid="card"]', 'DATASET 15');

      cy.get('[aria-label="Go to next page"]', { timeout: 10000 })
        .first()
        .click();
      cy.contains('[data-testid="card"]', 'DATASET 25');

      cy.get('[aria-label="Go to last page"]', { timeout: 10000 })
        .first()
        .click();
      cy.contains('[data-testid="card"]', 'DATASET 115');

      cy.get('[aria-label="Go to previous page"]', { timeout: 10000 })
        .first()
        .click();
      cy.contains('[data-testid="card"]', 'DATASET 105');

      cy.get('[aria-label="Go to first page"]', { timeout: 10000 })
        .first()
        .click();
      cy.contains('[data-testid="card"]', 'DATASET 5');
    });

    it('should display selection alert banner correctly', () => {
      cy.get(
        `[data-testid="tabpanel-investigation"] [aria-rowindex="1"] [aria-colindex="1"]`
      ).click();

      cy.get('[aria-label="selection-alert"]').should('exist');
      cy.get('[aria-label="selection-alert-text"]')
        .invoke('text')
        .then((text) => {
          expect(text.trim()).equal('1 item has been added to selection.');
        });

      //Check can go to selection
      cy.get('[aria-label="selection-alert-link"]').click();
      cy.location().should((loc) => {
        expect(loc.pathname).to.equal('/download');
      });
      cy.go('back');

      //Check can close banner
      cy.get('[aria-label="selection-alert-close"]').click();
      cy.get('[aria-label="selection-alert"]').should('not.exist');
    });

    it('should be able to deselect checkboxes', () => {
      cy.get('#search-entities-menu').click();
      cy.get('[aria-label="Investigation checkbox"]').click();
      cy.get('[aria-label="Datafile checkbox"]').click();
      //Close drop down menu
      cy.get('body').type('{esc}');

      cy.get('[aria-label="Submit search"]').click();

      cy.location().should((loc) => {
        expect(loc.search).to.eq(
          '?searchText=dog&datafile=false&investigation=false&currentTab=dataset&restrict=false'
        );
      });

      cy.get('[aria-label="Search table"]')
        .contains('Investigation')
        .should('not.exist');
      cy.get('[aria-label="Search table"]')
        .contains('Datafile')
        .should('not.exist');
      cy.get('[aria-label="Search table"]')
        .contains('Dataset')
        .contains('3')
        .should('exist');
    });

    it('should display number of items in cart correctly and go to the download page when clicked (Table)', () => {
      // Check that the download cart has displayed correctly.
      cy.get('[aria-label="Go to selections"]', { timeout: 10000 }).contains(
        // matches empty string i.e. no badge
        /^$/
      );

      cy.get('[aria-label="select row 0"]', { timeout: 10000 }).eq(0).click();

      cy.get('[aria-label="Go to selections"]', { timeout: 10000 }).contains(
        /^1/
      );

      cy.get('[aria-label="select row 1"]', { timeout: 10000 }).eq(0).click();

      cy.get('[aria-label="Go to selections"]', { timeout: 10000 }).contains(
        /^2/
      );

      cy.get('[aria-label="Go to selections"]').click();
      cy.url().should('include', '/download');
    });

    it('should display number of items in cart correctly and go to the download page when clicked (Card)', () => {
      cy.get('[aria-label="page view Display as cards"]').click();
      // Check that the download cart has displayed correctly.
      cy.get('[aria-label="Go to selections"]', { timeout: 10000 }).contains(
        // matches empty string i.e. no badge
        /^$/
      );

      cy.get('[aria-label="card-button-1"]', { timeout: 10000 }).eq(0).click();

      cy.get('[aria-label="Go to selections"]', { timeout: 10000 }).contains(
        /^1/
      );

      cy.get('[aria-label="card-button-1"]', { timeout: 10000 }).eq(1).click();

      cy.get('[aria-label="Go to selections"]', { timeout: 10000 }).contains(
        /^2/
      );

      cy.get('[aria-label="Go to selections"]').click();
      cy.url().should('include', '/download');
    });

    it('should be able to select a start & end date', () => {
      cy.get('[aria-label="Start date input"]').type('2009-01-01');

      cy.get('[aria-label="Submit search"]').click();

      cy.location().should((loc) => {
        expect(loc.search).to.contains(
          '?searchText=dog&startDate=2009-01-01&restrict=false'
        );
      });

      cy.get('[aria-label="Search table"]')
        .contains('Investigation')
        .contains('2')
        .should('exist');

      cy.get('[aria-label="End date input"]').type('2013-01-01');

      cy.get('[aria-label="Submit search"]').click();

      cy.location().should((loc) => {
        expect(loc.search).to.contains(
          '?searchText=dog&startDate=2009-01-01&endDate=2013-01-01&restrict=false'
        );
      });

      cy.get('[aria-label="Search table"]')
        .contains('Investigation')
        .contains('1')
        .should('exist');
    });

    it('should be able to sort by different criteria', () => {
      cy.get(
        `[data-testid="tabpanel-investigation"] [aria-rowindex="1"] [aria-colindex="3"]`
      ).contains('Majority about dog');

      cy.findByLabelText('Sort by').click();

      cy.findByRole('option', { name: 'Name' }).click();

      cy.location().should((loc) => {
        expect(loc.search).to.contains(
          '?searchText=dog&restrict=false&sort=%7B%22name%22%3A%22asc%22%7D'
        );
      });

      cy.get(
        `[data-testid="tabpanel-investigation"] [aria-rowindex="1"] [aria-colindex="3"]`
      ).contains('Prove begin boy');
    });
  });
});
