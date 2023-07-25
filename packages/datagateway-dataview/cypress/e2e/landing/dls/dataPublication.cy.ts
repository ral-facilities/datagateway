describe('DLS - Data Publication Landing', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/browse/dataPublication/45');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains('Consider author watch hot someone.').should('be.visible');
    cy.contains('Christina Kennedy').should('be.visible');
    cy.contains('2015-11-10').should('be.visible');
  });

  it('should be able to click tab to see content and it works like a normal table', () => {
    cy.get('#datapublication-content-tab').first().click();

    cy.get('[aria-rowcount="3"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('22');

    // test sorting
    cy.contains('Visit ID').click();
    cy.contains('Visit ID').click();
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('65');

    // test filtering
    cy.get('[aria-label="Filter by Visit ID"]').type('2');
    cy.get('[aria-rowcount="1"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('22');
  });

  it('should be able to click tab to see content and switch between entity types', () => {
    cy.get('#datapublication-content-tab').first().click();

    cy.contains('Datasets').click();
    cy.get('[aria-rowcount="0"]').should('exist');
    cy.contains('Create Time').should('be.visible');
    cy.contains('Location').should('not.exist');

    cy.contains('Datafiles').click();
    cy.get('[aria-rowcount="0"]').should('exist');
    cy.contains('Location').should('be.visible');

    cy.contains('Investigations').click();
    cy.contains('Visit ID').should('be.visible');
    cy.get('[aria-rowcount="3"]').should('exist');
  });

  it('should be able to click a DOI render the correct webpage ', () => {
    cy.contains('a', '0-515-25376-6').should(
      'have.attr',
      'href',
      'https://doi.org/0-515-25376-6'
    );
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

    cy.visit('/browseDataPublications/instrument/1/dataPublication/36');
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
    cy.intercept('**/datapublications?*', [
      {
        id: 101224979,
        pid: 'invaliddoi',
      },
    ]);
    cy.intercept('**/text/x-bibliography/invaliddoi?*', {
      statusCode: 503,
    });
    cy.visit('/browseDataPublications/instrument/1/dataPublication/36');
    cy.get('#datagateway-dataview').should('be.visible');
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
