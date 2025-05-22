describe('DLS - Visits Table', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('**/investigations?*').as('investigations');
    cy.intercept('**/investigations/count?*').as('investigationsCount');

    cy.visit('/browse/proposal/INVESTIGATION%201/investigation/').wait(
      ['@investigations', '@investigationsCount'],
      { timeout: 10000 }
    );
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    //Default sort
    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });

    cy.location('pathname').should(
      'eq',
      '/browse/proposal/INVESTIGATION%201/investigation/1/dataset'
    );
  });

  // Lazy loading can't be tested on this table at the moment since there is only 1 investigation.
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  // only 1 visit so no point testing sort
  it.skip('should be able to sort by all sort directions on single and multiple columns', () => {
    //Revert the default sort
    cy.contains('[role="button"]', 'Start Date').as('dateSortButton').click();

    // ascending order
    cy.contains('[role="button"]', 'Visit ID').as('visitIdSortButton').click();

    cy.get('[aria-sort="ascending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('70');

    // descending order
    cy.get('@visitIdSortButton').click();

    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
      'not.have.css',
      'opacity',
      '0'
    );
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('70');

    // no order
    cy.get('@visitIdSortButton').click();
    cy.get('[aria-sort="ascending"]').should('not.exist');
    cy.get('[aria-sort="descending"]').should('not.exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
      'have.css',
      'opacity',
      '0'
    );
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('70');

    // multiple columns
    cy.get('@dateSortButton').click();
    cy.get('@visitIdSortButton').click();

    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('70');
  });

  it('should be able to filter with both text & date filters on multiple columns', () => {
    // test text filter
    cy.get('[aria-label="Filter by Visit ID"]').first().type('70');

    cy.wait('@investigations');

    cy.get('[aria-rowcount="1"]').should('exist');
    cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('70');

    // test date filter
    cy.get('input[aria-label="Start Date filter to"]')
      .parent()
      .find('button')
      .click();

    cy.get('.MuiPickersDay-root[type="button"]').first().click();

    cy.wait('@investigations');
    cy.get('[aria-rowcount="1"]').should('exist');

    const date = new Date();
    date.setDate(1);

    cy.get('input[id="Start Date filter to"]').should(
      'have.value',
      date.toISOString().slice(0, 10)
    );

    cy.get('input[id="Start Date filter from"]').type('2001-01-01');

    cy.get('[aria-rowcount="0"]').should('exist');
  });

  it('should be able to view details & also able to hide the panel', () => {
    cy.intercept('**/queue/allowed?*').as('queueAllowed');
    cy.get('[aria-label="Show details"]').first().click();

    cy.get('#details-panel').should('be.visible');
    cy.get('[aria-label="Hide details"]').should('exist');

    // verify /queue/allowed returned successfully
    // need to check this explicitly because if this errored the button also wouldn't appear!
    // but we want to check it's not throwing an error as well
    cy.wait('@queueAllowed').its('response.statusCode').should('eq', 200);
    // logged in as anon user so should not be able to see visit restore button
    cy.contains('button', 'Queue visit for download').should('not.exist');

    cy.get('[aria-controls="visit-users-panel"]').click();
    cy.get('#visit-users-panel').should('not.have.attr', 'hidden');
    cy.get('#details-panel').contains('Colleen Heath').should('be.visible');

    cy.get('[aria-controls="visit-samples-panel"]').click();
    cy.get('#visit-samples-panel').should('not.have.attr', 'hidden');
    cy.get('#details-panel').contains('SAMPLE 1').should('be.visible');

    cy.get('[aria-controls="visit-publications-panel"]').click();
    cy.get('#visit-publications-panel').should('not.have.attr', 'hidden');
    cy.get('#details-panel').contains(
      'Simple notice since view check over through there. Hotel provide available a air avoid beautiful technology.'
    );

    cy.get('[aria-label="Hide details"]').first().click();

    cy.get('#details-panel').should('not.exist');
    cy.get('[aria-label="Hide details"]').should('not.exist');
  });
});

describe('DLS - visit restore button', () => {
  beforeEach(() => {
    cy.login({ username: 'root', password: 'pw', mechanism: 'simple' });
    cy.intercept('**/investigations?*').as('investigations');
    cy.intercept('**/investigations/count?*').as('investigationsCount');

    cy.visit('/browse/proposal/INVESTIGATION%201/investigation/').wait(
      ['@investigations', '@investigationsCount'],
      { timeout: 10000 }
    );
  });

  it('authenticated user should be able to see the button', () => {
    cy.get('[aria-label="Show details"]').first().click();

    cy.get('#details-panel').should('be.visible');
    cy.contains('button', 'Queue visit for download').should('exist');
  });

  it('should be able to submit a download', () => {
    cy.get('[aria-label="Show details"]').first().click();

    cy.contains('button', 'Queue visit for download').click();

    cy.get('[aria-label="Download confirmation dialog"]').should('exist');

    cy.contains('button', 'Download').click();

    cy.contains(
      '#download-confirmation-success',
      'Successfully submitted download request'
    ).should('exist');

    cy.contains('#confirm-success-download-name', 'LILS_70').should('exist');
    cy.contains('#confirm-success-access-method', 'HTTPS').should('exist');
  });

  it('should be able to submit a download with custom values', () => {
    cy.get('[aria-label="Show details"]').first().click();

    cy.contains('button', 'Queue visit for download').click();

    cy.get('[aria-label="Download confirmation dialog"]').should('exist');

    // Set download name.
    cy.get('#confirm-download-name').type('test-file-name');

    // set email
    cy.get('#confirm-download-email').type('email.address@example.com');

    // set transport
    cy.get('#confirm-access-method').select('Globus');

    cy.contains('button', 'Download').click();

    cy.contains(
      '#download-confirmation-success',
      'Successfully submitted download request'
    ).should('exist');

    cy.contains('#confirm-success-download-name', 'test-file-name').should(
      'exist'
    );
    cy.contains('#confirm-success-access-method', 'GLOBUS').should('exist');
    cy.contains(
      '#confirm-success-email-address',
      'email.address@example.com'
    ).should('exist');
  });
});
