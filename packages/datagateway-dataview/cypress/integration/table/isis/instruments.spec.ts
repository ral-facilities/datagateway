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

  it('should disable the hover tool tip by pressing escape', () => {
    // The hover tool tip has a enter delay of 500ms.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="isis-instrument-table-name"]')
      .eq(2)
      .trigger('mouseover', { force: true })
      .wait(700)
      .get('[role="tooltip"]')
      .should('exist');

    cy.get('body').type('{esc}');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="isis-instrument-table-name"]')
      .wait(700)
      .first()
      .get('[role="tooltip"]')
      .should('not.exist');
  });

  describe('should be able to sort by', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Name').click().click();
    });

    it('ascending order', () => {
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Air it quickly everybody have image left. Likely also region a. Onto most shake necessary.'
      );
    });

    it('descending order', () => {
      cy.contains('[role="button"]', 'Name').click();
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'With piece reason late model. House office fly. International scene call deep answer audience baby true.'
      );
    });

    it('no order', () => {
      cy.contains('[role="button"]', 'Name').click();
      cy.contains('[role="button"]', 'Name').click();
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Season identify professor happen third. Beat professional blue clear style have. Light final summer.'
      );
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Name"]').first().type('space');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Exist board space brother section. Fast purpose right power away health south. Me ground more a kind last.'
      );
    });

    it('type', () => {
      cy.get('[aria-label="Filter by Type"]').first().type('4');

      cy.get('[aria-rowcount="2"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Near must surface law how full. Magazine soldier usually wish affect. Oil order catch work everybody nor. Become magazine concern fish throw turn us police. Draw manager long different include.'
      );
      cy.get('[aria-rowindex="2"] [aria-colindex="2"]').contains(
        'Success position hour town like various need. Admit fight see somebody other new you. Ten skin simply indeed. Offer box off. Beyond forward usually. Alone have avoid to base much free.'
      );
    });
  });

  describe('should be able to view details', () => {
    beforeEach(() => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Name').click().click();
    });

    it('when no other row is showing details', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    it('when another row is showing details', () => {
      cy.get('[aria-label="Show details"]')
        .eq(2)
        .click({ scrollBehavior: 'center' });

      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel')
        .contains(
          'Season identify professor happen third. Beat professional blue clear style have. Light final summer.'
        )
        .should('be.visible');
      cy.get('#details-panel')
        .contains(
          'North understand leader everyone skin. Actually prove begin boy those. Could size only. Late race city suddenly. Treat her wife training family effect.'
        )
        .should('not.exist');
      cy.get('[aria-label="Hide details"]').should('have.length', 1);
    });

    it('and view instrument details and scientists', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('[aria-controls="instrument-details-panel').should('be.visible');

      cy.get('#details-panel')
        .contains(
          'Many last prepare small. Maintain throw hope parent. Entire soon option bill fish against power. Rather why rise month shake voice.'
        )
        .should('be.visible');

      cy.get('[aria-controls="instrument-users-panel"]').should('be.visible');
      cy.get('[aria-controls="instrument-users-panel"]').click({
        scrollBehavior: 'center',
      });
      cy.get('#details-panel').contains('Marcus Dixon').should('be.visible');
    });

    it('and then not view details anymore', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('[aria-label="Hide details"]').first().click();

      cy.get('#details-panel').should('not.exist');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });
});
