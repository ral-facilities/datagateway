describe('Dataset search tab', () => {
  let facilityName: string;

  before(() => {
    cy.readFile('server/e2e-settings.json').then((settings) => {
      if (settings.facilityName) facilityName = settings.facilityName;
    });
  });

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
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Search');

    cy.get('[aria-label="Investigation checkbox"]').click();
    cy.get('[aria-label="Datafile checkbox"]').click();

    cy.get('[aria-label="Submit search"]')
      .click()
      .wait(['@datasets', '@datasets', '@datasetsCount'], {
        timeout: 10000,
      });

    cy.get('#container-search-filters').should('exist');

    cy.get('#container-search-table').should('exist');
  });

  it('should be able to filter with advanced filters', () => {
    cy.get('[aria-label="Investigation checkbox"]').click();
    cy.get('[aria-label="Datafile checkbox"]').click();

    cy.get('[aria-label="Submit search"]')
      .click()
      .wait(['@datasets', '@datasets', '@datasetsCount'], {
        timeout: 10000,
      });

    cy.get('[aria-label="Filter by Investigation"]').type('spend');

    cy.get('[aria-label="Filter by Name"]').type('1');

    cy.get('[id="Create Time filter from"]').type('2007-03-29');

    cy.get('[id="Create Time filter to"]').type('2009-03-29');

    cy.get('[id="Modified Time filter from"]').type('2009-05-31');

    cy.get('[id="Modified Time filter to"]').type('2011-05-31');

    cy.get('[aria-rowcount="1"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 15');
  });

  it('should be able to search by text', () => {
    cy.clearDownloadCart();
    cy.get('[aria-label="Search text input"]')
      .find('#filled-search')
      .type('police');

    cy.get('[aria-label="Submit search"]')
      .click()
      .wait(['@investigations', '@investigations', '@investigationsCount'], {
        timeout: 15000,
      });

    cy.get('[aria-label="Search table"]')
      .contains('Dataset')
      .contains('10')
      .click()
      .wait(['@datasets', '@datasets', '@datasetsCount'], {
        timeout: 15000,
      });

    cy.get('[aria-rowcount="10"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 7');

    // Check that "select all" and individual selection are equivalent
    let i = 1;
    while (i < 11) {
      cy.get(`[aria-rowindex="${i}"] [aria-colindex="1"]`)
        .click()
        .wait('@topcat', { timeout: 10000 });
      i++;
    }
    cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
      'be.checked'
    );
    cy.get('[aria-label="select all rows"]')
      .should('have.attr', 'data-indeterminate')
      .and('eq', 'false');
  });

  it('should be able to search by date range', () => {
    cy.get('[aria-label="Start date input"]').type('2003-01-01');
    cy.get('[aria-label="End date input"]').type('2004-01-01');

    cy.get('[aria-label="Submit search"]').click();

    cy.get('[aria-label="Search table"]')
      .contains('Dataset')
      .contains('4')
      .click();

    cy.get('[aria-rowcount="4"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 12');
  });

  it('should be hidden if dataset checkbox is unchecked', () => {
    cy.get('[aria-label="Dataset checkbox"]').click();

    cy.get('[aria-label="Submit search"]')
      .click()
      .wait(['@investigations', '@investigations', '@investigationsCount'], {
        timeout: 10000,
      });

    cy.get('[aria-rowcount="50"]').should('exist');

    cy.get('[aria-label="Search table"]')
      .contains('Dataset')
      .should('not.exist');
  });

  it('should link to a dataset', () => {
    cy.get('[aria-label="Search text input"]')
      .find('#filled-search')
      .type('12');
    cy.get('[aria-label="Start date input"]').type('2003-01-01');
    cy.get('[aria-label="End date input"]').type('2004-01-01');

    cy.get('[aria-label="Submit search"]').click();

    cy.get('[aria-label="Search table"]')
      .contains('Dataset')
      .contains('1')
      .click();

    cy.get('[href="/browse/investigation/12/dataset/12/datafile"]');
  });

  it('should link to a parent investigation', () => {
    cy.get('[aria-label="Search text input"]')
      .find('#filled-search')
      .type('12');
    cy.get('[aria-label="Start date input"]').type('2003-01-01');
    cy.get('[aria-label="End date input"]').type('2004-01-01');

    cy.get('[aria-label="Submit search"]').click();

    cy.get('[aria-label="Search table"]')
      .contains('Dataset')
      .contains('1')
      .click();

    cy.get('[href="/browse/investigation/12/dataset"]');
  });
});
