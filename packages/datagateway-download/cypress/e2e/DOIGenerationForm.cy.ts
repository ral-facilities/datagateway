describe('DOI Generation form', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/topcat/user/cart/**').as('fetchCart');
    cy.intercept('GET', '**/topcat/user/downloads**').as('fetchDownloads');
    cy.login(
      { username: 'Chris481', password: 'pw', mechanism: 'simple' },
      'Chris481'
    );
    cy.clearDownloadCart();

    cy.seedMintCart().then(() => {
      cy.visit('/download').wait('@fetchCart');
    });
  });

  afterEach(() => {
    cy.clearDownloadCart();
  });

  // tidy up the data publications table
  after(() => {
    cy.clearDataPublications();
  });

  it('should be able to mint a mintable cart', () => {
    cy.get('[aria-label="Calculating"]', { timeout: 20000 }).should(
      'not.exist'
    );

    cy.contains('Generate DOI').click();
    cy.url().should('include', '/download/mint');

    cy.contains('button', 'Accept').should('be.visible');
  });

  it('should not be able to try and mint a cart directly', () => {
    cy.visit('/download/mint');

    cy.url().should('match', /\/download$/);
  });

  describe('Form tests', () => {
    beforeEach(() => {
      cy.get('[aria-label="Calculating"]', { timeout: 20000 }).should(
        'not.exist'
      );

      cy.contains('Generate DOI').click();
      cy.contains('button', 'Accept').click();
    });

    it('should not let user generate DOI when fields are still unfilled', () => {
      cy.contains('button', 'Generate DOI').should('be.disabled');
    });

    it('should let user generate DOI when fields are filled', () => {
      cy.contains('DOI Title').parent().find('input').type('Test title');
      cy.contains('DOI Description')
        .parent()
        .find('textarea')
        .first()
        .type('Test description');

      cy.contains('button', 'Generate DOI').click();

      cy.contains('Mint Confirmation').should('be.visible');
      cy.contains('Mint was successful', { timeout: 10000 }).should(
        'be.visible'
      );
      cy.contains('View Data Publication').click();

      cy.url().should('match', /\/browse\/dataPublication\/[0-9]+$/);
    });

    it('should let user add and remove creators', () => {
      cy.contains('DOI Title').parent().find('input').type('Test title');
      cy.contains('DOI Description')
        .parent()
        .find('textarea')
        .first()
        .type('Test description');

      // wait for users to load
      cy.contains('button', 'Generate DOI').should('not.be.disabled');

      cy.contains('Username').parent().find('input').type('Michael222');
      cy.contains('button', 'Add Creator').click();

      // check we can't delete "ourselves"
      cy.contains('Thomas')
        .parent()
        .contains('button', 'Delete')
        .should('be.disabled');

      cy.contains('Randy').should('be.visible');
      cy.contains('Randy').parent().contains('button', 'Delete').click();
      cy.contains('Randy').should('not.exist');

      cy.contains('button', 'Generate DOI').should('not.be.disabled');
    });

    it('should let user add contributors and select their contributor type', () => {
      cy.contains('DOI Title').parent().find('input').type('Test title');
      cy.contains('DOI Description')
        .parent()
        .find('textarea')
        .first()
        .type('Test description');

      // wait for users to load
      cy.contains('button', 'Generate DOI').should('not.be.disabled');

      cy.contains('Username').parent().find('input').type('Michael222');
      cy.contains('button', 'Add Contributor').click();

      // shouldn't let users submit DOIs without selecting a contributor type
      cy.contains('button', 'Generate DOI').should('be.disabled');

      cy.contains('label', 'Contributor Type').parent().click();

      cy.contains('DataCollector').click();

      // check that contributor info doesn't break the API
      cy.contains('button', 'Generate DOI').click();

      cy.contains('Mint was successful', { timeout: 10000 }).should(
        'be.visible'
      );
    });

    it('should not let user add invalid/duplicate Data Publication users', () => {
      cy.contains('DOI Title').parent().find('input').type('Test title');
      cy.contains('DOI Description')
        .parent()
        .find('textarea')
        .first()
        .type('Test description');

      // wait for users to load
      cy.contains('button', 'Generate DOI').should('not.be.disabled');

      cy.get('table[aria-labelledby="creators-label"] tbody tr').should(
        'have.length',
        1
      );

      cy.contains('Username').parent().find('input').type('Chris481');
      cy.contains('button', 'Add Creator').click();

      cy.get('table[aria-labelledby="creators-label"] tbody tr').should(
        'have.length',
        1
      );
      cy.contains('Cannot add duplicate user').should('be.visible');

      cy.contains('Username').parent().find('input').type('invalid');
      cy.contains('button', 'Add Creator').click();
      cy.get('table[aria-labelledby="creators-label"] tbody tr').should(
        'have.length',
        1
      );
      cy.contains("No record found: name='Invalid' in User").should(
        'be.visible'
      );

      cy.contains('button', 'Generate DOI').should('not.be.disabled');
    });

    it('should let user add related DOIs and select their relation & resource type', () => {
      cy.contains('DOI Title').parent().find('input').type('Test title');
      cy.contains('DOI Description')
        .parent()
        .find('textarea')
        .first()
        .type('Test description');

      // wait for users to load
      cy.contains('button', 'Generate DOI').should('not.be.disabled');

      // DOI from https://support.datacite.org/docs/testing-guide
      cy.contains(/^DOI$/).parent().find('input').type('10.17596/w76y-4s92');
      cy.contains('button', 'Add DOI').click();

      // shouldn't let users submit DOIs without selecting a relation or resource type
      cy.contains('button', 'Generate DOI').should('be.disabled');

      cy.contains('label', 'Resource Type').parent().click();

      cy.contains('Journal').click();

      // shouldn't let users submit DOIs without selecting a relation type
      cy.contains('button', 'Generate DOI').should('be.disabled');

      cy.contains('label', 'Relationship').parent().click();

      cy.contains('IsCitedBy').click();

      // check that related DOIs info doesn't break the API
      cy.contains('button', 'Generate DOI').click();

      cy.contains('Mint was successful', { timeout: 10000 }).should(
        'be.visible'
      );
    });

    it('should let user see their current cart items', () => {
      cy.contains('DATASET 75').should('be.visible');
      cy.get('table[aria-label="cart dataset table"] tbody tr').should(
        'have.length',
        1
      );

      cy.contains('button', 'Datafiles').click();

      cy.contains('Datafile 14').should('be.visible');
      cy.get('table[aria-label="cart datafile table"] tbody tr').should(
        'have.length',
        4
      );
    });
  });
});
