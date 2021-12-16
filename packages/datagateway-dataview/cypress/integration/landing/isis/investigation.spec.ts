describe('ISIS - Investigation Landing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/browse/instrument/1/facilityCycle/16/investigation/97');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains('Again bad simply low summer').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('#investigation-datasets-tab').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/16/investigation/97/dataset'
    );
  });

  it('should have the correct urls for the DOI link and parent DOI link', () => {
    // DOI

    cy.get('[data-testid="isis-investigation-landing-doi-link"]')
      .first()
      .then(($doi) => {
        const doi = $doi.text();

        const url = `https://doi.org/${doi}`;

        cy.get('[data-testid="isis-investigation-landing-doi-link"]')
          .first()
          .should('have.attr', 'href', url);
      });

    // Parent DOI

    cy.get('[data-testid="isis-investigations-landing-parent-doi-link"]')
      .first()
      .then(($doi) => {
        const doi = $doi.text();

        const url = `https://doi.org/${doi}`;

        cy.get('[data-testid="isis-investigations-landing-parent-doi-link"]')
          .first()
          .should('have.attr', 'href', url);
      });
  });

  it('should be able to click a specific dataset', () => {
    cy.get('[aria-label="landing-investigation-part-label"')
      .children()
      .first()
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/16/investigation/97/dataset/337'
    );
  });

  it('should disable the hover tool tip by pressing escape', () => {
    cy.intercept('/investigations', [
      {
        id: 1,
        title: 'Test 1',
        name: 'Test 1',
        summary: 'foo bar',
        visitId: '1',
        doi: '10.5286/ISIS.E.RB1810842',
        size: 1,
        studyInvestigations: [
          {
            id: 6,
            investigation: {
              id: 1,
            },
            study: {
              id: 7,
              pid: '10.5286/ISIS.E.RB1810842',
              startDate: '2019-06-10',
              endDate: '2019-06-11',
            },
          },
        ],
      },
    ]);

    // The hover tool tip has a enter delay of 500ms.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="isis-investigations-landing-parent-doi-link"]')
      .first()
      .trigger('mouseover')
      .wait(700)
      .get('[data-testid="arrow-tooltip-component-true"]')
      .should('exist');

    cy.get('body').type('{esc}');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="isis-investigations-landing-parent-doi-link"]')
      .wait(700)
      .first()
      .get('[data-testid="arrow-tooltip-component-false"]')
      .first()
      .should('exist');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="isis-investigation-landing-doi-link"]')
      .first()
      .trigger('mouseover')
      .wait(700)
      .get('[data-testid="arrow-tooltip-component-true"]')
      .should('exist');

    cy.get('body').type('{esc}');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-testid="isis-investigation-landing-doi-link"]')
      .wait(700)
      .first()
      .get('[data-testid="arrow-tooltip-component-false"]')
      .first()
      .should('exist');
  });

  it('should be able to use the citation formatter', () => {
    cy.intercept('/investigations', [
      {
        id: 1,
        title: 'Test 1',
        name: 'Test 1',
        summary: 'foo bar',
        visitId: '1',
        doi: '10.5286/ISIS.E.RB1810842',
        size: 1,
      },
    ]);
    cy.visit('/browse/instrument/1/facilityCycle/16/investigation/97');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains('10.5286/ISIS.E.RB1810842').should('be.visible');
    cy.get('[data-testid="citation-formatter-citation"]').contains(
      'STFC ISIS Neutron and Muon Source, https://doi.org/10.5286/ISIS.E.RB1810842'
    );

    cy.get('#citation-formatter').click();
    cy.get('[role="listbox"]')
      .find('[role="option"]')
      .should('have.length.gte', 2);

    cy.get('[role="option"][data-value="bibtex"]').click();
    cy.get('[data-testid="citation-formatter-citation"]').contains(
      '@misc{dr sabrina gaertner_mr vincent deguin_dr pierre ghesquiere_dr claire'
    );
    cy.get('#citation-formatter-error-message').should('not.exist');
  });

  it('citation formatter should give an error when there is a problem', () => {
    cy.intercept('/investigations', [
      {
        id: 1,
        title: 'Test 1',
        name: 'Test 1',
        summary: 'foo bar',
        visitId: '1',
        doi: 'invaliddoi',
        size: 1,
        startDate: '2019-06-10',
      },
    ]);
    cy.visit('/browse/instrument/1/facilityCycle/16/investigation/97');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains('invaliddoi').should('be.visible');

    //Default citation
    cy.get('[data-testid="citation-formatter-citation"]').contains(
      '2019: Test 1, STFC ISIS Neutron and Muon Source, https://doi.org/invaliddoi'
    );

    cy.get('#citation-formatter').click();
    cy.get('[role="listbox"]')
      .find('[role="option"]')
      .should('have.length.gte', 2);

    cy.get('[role="option"][data-value="chicago-author-date"]').click();
    cy.get('#citation-formatter-error-message').should('exist');
  });
});
