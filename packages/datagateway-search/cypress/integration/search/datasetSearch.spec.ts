describe('Dataset search tab', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.visit('/search/data/');
    cy.intercept('/investigations/count?where=%7B%22ID').as(
      'investigationsCount'
    );
    cy.intercept('/investigations?').as('investigations');
    cy.intercept('/datasets/count?where=%7B%22ID').as('datasetsCount');
    cy.intercept('/datasets?').as('datasets');
    cy.intercept('/datafiles/count?where=%7B%22ID').as('datafilesCount');
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
      .type('police');

    cy.get('[aria-label="Submit search button"]')
      .click()
      .wait(['@investigations', '@investigations', '@investigationsCount'], {
        timeout: 10000,
      });

    cy.get('[aria-label="Search table tabs"]')
      .contains('Dataset')
      .contains('12')
      .click()
      .wait(['@datasets', '@datasets', '@datasetsCount'], {
        timeout: 10000,
      });

    cy.get('[aria-rowcount="12"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 97');

    // Check that "select all" and individual selection are equivalent
    let i = 1;
    while (i < 13) {
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

    cy.get('[aria-label="Submit search button"]').click();

    cy.get('[aria-label="Search table tabs"]')
      .contains('Dataset')
      .contains('1')
      .click();

    cy.get('[aria-rowcount="1"]').should('exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('DATASET 12');
  });

  it('should be hidden if dataset checkbox is unchecked', () => {
    cy.get('[aria-label="Dataset checkbox"]').click();

    cy.get('[aria-label="Submit search button"]').click();

    cy.get('[aria-rowcount="50"]').should('exist');

    cy.get('[aria-label="Search table tabs"]')
      .contains('Dataset')
      .should('not.exist');
  });
});
