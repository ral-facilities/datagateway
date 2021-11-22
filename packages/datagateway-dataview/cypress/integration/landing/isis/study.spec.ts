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
    cy.contains('1-314-79096-X').should(
      'have.attr',
      'href',
      'https://doi.org/1-314-79096-X'
    );
  });

  it('should have the correct urls for the DOI link and Study PID', () => {
    // Study PID

    cy.get('[data-test-id="landing-study-pid-link"]')
      .first()
      .then(($pid) => {
        const pid = $pid.text();

        const url = `https://doi.org/${pid}`;

        cy.get('[data-test-id="landing-study-pid-link"]')
          .first()
          .should('have.attr', 'href', url);
      });

    // Parent DOI

    cy.get('[data-test-id="landing-study-doi-link"]')
      .first()
      .then(($doi) => {
        const doi = $doi.text();

        const url = `https://doi.org/${doi}`;

        cy.get('[data-test-id="landing-study-doi-link"]')
          .first()
          .should('have.attr', 'href', url);
      });
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
