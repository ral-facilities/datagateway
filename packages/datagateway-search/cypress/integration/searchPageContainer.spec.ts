describe('SearchPageContainer Component', () => {
  let facilityName: string;

  before(() => {
    cy.readFile('server/e2e-settings.json').then((settings) => {
      if (settings.facilityName) facilityName = settings.facilityName;
    });
  });

  it('Should default back to 10 when any result is manually entered into the url', () => {
    cy.login();
    cy.visit('/search/data?view=card&results=100');
    cy.intercept('/investigations/count?where=%7B%22id').as(
      'investigationsCount'
    );
    cy.intercept('/investigations?').as('investigations');
    cy.intercept('/datasets/count?where=%7B%22id').as('datasetsCount');
    cy.intercept('/datasets?').as('datasets');
    cy.intercept('/datafiles/count?where=%7B%22id').as('datafilesCount');
    cy.intercept('/datafiles?').as('datafiles');
    cy.intercept(`/topcat/user/cart/${facilityName}/cartItems`).as('topcat');

    cy.clearDownloadCart();
    cy.get('[aria-label="Submit search"]')
      .click()
      .wait(['@investigations', '@investigations', '@investigationsCount'], {
        timeout: 10000,
      });

    cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
      'have.length',
      10
    );
  });

  describe('SearchPageContianer Components', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/search/data/');
      cy.intercept('/investigations/count?where=%7B%22id').as(
        'investigationsCount'
      );
      cy.intercept('/investigations?').as('investigations');

      cy.clearDownloadCart();
      cy.get('[aria-label="Search text input"]')
        .find('#filled-search')
        .type('dog');

      cy.get('[aria-label="Submit search"]')
        .click()
        .wait(['@investigations', '@investigations', '@investigationsCount'], {
          timeout: 10000,
        });
    });

    it('should load correctly', () => {
      cy.title().should('equal', 'DataGateway Search');

      cy.get('#container-search-filters').should('exist');
      cy.location().should((loc) => {
        expect(loc.search).to.eq('?searchText=dog');
      });
    });

    it('should display results correctly', () => {
      cy.get('#container-search-table').should('exist');
    });

    it('should have the correct url for the DOI link (Tableview) ', () => {
      // DOI

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

    it('should be able to navigate through tabs without losing the filters (Table)', () => {
      cy.title().should('equal', 'DataGateway Search');

      cy.get('#container-search-filters').should('exist');
      cy.get('[aria-label="Filter by Title"]').type('ba');
      cy.contains('Visit ID').first().click();

      cy.get('[id="simple-tab-dataset"]').click();
      cy.get('[id="simple-tab-investigation"]').click();

      cy.get('[aria-rowcount="3"]').should('exist');

      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Energy place money bad authority. Poor community technology against happy. Detail customer management together dog. Put name war sometimes rise sport your. Imagine across mother herself then.'
      );
    });

    it('should be able to navigate through tabs without losing the filters (Card)', () => {
      cy.title().should('equal', 'DataGateway Search');

      cy.get('[aria-label="Search text input"]').find('#filled-search').clear();

      cy.get('[aria-label="Submit search"]')
        .click()
        .wait(['@investigations', '@investigations', '@investigationsCount'], {
          timeout: 10000,
        });

      cy.get('#container-search-filters').should('exist');

      cy.get('[aria-label="container-view-button"]').click();
      cy.get('[data-testid="advanced-filters-link"]').click();
      cy.get('[aria-label="Filter by Title"]').type('spe');

      cy.get('[data-testid="advanced-filters-link"]').click();
      cy.get('[aria-label="sort-by-list"]')
        .get('[aria-label="Sort by VISIT ID"]')
        .click({ force: true });
      cy.get('select[id="select-max-results"]', {
        timeout: 10000,
      }).select('20');
      cy.get('[aria-label="Go to next page"]').first().click({ force: true });

      cy.get('[id="simple-tab-dataset"]').click();
      cy.get('[id="simple-tab-investigation"]').click();

      cy.get('[data-testid="card"]')
        .first()
        .contains(
          'Night with subject fall in daughter together. Term would just back. Despite air skill people. Race especially ask look suggest east might. Situation note appear.'
        );
    });

    it('should have the correct url for the DOI link (Cardview) ', () => {
      // DOI

      cy.get('[aria-label="container-view-button"]').click();

      cy.get('[data-testid="investigation-search-card-doi-link"]')
        .first()
        .then(($doi) => {
          const doi = $doi.text();

          const url = `https://doi.org/${doi}`;

          cy.get('[data-testid="investigation-search-card-doi-link"]')
            .first()
            .should('have.attr', 'href', url);
        });
    });

    it('should be able to switch between tabs', () => {
      cy.get('[aria-label="Search table"]')
        .contains('Dataset')
        .contains('14')
        .click();

      cy.get('[aria-label="Search table"]')
        .contains('Datafile')
        .contains('300')
        .click();

      cy.get('[aria-label="Search table"]')
        .contains('Investigation')
        .contains('15')
        .click();
    });

    it('should be able to switch to card view', () => {
      cy.get('[aria-label="container-view-button"]').click();
      //Should now be in card view
      cy.get('[aria-label="container-view-button"]').should('exist');
      cy.get('[aria-label="container-view-button"]').contains(
        'Display as table'
      );

      cy.location().should((loc) => {
        expect(loc.search).to.eq('?view=card&searchText=dog');
      });

      cy.get('[aria-label="container-view-button"]').click();

      //Should now be in table view
      cy.get('[aria-label="container-view-button"]').should('exist');
      cy.get('[aria-label="container-view-button"]').contains(
        'Display as cards'
      );

      cy.location().should((loc) => {
        expect(loc.search).to.eq('?view=table&searchText=dog');
      });
    });

    it('should be able to scroll down and load more rows', () => {
      cy.get('[aria-label="Search table"]')
        .contains('Datafile')
        .contains('300')
        .click();
      cy.get('[aria-rowcount="50"]').should('exist');
      cy.get('[aria-label="grid"]').scrollTo('bottom');
      cy.get('[aria-rowcount="75"]').should('exist');
    });

    it('should be able to choose number of results to display', () => {
      cy.login();
      cy.visit('/search/data/');
      cy.intercept('/investigations/count?where=%7B%22id').as(
        'investigationsCount'
      );
      cy.intercept('/investigations?').as('investigations');

      cy.clearDownloadCart();
      cy.get('[aria-label="Submit search"]')
        .click()
        .wait(['@investigations', '@investigations', '@investigationsCount'], {
          timeout: 10000,
        });
      cy.get('[aria-label="container-view-button"]').click();
      cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
        'have.length',
        10
      );

      cy.get('select[id="select-max-results"]', {
        timeout: 10000,
      }).select('20');
      cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
        'have.length',
        20
      );

      cy.get('select[id="select-max-results"]', {
        timeout: 10000,
      }).select('30');
      cy.get('[aria-label="card-buttons"]', { timeout: 10000 }).should(
        'have.length',
        30
      );
    });

    //This test appears to get a different number of results locally compared to the automated tests
    //on github meaning the test fails
    it.skip('should be able to change page in card view', () => {
      cy.get('[aria-label="Search text input"]').find('#filled-search').clear();

      cy.get('[aria-label="Submit search"]')
        .click()
        .wait(['@investigations', '@investigations', '@investigationsCount'], {
          timeout: 10000,
        });

      cy.get('[aria-label="container-view-button"]').click();

      cy.get('[aria-label="Go to page 2"]', { timeout: 10000 }).first().click();
      cy.get('[data-testid="card"]')
        .first()
        .contains('Guy maintain us process official people suffer.');

      cy.get('[aria-label="Go to next page"]', { timeout: 10000 })
        .first()
        .click();
      cy.get('[data-testid="card"]')
        .first()
        .contains('Yourself smile either I pass significant.');

      cy.get('[aria-label="Go to last page"]', { timeout: 10000 })
        .first()
        .click();
      cy.get('[data-testid="card"]')
        .first()
        .contains('Window former upon writer help step account.');

      cy.get('[aria-label="Go to previous page"]', { timeout: 10000 })
        .first()
        .click();
      cy.get('[data-testid="card"]')
        .first()
        .contains('Someone statement Republican plan watch.');

      cy.get('[aria-label="Go to first page"]', { timeout: 10000 })
        .first()
        .click();
      cy.get('[data-testid="card"]')
        .first()
        .contains('Including spend increase ability music skill former.');
    });

    it('should display selection alert banner correctly', () => {
      cy.get(`[aria-rowindex="1"] [aria-colindex="1"]`)
        .click()
        .wait('@investigations', { timeout: 10000 });

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
      cy.get('[aria-label="Investigation checkbox"]').click();
      cy.get('[aria-label="Datafile checkbox"]').click();

      cy.get('[aria-label="Submit search"]')
        .click()
        .wait(['@investigations', '@investigations', '@investigationsCount'], {
          timeout: 10000,
        });

      cy.location().should((loc) => {
        expect(loc.search).to.eq(
          '?searchText=dog&datafile=false&investigation=false'
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
        .contains('14')
        .should('exist');
    });

    it('should be able to select a start date', () => {
      cy.get('[aria-label="Start date input"]').type('2009-01-01');

      cy.get('[aria-label="Submit search"]')
        .click()
        .wait(['@investigations', '@investigations', '@investigationsCount'], {
          timeout: 10000,
        });

      cy.location().should((loc) => {
        expect(loc.search).to.contains('?searchText=dog&startDate=2009-01-01');
      });

      cy.get('[aria-label="Search table"]')
        .contains('Investigation')
        .contains('8')
        .should('exist');
    });

    it('should be able to load results from a URL', () => {
      cy.visit(
        '/search/data/?view=card&searchText=test&startDate=2009-01-01'
      ).wait(['@investigations', '@investigations', '@investigationsCount'], {
        timeout: 10000,
      });

      //Should be in card view
      cy.get('[aria-label="container-view-button"]').should('exist');
      cy.get('[aria-label="container-view-button"]').contains(
        'Display as table'
      );

      cy.get('[aria-label="Search table"]')
        .contains('Investigation')
        .contains('4')
        .should('exist');
      cy.get('[aria-label="Search table"]')
        .contains('Dataset')
        .contains('7')
        .should('exist');
      cy.get('[aria-label="Search table"]')
        .contains('Datafile')
        .contains('300')
        .should('exist');
    });
  });
});
