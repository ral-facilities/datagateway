describe('ISIS - Investigation Data Publication Landing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit(
      '/browseDataPublications/instrument/13/dataPublication/57/investigation/46'
    );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.get('#investigation-details-panel')
      .contains('Because fine have business')
      .should('be.visible');
    cy.get('#investigation-details-panel')
      .contains('a', '0-686-22941-X')
      .should('have.attr', 'href', 'https://doi.org/0-686-22941-X');
    cy.get('#investigation-details-panel')
      .contains('INSTRUMENT 13')
      .should('be.visible');

    cy.get('[aria-label="landing-investigation-part-label"').should(
      'have.length',
      2
    );
  });

  it('should be able to click tab to see datasets', () => {
    cy.get('#investigation-datasets-tab').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseDataPublications/instrument/13/dataPublication/57/investigation/46/dataset'
    );
    cy.contains('Results: 2').should('be.visible');
  });

  it('should be able to click a specific dataset', () => {
    cy.get('[aria-label="landing-investigation-part-label"')
      .children()
      .first()
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseDataPublications/instrument/13/dataPublication/57/investigation/46/dataset/15'
    );
  });

  it('should load correctly when investigation missing', () => {
    cy.intercept('**/datapublications?order*', (req) => {
      req.continue((res) => {
        if (
          res.body?.[0]?.content?.dataCollectionInvestigations?.[0]
            ?.investigation
        )
          delete res.body[0].content.dataCollectionInvestigations[0]
            .investigation;
      });
    });

    cy.get('#investigation-details-panel')
      .contains('Because fine have business')
      .should('be.visible');
    cy.get('#investigation-details-panel')
      .contains('a', '0-686-22941-X')
      .should('have.attr', 'href', 'https://doi.org/0-686-22941-X');
    cy.get('#investigation-details-panel')
      .contains('INSTRUMENT 13')
      .should('not.exist');

    cy.get('[aria-label="landing-investigation-part-label"').should(
      'not.exist'
    );
  });

  it('should disable the hover tool tip by pressing escape', () => {
    cy.intercept('**/datapublications?*', [
      {
        id: 36,
        pid: '10.5286/ISIS.E.RB1810842',
      },
    ]);
    cy.get('[data-testid="isis-investigations-landing-parent-doi-link"]')
      .first()
      .trigger('mouseover');
    cy.get('[role="tooltip"]').should('exist');

    cy.get('body').type('{esc}');

    cy.get('[data-testid="isis-investigation-landing-doi-link"]')
      .first()
      .get('[role="tooltip"]')
      .should('not.exist');
  });

  it('should be able to use the citation formatter', () => {
    cy.intercept('**/datapublications?*', [
      {
        id: 101224979,
        pid: '10.5286/ISIS.E.RB1810842',
      },
    ]);
    cy.intercept('**/text/x-bibliography/10.5286/ISIS.E.RB1810842?*', [
      '@misc{dr sabrina gaertner_mr vincent deguin_dr pierre ghesquiere_dr claire...}',
    ]);

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
    cy.intercept('**/datapublications?*', [
      {
        id: 101224979,
        pid: 'invaliddoi',
      },
    ]);
    cy.intercept('**/text/x-bibliography/invaliddoi?*', {
      statusCode: 503,
    });

    cy.contains('invaliddoi').should('be.visible');

    //Default citation
    cy.get('[data-testid="citation-formatter-citation"]').contains(
      'STFC ISIS Neutron and Muon Source, https://doi.org/invaliddoi'
    );

    cy.get('#citation-formatter').click();
    cy.get('[role="listbox"]')
      .find('[role="option"]')
      .should('have.length.gte', 2);

    cy.get('[role="option"][data-value="chicago-author-date"]').click();
    cy.get('#citation-formatter-error-message', { timeout: 10000 }).should(
      'exist'
    );
  });
});
