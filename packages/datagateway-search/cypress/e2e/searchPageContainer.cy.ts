describe('SearchPageContainer Component', () => {
  // let facilityName: string;

  // before(() => {
  //   cy.readFile('server/e2e-settings.json').then((settings) => {
  //     if (settings.facilityName) facilityName = settings.facilityName;
  //   });
  // });

  it('Should default back to 10 when any result is manually entered into the url', () => {
    cy.login();
    cy.intercept('**/investigations/count?where=%7B%22id*').as(
      'investigationsCount'
    );
    cy.intercept('**/investigations?*').as('investigations');
    cy.visit('/search/data?view=card&results=100');

    cy.get('[aria-label="Submit search"]').click();
    cy.wait(['@investigations', '@investigations', '@investigationsCount'], {
      timeout: 10000,
    });

    cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
      'have.length',
      10
    );
  });

  it('should be able to load results from a URL', () => {
    cy.login();
    cy.intercept('**/investigations/count?where=%7B%22id*').as(
      'investigationsCount'
    );
    cy.intercept('**/investigations?*').as('investigations');

    cy.visit('/search/data/?view=card&searchText=test&startDate=2000-06-01');
    cy.wait(['@investigations', '@investigations', '@investigationsCount'], {
      timeout: 10000,
    });

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
      cy.visit('/search/data/');
      cy.intercept('**/investigations/count?where=%7B%22id*').as(
        'investigationsCount'
      );
      cy.intercept('**/investigations?*').as('investigations');

      cy.get('#filled-search').type('dog');

      cy.get('[aria-label="Submit search"]').click();
      cy.wait(['@investigations', '@investigations', '@investigationsCount'], {
        timeout: 10000,
      });
    });

    it('should load correctly', () => {
      cy.title().should('equal', 'DataGateway Search');

      cy.get('#container-search-filters').should('exist');
      cy.get('#container-search-table').should('exist');

      cy.location().should((loc) => {
        expect(loc.search).to.eq('?searchText=dog');
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
      cy.url().then((url) => {
        cy.get('#container-search-filters').should('exist');
        cy.get('[aria-label="Filter by Title"]').type('ba');
        cy.wait(
          ['@investigations', '@investigations', '@investigationsCount'],
          {
            timeout: 10000,
          }
        );

        cy.get('[aria-rowcount="4"]').should('exist');

        cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
          'Prove begin boy those always dream write inside. Cold drop season bill treat her wife. Nearly represent fire debate fish. Skin understand risk.'
        );

        cy.get('[data-testid="clear-filters-button"]').click();
        cy.url().should('eq', url);
      });
    });

    it('should be able to switch between tabs (and filters should not be lost)', () => {
      cy.get('[aria-label="Search table"]')
        .contains('Investigation')
        .contains('5');

      cy.get('[aria-label="Filter by Title"]').type('ba');
      cy.contains('Visit ID').first().click();

      cy.get('[aria-rowcount="4"]').should('exist');

      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains('18');

      cy.get('[aria-label="Search table"]')
        .contains('Dataset')
        .contains('3')
        .click();

      cy.get('[aria-label="Search table"]')
        .contains('Datafile')
        .contains('44')
        .click();

      cy.get('[aria-label="Search table"]')
        .contains('Investigation')
        .contains('4')
        .click();

      cy.get('[aria-rowcount="4"]').should('exist');

      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains('18');
    });

    it('should be able to switch to card view', () => {
      cy.get('[aria-label="page view Display as cards"]').click();
      //Should now be in card view
      cy.get('[aria-label="page view Display as table"]').should('exist');
      cy.get('[aria-label="page view Display as table"]').contains(
        'Display as table'
      );

      cy.location().should((loc) => {
        expect(loc.search).to.eq('?view=card&searchText=dog');
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
        expect(loc.search).to.eq('?view=table&searchText=dog');
      });
    });

    it('should be able to scroll down and load more rows', () => {
      cy.get('[aria-label="Search text input"').clear();
      cy.get('[aria-label="Submit search"]').click();
      cy.wait(['@investigations', '@investigations', '@investigationsCount'], {
        timeout: 10000,
      });
      cy.get('[aria-label="Search table"]')
        .contains('Datafile')
        .contains('300')
        .click();
      cy.get('[aria-rowcount="50"]').should('exist');
      cy.get('[aria-label="grid"]').scrollTo('bottom');
      cy.get('[aria-rowcount="75"]').should('exist');
    });

    it('should be able to choose number of results to display', () => {
      cy.get('[aria-label="Search text input"]').clear();

      cy.get('[aria-label="Submit search"]').click();
      cy.get('[aria-label="page view Display as cards"]').click();

      cy.get('select[id="select-max-results"]')
        .as('maxResultsSelect')
        .find('option:selected', { timeout: 10000 })
        .should('have.text', '10');
      cy.get('[aria-label="card-buttons"]')
        .as('cardButtons')
        .should('have.length', 10);

      cy.get('@maxResultsSelect').select('20');

      cy.get('@maxResultsSelect')
        .find('option:selected', { timeout: 10000 })
        .should('have.text', '20');
      cy.get('@cardButtons').should('have.length', 20);

      cy.get('@maxResultsSelect').select('30');

      cy.get('@maxResultsSelect')
        .find('option:selected', { timeout: 10000 })
        .should('have.text', '30');

      cy.get('@cardButtons').should('have.length', 30);
    });

    it.only('should be able to change page in card view', () => {
      cy.get('[aria-label="Search text input"]').clear();

      cy.get('[aria-label="Submit search"]').click();

      cy.get('[aria-rowcount=50]');
      cy.screenshot();
      cy.get('[aria-label="page view Display as cards"]').click();

      cy.get('[data-testid="card"]');
      cy.screenshot();

      cy.get('[aria-label="Go to page 2"]', { timeout: 10000 }).first().click();
      cy.get('[data-testid="card"]');
      cy.screenshot();
      cy.get('[data-testid="card"]')
        .first()
        .contains('Quite world game over million');

      cy.get('[aria-label="Go to next page"]', { timeout: 10000 })
        .first()
        .click();
      cy.get('[data-testid="card"]').first().contains('Across prepare why go');

      cy.get('[aria-label="Go to last page"]', { timeout: 10000 })
        .first()
        .click();
      cy.get('[data-testid="card"]').first().contains('Father effort me');

      cy.get('[aria-label="Go to previous page"]', { timeout: 10000 })
        .first()
        .click();
      cy.get('[data-testid="card"]')
        .first()
        .contains('Already medical seek take');

      cy.get('[aria-label="Go to first page"]', { timeout: 10000 })
        .first()
        .click();
      cy.get('[data-testid="card"]')
        .first()
        .contains('Analysis reflect work or hour');
    });

    it('should display selection alert banner correctly', () => {
      cy.get(`[aria-rowindex="1"] [aria-colindex="1"]`).click();
      cy.wait('@investigations', { timeout: 10000 });

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
      cy.wait(['@investigations', '@investigations', '@investigationsCount'], {
        timeout: 10000,
      });

      cy.location().should((loc) => {
        expect(loc.search).to.eq(
          '?searchText=dog&datafile=false&investigation=false&currentTab=dataset'
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

    it('should be able to select a start date', () => {
      cy.get('[aria-label="Start date input"]').type('2009-01-01');

      cy.get('[aria-label="Submit search"]').click();
      cy.wait(['@investigations', '@investigations', '@investigationsCount'], {
        timeout: 10000,
      });

      cy.location().should((loc) => {
        expect(loc.search).to.contains('?searchText=dog&startDate=2009-01-01');
      });

      cy.get('[aria-label="Search table"]')
        .contains('Investigation')
        .contains('2')
        .should('exist');
    });
  });
});
