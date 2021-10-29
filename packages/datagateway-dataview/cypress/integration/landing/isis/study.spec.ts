describe('ISIS - Study Landing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/browseStudyHierarchy/instrument/1/study/4');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains('He represent address cut environmental special size').should(
      'be.visible'
    );
  });

  it('should be able to click tab to see investigations', () => {
    cy.get('#study-investigations-tab').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseStudyHierarchy/instrument/1/study/4/investigation'
    );
  });

  it('should be able to click a specific investigation', () => {
    cy.get('[aria-label="landing-study-part-label"')
      .children()
      .first()
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseStudyHierarchy/instrument/1/study/4/investigation/16'
    );
  });

  it('should be able to click a DOI render the correct webpage ', () => {
    cy.contains('0-01-491314-3').should(
      'have.attr',
      'href',
      'https://doi.org/0-01-491314-3'
    );
  });

  it('should load correctly when investigation missing', () => {
    cy.intercept('/studies', [
      {
        id: 101224979,
        pid: '10.5286/ISIS.E.RB1810842',
        studyInvestigations: [
          {
            createId: 'uows/1050072',
            createTime: '2019-02-07 15:27:19.790000+00:00',
            id: 101224981,
          },
        ],
      },
    ]);
    cy.visit('/browseStudyHierarchy/instrument/1/study/4');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains('10.5286/ISIS.E.RB1810842').should('be.visible');
  });
});
