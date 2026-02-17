export type UserDefinedMintResponse = Cypress.Response<{
  concept: { data_publication_id: string; attributes: { doi: string } };
  version: { data_publication_id: string; attributes: { doi: string } };
}>;

export type SessionMintResponse = Cypress.Response<{
  data_publication_id: string;
  attributes: { doi: string };
}>;

describe('DLS - User Generated Data Publication Landing', () => {
  const store = {};

  before(() => {
    cy.login({ username: 'root', password: 'pw', mechanism: 'simple' });
    cy.seedSessionDataPublication(false).as('sessionDataPublication');
    cy.dumpAliases(store);
  });

  beforeEach(() => {
    cy.restoreAliases(store);
    cy.login(
      {
        username: 'Chris481',
        password: 'pw',
        mechanism: 'simple',
      },
      'Chris481'
    );
    cy.seedUserGeneratedDataPublication().as('dataPublication1');
    cy.get<UserDefinedMintResponse>('@dataPublication1')
      .its('body.concept.data_publication_id')
      .then((id) => cy.visit(`/browse/dataPublication/${id}`));
    cy.seedDownloadCart(['datafile 550']);
    cy.intercept('**/datapublications?**').as('fetchDataPublication');
  });

  afterEach(() => {
    cy.get<UserDefinedMintResponse>('@dataPublication1').then((dp) => {
      cy.clearDataPublications([
        dp.body.concept.data_publication_id,
        dp.body.version.data_publication_id,
      ]);
    });

    cy.clearDownloadCart();
  });

  after(() => {
    cy.restoreAliases(store);
    cy.login({ username: 'root', password: 'pw', mechanism: 'simple' });
    cy.get<SessionMintResponse>('@sessionDataPublication').then((dp) => {
      cy.clearDataPublications([dp.body.data_publication_id]);
    });
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains('Test DOI title').should('be.visible');
    cy.contains('Test DOI description').should('be.visible');
    cy.contains('Thomas Chambers').should('be.visible');

    cy.get<UserDefinedMintResponse>('@dataPublication1').then((dp) => {
      cy.contains('a', dp.body.concept.attributes.doi);

      cy.contains('a', dp.body.version.attributes.doi);
    });
  });

  it('should be able to click tab to see content and it works like a normal table', () => {
    cy.get('#datapublication-content-tab').first().click();

    cy.contains('Datafiles').click();

    cy.get('[aria-rowcount="2"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('a', '74');

    // test sorting
    cy.contains('Name').click();
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('a', '193');

    // test filtering
    cy.get('[aria-label="Filter by Name"]').type('7');
    cy.get('[aria-rowcount="1"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('a', '74');
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
    cy.get<UserDefinedMintResponse>('@dataPublication1').then((dp) => {
      cy.contains('a', dp.body.concept.attributes.doi).should(
        'have.attr',
        'href',
        `https://doi.org/${dp.body.concept.attributes.doi}`
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
    cy.contains('Identifier (e.g. DOI, URL)')
      .parent()
      .find('input')
      .type('10.17596/w76y-4s92');
    cy.contains('button', 'Add DOI').click();
    cy.contains('label', 'Resource Type').parent().click();
    cy.contains('Journal').click();
    cy.contains('label', 'Relationship').parent().click();
    cy.contains('IsCitedBy').click();

    cy.contains('Identifier (e.g. DOI, URL)')
      .parent()
      .find('input')
      .type('my.identifier');
    cy.contains('button', 'Add Other').click();
    cy.contains('td', 'my.identifier')
      .parent()
      .contains('label', 'Resource Type')
      .last()
      .parent()
      .click();
    cy.contains('ComputationalNotebook').click();
    cy.contains('td', 'my.identifier')
      .parent()
      .contains('label', 'Relationship')
      .last()
      .parent()
      .click();
    cy.contains('IsSupplementedBy').click();

    // add a subject
    cy.findByRole('combobox', { name: 'Subjects' }).type('subject1{enter}');

    // add a technique
    cy.findByRole('button', { name: 'Add technique' }).click();
    cy.findByRole('combobox', { name: 'Select technique' }).type('x-ray');
    cy.findByRole('option', { name: 'x-ray standing wave (XSW)' }).click();
    cy.findByRole('cell', { name: 'borrmann effect' }).click();
    cy.findByRole('button', { name: 'Confirm' }).click();

    // edit content
    cy.contains('Datafiles').click();
    cy.get('[aria-label="Edit data"]').click();

    cy.contains('Datafile 550').click();
    cy.contains('>').click();

    cy.contains('Datafile 193').click();
    cy.contains('<').click();

    cy.contains('Done').click();

    cy.contains('button', 'Generate DOI').click();

    cy.contains('Please review the metadata', { timeout: 10000 }).should(
      'exist'
    );
    cy.contains('h2', 'Generate DOI').should('not.exist');

    cy.contains('Subject: subject1').should('exist');
    cy.contains('Subject: borrmann effect').should('exist');
    cy.contains(
      'Value URI: http://purl.org/pan-science/PaNET/PaNET01325'
    ).should('exist');

    cy.contains('div', 'Identifier: 10.17596/w76y-4s92')
      .as('relatedDOI')
      .should('exist');
    cy.get('@relatedDOI')
      .parent()
      .contains('Relationship: IsCitedBy')
      .should('exist');
    cy.get('@relatedDOI')
      .parent()
      .contains('Resource Type: Journal')
      .should('exist');
    cy.get('@relatedDOI').parent().contains('Type: DOI').should('exist');

    cy.contains('button', 'Generate DOI').click();

    cy.contains('Mint Confirmation').should('be.visible');
    cy.contains('Mint was successful', { timeout: 10000 }).should('be.visible');
    cy.contains('View Data Publication').click();

    // check data is updated
    cy.contains('New DOI title').should('be.visible');
    cy.contains('New DOI description').should('be.visible');
    cy.contains('Randy Beasley').should('be.visible');
    cy.contains('a', 'borrmann effect').should('be.visible');
    cy.contains('subject1').should('be.visible');

    cy.get('[data-testid="landing-dataPublication-pid-link"]')
      .first()
      .invoke('text')
      .as('newVersionDOI');

    // visit concept DOI and check it's updated there
    cy.get('@dataPublication1')
      .its('body.concept.data_publication_id')
      .then((id) => cy.visit(`/browse/dataPublication/${id}`));

    cy.contains('New DOI title').should('be.visible');
    cy.contains('New DOI description').should('be.visible');
    cy.contains('Randy Beasley').should('be.visible');
    cy.contains('a', 'borrmann effect').should('be.visible');
    cy.contains('subject1').should('be.visible');

    cy.get('@newVersionDOI').then((doi) => {
      cy.contains('Latest Version DOI')
        .parent()
        .next()
        .should('contain.text', doi);
    });

    cy.get(
      '#version-panel-content [data-testid="landing-dataPublication-pid-link"]'
    ).should('have.length', 2);

    cy.contains('Related Identifiers').click();

    cy.contains('my.identifier').should('be.visible');
    cy.contains('my.identifier').parent().parent().as('my.identifier-row');
    cy.get('@my.identifier-row')
      .contains('IsSupplementedBy')
      .should('be.visible');
    cy.get('@my.identifier-row')
      .contains('ComputationalNotebook')
      .should('be.visible');

    // expect both user added related identifiers and a part relation
    cy.get('@my.identifier-row').siblings().should('have.length', 2);
  });

  it('should let the user download their data publication', () => {
    cy.get('[aria-label="Download Data Publication"]').click();

    cy.get('[aria-label="Download confirmation dialog"]').should('exist');
    cy.contains('Download Size: 90.11 MB').should('be.visible');
    // set transport
    cy.get('#confirm-access-method').select('HTTPS');

    cy.contains('button', 'Download').click();

    cy.contains(
      '#download-confirmation-success',
      'Successfully submitted download request'
    ).should('exist');

    cy.get<{
      response: Cypress.Response<{ content: { id: string } }[]>;
    }>('@fetchDataPublication').then((res) => {
      cy.contains(
        '#confirm-success-download-name',
        `LILS_DataCollection${res.response.body[0].content.id}`
      ).should('exist');
    });

    cy.contains('#confirm-success-access-method', 'HTTPS').should('exist');
  });

  it('should be able to use the citation formatters', () => {
    cy.contains('Test DOI title').should('be.visible');

    cy.get<UserDefinedMintResponse>('@dataPublication1').then((response) => {
      cy.intercept(
        `**/text/x-bibliography/${response.body.concept.attributes.doi}?*`,
        [
          '@misc{dr sabrina gaertner_mr vincent deguin_dr pierre ghesquiere_dr claire...}',
        ]
      );

      cy.intercept(
        `**/text/x-bibliography/${response.body.version.attributes.doi}?*`,
        [
          '@misc{dr alice barrett_mr charlie deguin_dr elizabeth francis_dr gary...}',
        ]
      );

      cy.get(
        '[data-testid="Latest-Version-Data-Citation-citation-formatter-citation"]'
      )
        .first()
        .contains(
          `STFC ISIS Neutron and Muon Source, https://doi.org/${response.body.version.attributes.doi}`
        );
      cy.get(
        '[data-testid="Concept-Data-Citation-citation-formatter-citation"]'
      )
        .last()
        .contains(
          `STFC ISIS Neutron and Muon Source, https://doi.org/${response.body.concept.attributes.doi}`
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

    cy.get<UserDefinedMintResponse>('@dataPublication1').then((response) => {
      cy.intercept(
        `**/text/x-bibliography/${response.body.concept.attributes.doi}?*`,
        {
          statusCode: 503,
        }
      );

      cy.intercept(
        `**/text/x-bibliography/${response.body.version.attributes.doi}?*`,
        {
          statusCode: 503,
        }
      );

      cy.get(
        '[data-testid="Latest-Version-Data-Citation-citation-formatter-citation"]'
      )
        .first()
        .contains(
          `STFC ISIS Neutron and Muon Source, https://doi.org/${response.body.version.attributes.doi}`
        );
      cy.get(
        '[data-testid="Concept-Data-Citation-citation-formatter-citation"]'
      )
        .last()
        .contains(
          `STFC ISIS Neutron and Muon Source, https://doi.org/${response.body.concept.attributes.doi}`
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

describe('DLS - Session Data Publication Landing', () => {
  beforeEach(() => {
    cy.login({
      username: 'root',
      password: 'pw',
      mechanism: 'simple',
    });
    cy.seedSessionDataPublication(true).as('sessionDataPublication');
    cy.login(
      {
        username: 'Chris481',
        password: 'pw',
        mechanism: 'simple',
      },
      'Chris481'
    );
    cy.get<SessionMintResponse>('@sessionDataPublication')
      .its('body.data_publication_id')
      .then((id) => cy.visit(`/browse/dataPublication/${id}`));
  });

  afterEach(() => {
    cy.get<SessionMintResponse>('@sessionDataPublication').then((dp) => {
      cy.clearDataPublications([dp.body.data_publication_id]);
    });
    cy.clearDownloadCart();
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains(
      '72: Star enter wide nearly off. Base remember toward weight including call nearly political. Decision everyone lose scene feeling. State avoid firm understand teacher.'
    ).should('be.visible');
    cy.contains('Description not provided').should('be.visible');
    cy.contains('Thomas Chambers').should('be.visible');
    // dates
    cy.contains('Collected: 2003-11-19').should('be.visible');

    cy.window().then((win) => {
      const today = new Date(win.Date());
      cy.contains(`Issued: ${today.toISOString().split('T')[0]}`).should(
        'be.visible'
      );
    });
    // instrument
    cy.contains(
      'Respond between friend wide prevent six. Sea hard prepare production view it human. Major entire by activity increase sometimes present. Learn help maybe spring.'
    ).should('be.visible');

    cy.get<SessionMintResponse>('@sessionDataPublication').then((dp) => {
      cy.contains('a', dp.body.attributes.doi).should(
        'have.attr',
        'href',
        `https://doi.org/${dp.body.attributes.doi}`
      );
    });
  });

  it("should show the publish button and let's the PI publish once", () => {
    cy.contains('Publication Date').should('not.exist');
    cy.contains('Closed').should('be.visible');
    cy.contains('Open').should('not.exist');
    cy.get('[aria-label="Download Data Publication"]').should('be.disabled');

    cy.get('[aria-label="Publish"]').should('be.visible');
    cy.get('[aria-label="Publish"]').click();

    cy.contains('Publish Data Publication').should('be.visible');

    cy.contains('Accept & publish data publication').click();

    cy.contains('Publish was successful').should('be.visible');

    cy.get('[aria-label="Close publish data publication dialogue"]').click();

    // once published it should have a date and an abstract and shouldn't let you publish again
    cy.contains('Publication Date').should('be.visible');
    cy.contains('Open').should('be.visible');
    cy.contains('Closed').should('not.exist');
    cy.contains(
      'See somebody other new you assume parent so. Indeed your so offer box off. Total from happy nearly.'
    ).should('be.visible');
    cy.get('[aria-label="Publish"]').should('not.exist');
    cy.get('[aria-label="Download Data Publication"]').should(
      'not.be.disabled'
    );

    cy.get('#datapublication-content-tab').first().click();

    cy.contains('Datasets').click();
    cy.get('[aria-rowcount="2"]').should('exist');
  });

  it('should not show publish button if not the PI', () => {
    cy.login({
      username: 'root',
      password: 'pw',
      mechanism: 'simple',
    });

    cy.get<SessionMintResponse>('@sessionDataPublication')
      .its('body.data_publication_id')
      .then((id) => cy.visit(`/browse/dataPublication/${id}`));

    cy.contains(
      '72: Star enter wide nearly off. Base remember toward weight including call nearly political. Decision everyone lose scene feeling. State avoid firm understand teacher.'
    ).should('be.visible');

    cy.get('[aria-label="Publish"]').should('not.exist');
  });

  it('should be able to click tab to see content (but should only have an investigation when un-published)', () => {
    cy.get('#datapublication-content-tab').first().click();

    cy.contains('Investigations').click();

    cy.get('[aria-rowcount="1"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('a', '72');

    cy.contains('Datasets').click();

    cy.get('[aria-rowcount="0"]').should('exist');
  });
});
