describe('Investigation search tab', () => {
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

  it('should be able to search by title text', () => {
    cy.clearDownloadCart();
    cy.get('[aria-label="Search text input"]')
      .find('#filled-search')
      .type('dog');

    cy.get('[aria-label="Submit search button"]')
      .click()
      .wait(['@investigations', '@investigations', '@investigationsCount'], {
        timeout: 10000,
      });

    cy.get('[aria-rowcount="4"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="6"]').contains('0-942080-93-9');

    // Small wait to ensure rows are selected correctly
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    // Check that "select all" and individual selection are equivalent
    let i = 1;
    while (i < 5) {
      cy.get(`[aria-rowindex="${i}"] [aria-colindex="1"]`).click();
      i++;
    }
    cy.get('[aria-label="select all rows"]', { timeout: 10000 }).should(
      'be.checked'
    );
    cy.get('[aria-label="select all rows"]')
      .should('have.attr', 'data-indeterminate')
      .and('eq', 'false');
  });

  it('should be able to search by instrument text', () => {
    cy.get('[aria-label="Search text input"]')
      .find('#filled-search')
      .type('knowledge media');

    cy.get('[aria-label="Submit search button"]')
      .click()
      .wait(['@investigations', '@investigationsCount'], {
        timeout: 10000,
      });

    cy.get('[aria-label="Search table tabs"]')
      .contains('Investigation')
      .contains('32')
      .click();

    cy.get('[aria-rowcount="32"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="6"]').contains('0-682-97787-X');
  });

  it('should be able to search by date range', () => {
    cy.get('[aria-label="Start date input"]').type('2001-01-01');
    cy.get('[aria-label="End date input"]').type('2001-12-31');

    cy.get('[aria-label="Submit search button"]').click();

    cy.get('[aria-label="Search table tabs"]')
      .contains('Investigation')
      .contains('12')
      .click();

    cy.get('[aria-rowcount="12"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="6"]').contains('0-7285-7613-9');
  });

  it('should be hidden if investigation checkbox is unchecked', () => {
    cy.get('[aria-label="Investigation checkbox"]').click();

    cy.get('[aria-label="Submit search button"]')
      .click()
      .wait(['@datasets', '@datasets', '@datasetsCount'], {
        timeout: 10000,
      });

    cy.get('[aria-rowcount="50"]').should('exist');

    cy.get('[aria-label="Search table tabs"]')
      .contains('Investigation')
      .should('not.exist');
  });
});
