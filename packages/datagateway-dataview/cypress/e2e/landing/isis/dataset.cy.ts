describe('ISIS - Dataset Landing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit(
      '/browse/instrument/1/facilityCycle/19/investigation/19/dataset/79'
    );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains('DATASET 79').should('be.visible');

    // DOI

    cy.get('[data-testid="isis-dataset-landing-doi-link"]')
      .first()
      .then(($doi) => {
        const doi = $doi.text();

        const url = `https://doi.org/${doi}`;

        cy.get('[data-testid="isis-dataset-landing-doi-link"]')
          .first()
          .should('have.attr', 'href', url);
      });
  });

  it('should be able to click a dataset to see its datafiles', () => {
    cy.get('#dataset-datafiles-tab').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/19/investigation/19/dataset/79/datafile'
    );
  });

  it('should disable the hover tool tip by pressing escape', () => {
    cy.intercept(
      '**/datasets?*where=%7B%22id%22%3A%7B%22eq%22%3A%2279%22%7D%7D&include=%22type%22',
      [
        {
          id: 79,
          name: 'Test 1',
          description: 'test',
          modTime: '2019-06-10',
          createTime: '2019-06-10',
          doi: '10.5286/ISIS.E.RB1810842',
          startDate: '2019-06-10',
          endDate: '2019-06-11',
          complete: true,
        },
      ]
    );

    cy.get('[data-testid="isis-dataset-landing-doi-link"]')
      .first()
      .trigger('mouseover');
    cy.get('[role="tooltip"]').should('exist');

    cy.get('body').type('{esc}');

    cy.get('[data-testid="isis-dataset-landing-doi-link"]')
      .first()
      .get('[role="tooltip"]')
      .should('not.exist');
  });
});
