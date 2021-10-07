describe('SearchPageContainer Component', () => {
  let facilityName: string;
  before(() => {
    cy.readFile('server/e2e-settings.json').then((settings) => {
      if (settings.facilityName) facilityName = settings.facilityName;
    });
  });
  beforeEach(() => {
    cy.login();

    cy.visit('/search/data/');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Search');

    cy.get('#container-search-filters').should('exist');
  });

  it('should display selection alert banner correctly', () => {
    cy.intercept('/investigations/count?where=%7B%22id').as(
      'investigationsCount'
    );
    cy.intercept('/investigations?').as('investigations');
    cy.intercept(`/topcat/user/cart/${facilityName}/cartItems`).as('topcat');

    //Check banner displays when it should
    cy.clearDownloadCart();
    cy.get('[aria-label="Search text input"]')
      .find('#filled-search')
      .type('test');

    cy.get('[aria-label="Submit search"]')
      .click()
      .wait(['@investigations', '@investigations', '@investigationsCount'], {
        timeout: 10000,
      });

    cy.get(`[aria-rowindex="1"] [aria-colindex="1"]`)
      .click()
      .wait('@topcat', { timeout: 10000 });

    cy.get('[aria-label="selection-alert"]').should('exist');
    cy.get('[aria-label="selection-alert-text"]')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal('1 item has been added to selections.');
      });

    //Check can go to selections
    cy.get('[aria-label="selection-alert-link"]').click();
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal('/download');
    });
    cy.go('back');

    //Check can close banner
    cy.get('[aria-label="selection-alert-close"]').click();
    cy.get('[aria-label="selection-alert"]').should('not.exist');
  });
});
