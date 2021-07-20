describe('Datafile search tab', () => {
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
    cy.intercept('/topcat/user/cart/LILS/cartItems').as('topcat');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Search');

    cy.get('#container-search-filters').should('exist');

    cy.get('#container-search-table').should('exist');
  });

  it('should be able to search by text', () => {
    cy.clearDownloadCart();
    cy.get('[aria-label="Search text input"]')
      .find('#filled-search')
      .type('2106');

    cy.get('[aria-label="Submit search button"]')
      .click()
      .wait(['@investigations', '@investigations', '@investigationsCount'], {
        timeout: 10000,
      });

    cy.get('[aria-label="Search table tabs"]')
      .contains('Datafile')
      .contains('1')
      .click()
      .wait(['@datafiles', '@datafiles', '@datafilesCount'], {
        timeout: 10000,
      });

    cy.get('[aria-rowcount="1"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Datafile 2106');

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
    cy.get('[aria-label="End date input"]').type('2012-02-03');

    cy.get('[aria-label="Submit search button"]').click();

    cy.get('[aria-label="Search table tabs"]')
      .contains('Datafile')
      .contains('9')
      .click()
      .wait(['@datafiles', '@datafiles', '@datafilesCount'], {
        timeout: 10000,
      });

    cy.get('[aria-rowcount="9"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('Datafile 1956');
  });

  it('should be hidden if datafile checkbox is unchecked', () => {
    cy.get('[aria-label="Datafile checkbox"]').click();

    cy.get('[aria-label="Submit search button"]')
      .click()
      .wait(['@investigations', '@investigations', '@investigationsCount'], {
        timeout: 10000,
      });

    cy.get('[aria-rowcount="50"]').should('exist');

    cy.get('[aria-label="Search table tabs"]')
      .contains('Datafile')
      .should('not.exist');
  });

  it.only('should link to a parent dataset', () => {
    cy.get('[aria-label="Search text input"]')
      .find('#filled-search')
      .type('1956');

    cy.get('[aria-label="Submit search button"]')
      .click()
      .wait(['@investigations', '@investigations', '@investigationsCount'], {
        timeout: 10000,
      });
    cy.get('[aria-label="Search table tabs"]')
      .contains('Datafile')
      .contains('1')
      .click()
      .wait(['@datafiles', '@datafiles', '@datafilesCount'], {
        timeout: 10000,
      });
    cy.get('[href="/browse/investigation/41/dataset/41/datafile"]');
  });
});
