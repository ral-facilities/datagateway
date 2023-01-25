describe('Datafile search tab', () => {
  let facilityName: string;

  before(() => {
    cy.readFile('server/e2e-settings.json').then((settings) => {
      if (settings.facilityName) facilityName = settings.facilityName;
    });
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/search/data/');
    cy.intercept('**/investigations/count?where=%7B%22id*').as(
      'investigationsCount'
    );
    cy.intercept('**/investigations?*').as('investigations');
    cy.intercept('**/datasets/count?where=%7B%22id*').as('datasetsCount');
    cy.intercept('**/datasets?*').as('datasets');
    cy.intercept('**/datafiles/count?where=%7B%22id*').as('datafilesCount');
    cy.intercept('**/datafiles?*').as('datafiles');
    cy.intercept(`**/topcat/user/cart/${facilityName}/cartItems`).as('topcat');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Search');

    cy.get('#search-entities-menu').click();
    cy.get('[aria-label="Investigation checkbox"]').click();
    cy.get('[aria-label="Dataset checkbox"]').click();
    //Close drop down menu
    cy.get('body').type('{esc}');

    cy.get('[aria-label="Submit search"]')
      .click()
      .wait(['@datafiles', '@datafiles', '@datafilesCount'], {
        timeout: 10000,
      });

    cy.get('#container-search-filters').should('exist');

    cy.get('#container-search-table').should('exist');
  });

  it('should be able to search by text', () => {
    cy.clearDownloadCart();
    cy.get('#filled-search').type('1440');

    cy.get('[aria-label="Submit search"]')
      .click()
      .wait(['@investigations', '@investigationsCount'], {
        timeout: 10000,
      });

    cy.get('[aria-label="Search table"]')
      .contains('Datafile')
      .contains('1')
      .click()
      .wait(['@datafiles', '@datafiles', '@datafilesCount'], {
        timeout: 10000,
      });

    cy.get('[aria-rowcount="1"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Datafile 1440');

    // Check that "select all" and individual selection are equivalent
    cy.get(`[aria-rowindex="1"] [aria-colindex="1"]`)
      .click()
      .wait('@topcat', { timeout: 10000 });
    cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
      'be.checked'
    );
    cy.get('[aria-label="select all rows"]')
      .should('have.attr', 'data-indeterminate')
      .and('eq', 'false');
  });

  it('should be able to search by date range', () => {
    cy.get('[aria-label="Start date input"]').type('2012-02-02');
    const date = new Date();
    cy.get('[aria-label="End date input"]').type(
      date.toISOString().slice(0, 10)
    );

    cy.get('[aria-label="Submit search"]').click().wait('@datafilesCount', {
      timeout: 10000,
    });

    cy.get('[aria-label="Search table"]')
      .contains('Datafile')
      .contains('300')
      .click();

    cy.get('[aria-rowcount="50"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Datafile 1');
  });

  it('should be hidden if datafile checkbox is unchecked', () => {
    cy.get('#search-entities-menu').click();
    cy.get('[aria-label="Datafile checkbox"]').click();
    //Close drop down menu
    cy.get('body').type('{esc}');

    cy.get('[aria-label="Submit search"]')
      .click()
      .wait(['@investigations', '@investigations', '@investigationsCount'], {
        timeout: 10000,
      });

    cy.get('[aria-rowcount="50"]').should('exist');

    cy.get('[aria-label="Search table"]')
      .contains('Datafile')
      .should('not.exist');
  });

  it('should link to a parent dataset', () => {
    cy.get('#filled-search').type('1532');

    cy.get('[aria-label="Submit search"]')
      .click()
      .wait(['@investigations', '@investigations', '@investigationsCount'], {
        timeout: 10000,
      });
    cy.get('[aria-label="Search table"]')
      .contains('Datafile')
      .contains('1')
      .click()
      .wait(['@datafiles', '@datafiles', '@datafilesCount'], {
        timeout: 10000,
      });
    cy.get('[href="/browse/investigation/45/dataset/105/datafile"]');
  });
});
