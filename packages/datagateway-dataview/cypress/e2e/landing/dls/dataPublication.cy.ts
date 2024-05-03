export type MintResponse = Cypress.Response<{
  concept: { doi: string; data_publication: string };
  version: { doi: string; data_publication: string };
}>;

describe('DLS - Data Publication Landing', () => {
  beforeEach(() => {
    cy.login(
      {
        username: 'Chris481',
        password: 'pw',
        mechanism: 'simple',
      },
      'Chris481'
    );
    cy.seedUserGeneratedDataPublication().as('dataPublication1');
    cy.get('@dataPublication1')
      .its('body.concept.data_publication')
      .then((id) => cy.visit(`/browse/dataPublication/${id}`));
    cy.seedDownloadCart(['datafile 550']);
  });

  afterEach(() => {
    cy.get<MintResponse>('@dataPublication1').then((dp) => {
      cy.clearUserGeneratedDataPublications([
        dp.body.concept.data_publication,
        dp.body.version.data_publication,
      ]);
    });
    cy.clearDownloadCart();
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains('Test DOI title').should('be.visible');
    cy.contains('Test DOI description').should('be.visible');
    cy.contains('Thomas Chambers').should('be.visible');

    cy.get<MintResponse>('@dataPublication1').then((dp) => {
      cy.contains('a', dp.body.concept.doi);

      cy.contains('a', dp.body.version.doi);
    });
  });

  it('should be able to click tab to see content and it works like a normal table', () => {
    cy.get('#datapublication-content-tab').first().click();

    cy.contains('Datafiles').click();

    cy.get('[aria-rowcount="2"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('74');

    // test sorting
    cy.contains('Name').click();
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('193');

    // test filtering
    cy.get('[aria-label="Filter by Name"]').type('7');
    cy.get('[aria-rowcount="1"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('74');
  });

  it('should be able to click tab to see content and switch between entity types', () => {
    cy.get('#datapublication-content-tab').first().click();

    cy.contains('Datasets').click();
    cy.get('[aria-rowcount="1"]').should('exist');
    cy.contains('Create Time').should('be.visible');
    cy.contains('Location').should('not.exist');

    cy.contains('Datafiles').click();
    cy.get('[aria-rowcount="2"]').should('exist');
    cy.contains('Location').should('be.visible');

    cy.contains('Investigations').click();
    cy.contains('Visit ID').should('be.visible');
    cy.get('[aria-rowcount="0"]').should('exist');
  });

  it('should be able to click a DOI & it renders the correct webpage ', () => {
    cy.get<MintResponse>('@dataPublication1').then((dp) => {
      cy.contains('a', dp.body.concept.doi).should(
        'have.attr',
        'href',
        `https://doi.org/${dp.body.concept.doi}`
      );
    });
  });

  it('should let the user edit their data publication', () => {
    cy.get('[aria-label="Edit Data Publication"]').click();

    cy.contains('Generate DOI').should('be.visible');

    // edit metadata
    cy.contains('DOI Title')
      .parent()
      .find('input')
      .as('titleInput')
      .should('have.value', 'Test DOI title');
    cy.contains('DOI Description')
      .parent()
      .find('textarea')
      .first()
      .as('descriptionInput')
      .should('have.value', 'Test DOI description');

    cy.get('@titleInput').clear();
    cy.get('@titleInput').type('New DOI title');

    cy.get('@descriptionInput').clear();
    cy.get('@descriptionInput').type('New DOI description');

    cy.contains('Username').parent().find('input').type('Michael222');
    cy.contains('button', 'Add Creator').click();

    // DOI from https://support.datacite.org/docs/testing-guide
    cy.contains(/^DOI$/).parent().find('input').type('10.17596/w76y-4s92');
    cy.contains('button', 'Add DOI').click();
    cy.contains('label', 'Resource Type').parent().click();
    cy.contains('Journal').click();
    cy.contains('label', 'Relationship').parent().click();
    cy.contains('IsCitedBy').click();

    // edit content
    cy.contains('Datafiles').click();
    cy.get('[aria-label="Edit data"]').click();

    cy.contains('Datafile 550').click();
    cy.contains('>').click();

    cy.contains('Datafile 193').click();
    cy.contains('<').click();

    cy.contains('Done').click();

    cy.contains('button', 'Generate DOI').click();

    cy.contains('Mint Confirmation').should('be.visible');
    cy.contains('Mint was successful', { timeout: 10000 }).should('be.visible');
    cy.contains('View Data Publication').click();

    // check data is updated
    cy.contains('New DOI title').should('be.visible');
    cy.contains('New DOI description').should('be.visible');
    cy.contains('Randy Beasley').should('be.visible');

    cy.get('[data-testid="landing-dataPublication-pid-link"]')
      .first()
      .invoke('text')
      .as('newVersionDOI');

    // visit concept DOI and check it's updated there
    cy.get('@dataPublication1')
      .its('body.concept.data_publication')
      .then((id) => cy.visit(`/browse/dataPublication/${id}`));

    cy.contains('New DOI title').should('be.visible');
    cy.contains('New DOI description').should('be.visible');
    cy.contains('Randy Beasley').should('be.visible');

    cy.get('@newVersionDOI').then((doi) => {
      cy.contains('Latest Version DOI')
        .parent()
        .next()
        .should('contain.text', doi);
    });

    cy.get(
      '#version-panel-content [data-testid="landing-dataPublication-pid-link"]'
    ).should('have.length', 2);
  });

  it('should be able to use the citation formatters', () => {
    cy.contains('Test DOI title').should('be.visible');

    cy.get<MintResponse>('@dataPublication1').then((response) => {
      cy.intercept(`**/text/x-bibliography/${response.body.concept.doi}?*`, [
        '@misc{dr sabrina gaertner_mr vincent deguin_dr pierre ghesquiere_dr claire...}',
      ]);

      cy.intercept(`**/text/x-bibliography/${response.body.version.doi}?*`, [
        '@misc{dr alice barrett_mr charlie deguin_dr elizabeth francis_dr gary...}',
      ]);

      cy.get(
        '[data-testid="Latest-Version-Data-Citation-citation-formatter-citation"]'
      )
        .first()
        .contains(
          `STFC ISIS Neutron and Muon Source, https://doi.org/${response.body.version.doi}`
        );
      cy.get(
        '[data-testid="Concept-Data-Citation-citation-formatter-citation"]'
      )
        .last()
        .contains(
          `STFC ISIS Neutron and Muon Source, https://doi.org/${response.body.concept.doi}`
        );
    });

    cy.get('#Concept-Data-Citation-citation-formatter').click();
    cy.get('[role="listbox"]')
      .find('[role="option"]')
      .should('have.length.gte', 2);

    cy.get('[role="option"][data-value="bibtex"]').click();
    cy.get(
      '[data-testid="Concept-Data-Citation-citation-formatter-citation"]'
    ).contains(
      '@misc{dr sabrina gaertner_mr vincent deguin_dr pierre ghesquiere_dr claire'
    );
    cy.get('#Concept-Data-Citation-citation-formatter-error-message').should(
      'not.exist'
    );

    cy.get('#Latest-Version-Data-Citation-citation-formatter').click();
    cy.get('[role="listbox"]')
      .find('[role="option"]')
      .should('have.length.gte', 2);

    cy.get('[role="option"][data-value="bibtex"]').click();
    cy.get(
      '[data-testid="Latest-Version-Data-Citation-citation-formatter-citation"]'
    ).contains(
      '@misc{dr alice barrett_mr charlie deguin_dr elizabeth francis_dr gary'
    );
    cy.get(
      '#Latest-Version-Data-Citation-citation-formatter-error-message'
    ).should('not.exist');
  });

  it('citation formatters should give an error when there is a problem', () => {
    cy.contains('Test DOI title').should('be.visible');

    cy.get<MintResponse>('@dataPublication1').then((response) => {
      cy.intercept(`**/text/x-bibliography/${response.body.concept.doi}?*`, {
        statusCode: 503,
      });

      cy.intercept(`**/text/x-bibliography/${response.body.version.doi}?*`, {
        statusCode: 503,
      });

      cy.get(
        '[data-testid="Latest-Version-Data-Citation-citation-formatter-citation"]'
      )
        .first()
        .contains(
          `STFC ISIS Neutron and Muon Source, https://doi.org/${response.body.version.doi}`
        );
      cy.get(
        '[data-testid="Concept-Data-Citation-citation-formatter-citation"]'
      )
        .last()
        .contains(
          `STFC ISIS Neutron and Muon Source, https://doi.org/${response.body.concept.doi}`
        );
    });

    cy.get('#Concept-Data-Citation-citation-formatter').click();
    cy.get('[role="listbox"]')
      .find('[role="option"]')
      .should('have.length.gte', 2);

    cy.get('[role="option"][data-value="chicago-author-date"]').click();
    cy.get('#Concept-Data-Citation-citation-formatter-error-message', {
      timeout: 10000,
    }).should('exist');

    cy.get('#Latest-Version-Data-Citation-citation-formatter').click();
    cy.get('[role="listbox"]')
      .find('[role="option"]')
      .should('have.length.gte', 2);

    cy.get('[role="option"][data-value="chicago-author-date"]').click();
    cy.get('#Latest-Version-Data-Citation-citation-formatter-error-message', {
      timeout: 10000,
    }).should('exist');
  });
});
