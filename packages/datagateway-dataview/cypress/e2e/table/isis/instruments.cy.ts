describe('ISIS - Instruments Table', () => {
  beforeEach(() => {
    cy.intercept('**/instruments/count*').as('getInstrumentsCount');
    cy.intercept('**/instruments?order*').as('getInstrumentsOrder');
    cy.login();
    cy.visit('/browse/instrument').wait(
      ['@getInstrumentsCount', '@getInstrumentsOrder'],
      { timeout: 10000 }
    );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    //Default sort
    cy.get('[aria-sort="ascending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
  });

  it('should be able to click an instrument to see its facilityCycle', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });
    cy.location('pathname').should('eq', '/browse/instrument/11/facilityCycle');
  });

  // Not enough data in instruments to scroll down and load more rows.
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  it('should be able to sort by all sort directions on single and multiple columns', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Name').as('nameSortButton').click();
    cy.get('@nameSortButton').click();

    // ascending order
    cy.get('@nameSortButton').click();

    cy.get('[aria-sort="ascending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
      'Eight imagine picture tough.'
    );

    // descending order
    cy.get('@nameSortButton').click();

    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
      'not.have.css',
      'opacity',
      '0'
    );
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
      'Whether number computer economy design now serious appear.'
    );

    // no order
    cy.get('@nameSortButton').click();

    cy.get('[aria-sort="ascending"]').should('not.exist');
    cy.get('[aria-sort="descending"]').should('not.exist');
    // cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
    // cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
    //   'have.css',
    //   'opacity',
    //   '0'
    // );
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
      'Stop prove field onto think suffer measure.'
    );
  });

  it('should be able to filter with text filter on multiple columns', () => {
    cy.get('[aria-label="Filter by Type"]').first().type('4');

    cy.get('[aria-rowcount="2"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
      'Space I environmental.'
    );
    cy.get('[aria-rowindex="2"] [aria-colindex="2"]').contains(
      'Up election edge his not add.'
    );

    cy.get('[aria-label="Filter by Name"]').first().type('space');

    cy.get('[aria-rowcount="1"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
      'Space I environmental.'
    );
  });

  it('should be able to view details', () => {
    cy.get('[aria-label="Show details"]').eq(1).click();

    cy.get('#details-panel').should('be.visible');
    const firstDetailsPanelText = 'General attorney city month.';
    cy.get('#details-panel')
      .contains(firstDetailsPanelText)
      .should('be.visible');
    cy.get('[aria-label="Hide details"]').should('exist');

    cy.get('[aria-label="Show details"]').first().click();

    cy.get('#details-panel')
      .contains('Eight imagine picture tough')
      .should('be.visible');
    cy.get('#details-panel')
      .contains(firstDetailsPanelText)
      .should('not.exist');
    cy.get('[aria-label="Hide details"]').should('have.length', 1);

    cy.get('[aria-controls="instrument-details-panel').should('be.visible');

    cy.get('#details-panel')
      .contains('Skill quality beautiful.')
      .should('be.visible');

    cy.get('[aria-controls="instrument-users-panel"]').should('be.visible');
    cy.get('[aria-controls="instrument-users-panel"]').click({
      scrollBehavior: 'center',
    });
    cy.get('#details-panel').contains('Kim Ramirez').should('be.visible');

    cy.get('[aria-label="Hide details"]').first().click();

    cy.get('#details-panel').should('not.exist');
    cy.get('[aria-label="Hide details"]').should('not.exist');
  });
});
