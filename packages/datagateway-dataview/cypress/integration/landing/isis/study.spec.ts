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
    cy.get('[data-testid="landing-study-part-label"')
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

    cy.get('[data-testid="landing-study-pid-link"]')
      .first()
      .then(($pid) => {
        const pid = $pid.text();

        const url = `https://doi.org/${pid}`;

        cy.get('[data-testid="landing-study-pid-link"]')
          .first()
          .should('have.attr', 'href', url);
      });

    // Parent DOI

    cy.get('[data-testid="landing-study-doi-link"]')
      .first()
      .then(($doi) => {
        const doi = $doi.text();

        const url = `https://doi.org/${doi}`;

        cy.get('[data-testid="landing-study-doi-link"]')
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

  it('should disable the hover tool tip by pressing escape', () => {
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
    // The hover tool tip has a enter delay of 500ms.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="landing-study-pid-link"]')
      .first()
      .trigger('mouseover')
      .wait(700)
      .get('[data-testid="arrow-tooltip-component-true"]')
      .should('exist');

    cy.get('body').type('{esc}');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="landing-study-pid-link"]')
      .wait(700)
      .first()
      .get('[data-testid="arrow-tooltip-component-false"]')
      .first()
      .should('exist');
  });

  it('should be able to use the citation formatter', () => {
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

    cy.get('#citation-formatter').click();
    cy.get('[role="listbox"]')
      .find('[role="option"]')
      .should('have.length.gte', 2);

    cy.get('[role="option"][data-value="chicago-author-date"]').click();
    cy.get('[data-testid="citation-formatter-citation"]').contains(
      'Dr Sabrina Gaertner, Mr Vincent DEGUIN, Dr Pierre Ghesquiere, Dr Claire PETUYA, Dr Tristan Youngs, Dr Helen Fraser, Dr Bastian Gundlach, et al. 2018. ‘Amorphous Micrometre-Sized Water Ice Particles for Planetary Science Experiments: Characterising Ice Phase and Surface Structures’. ISIS Facility. https://doi.org/10.5286/ISIS.E.RB1810842.'
    );
    cy.get('#citation-formatter-error-message').should('not.exist');
  });

  it('citation formatter should give an error when there is a problem', () => {
    cy.intercept('/studies', [
      {
        id: 101224979,
        pid: 'invaliddoi',
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
    cy.contains('invaliddoi').should('be.visible');

    cy.get('#citation-formatter').click();
    cy.get('[role="listbox"]')
      .find('[role="option"]')
      .should('have.length.gte', 2);

    cy.get('[role="option"][data-value="chicago-author-date"]').click();
    cy.get('#citation-formatter-error-message').should('exist');
  });
});
