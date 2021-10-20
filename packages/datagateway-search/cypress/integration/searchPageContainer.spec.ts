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
    // cy.get('[aria-label="container-view-button"]').click();
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
      cy.intercept('/datasets/count?where=%7B%22id').as('datasetsCount');
      cy.intercept('/datasets?').as('datasets');
      cy.intercept('/datafiles/count?where=%7B%22id').as('datafilesCount');
      cy.intercept('/datafiles?').as('datafiles');
      cy.intercept(`/topcat/user/cart/${facilityName}/cartItems`).as('topcat');

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
    });

    it('should display results correctly', () => {
      cy.get('#container-search-table').should('exist');
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

      cy.get('[aria-label="container-view-button"]').click();
      //Should now be in table view
      cy.get('[aria-label="container-view-button"]').should('exist');
      cy.get('[aria-label="container-view-button"]').contains(
        'Display as cards'
      );
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
      cy.get('#card').contains(
        'Guy maintain us process official people suffer.'
      );

      cy.get('[aria-label="Go to next page"]', { timeout: 10000 })
        .first()
        .click();
      cy.get('#card').contains('Yourself smile either I pass significant.');

      cy.get('[aria-label="Go to last page"]', { timeout: 10000 })
        .first()
        .click();
      cy.get('#card').contains('Window former upon writer help step account.');

      cy.get('[aria-label="Go to previous page"]', { timeout: 10000 })
        .first()
        .click();
      cy.get('#card').contains('Someone statement Republican plan watch.');

      cy.get('[aria-label="Go to first page"]', { timeout: 10000 })
        .first()
        .click();
      cy.get('#card').contains(
        'Including spend increase ability music skill former.'
      );
    });
  });
});
