export type SessionMintResponse = Cypress.Response<{
  data_publication_id: string;
  attributes: { doi: string };
}>;

describe('DOI Generation form', () => {
  const store = {};
  before(() => {
    cy.login({ username: 'root', password: 'pw', mechanism: 'simple' });
    cy.seedSessionDataPublication(false).as('sessionDataPublication');
    cy.dumpAliases(store);
  });

  beforeEach(() => {
    cy.restoreAliases(store);

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
    cy.restoreAliases(store);
    cy.login({ username: 'root', password: 'pw', mechanism: 'simple' });
    cy.clearDataPublications();
    cy.get<SessionMintResponse>('@sessionDataPublication').then((dp) => {
      cy.clearDataPublicationsByIds([dp.body.data_publication_id]);
    });
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
      cy.contains('h2', 'Generate DOI').should('be.visible');
      cy.contains('DOI Title').parent().find('input').type('Test title');
      cy.contains('DOI Description')
        .parent()
        .find('textarea')
        .first()
        .type('Test description');

      // add a subject
      cy.findByRole('combobox', { name: 'Subjects' }).type('subject1{enter}');

      // add a technique
      cy.findByRole('button', { name: 'Add technique' }).click();
      cy.findByRole('combobox', { name: 'Select technique' }).type('x-ray');
      cy.findByRole('option', {
        name: 'x-ray standing wave (XSW)',
        timeout: 10_000,
      }).click();
      cy.findByRole('cell', {
        name: 'borrmann effect',
        timeout: 10_000,
      }).click();
      cy.findByRole('button', { name: 'Confirm' }).click();

      cy.contains('button', 'Generate DOI').click();

      // expect confirmation page

      cy.contains('Please review the metadata', { timeout: 10000 }).should(
        'be.visible'
      );
      cy.contains('h2', 'Generate DOI').should('not.exist');

      // check it correctly shows user defined metadata
      cy.contains('DOI Description: Test description').should('be.visible');
      // check it correctly shows metadata that the API has added
      cy.contains('Relationship: HasPart').should('be.visible');

      cy.contains('button', 'Generate DOI').click();

      cy.contains('Mint Confirmation').should('be.visible');
      cy.contains('Mint was successful', { timeout: 10000 }).should(
        'be.visible'
      );
      cy.contains('View Data Publication').click();

      cy.url().should('match', /\/browse\/dataPublication\/[0-9]+$/);
    });

    it('should let the user click back on the confirmation page', () => {
      cy.contains('h2', 'Generate DOI').should('be.visible');
      cy.contains('DOI Title').parent().find('input').type('Test title');
      cy.contains('DOI Description')
        .parent()
        .find('textarea')
        .first()
        .type('Test description');

      // add a subject
      cy.findByRole('combobox', { name: 'Subjects' }).type('subject1{enter}');

      // add a technique
      cy.findByRole('button', { name: 'Add technique' }).click();
      cy.findByRole('combobox', { name: 'Select technique' }).type('x-ray');
      cy.findByRole('option', {
        name: 'x-ray standing wave (XSW)',
        timeout: 10_000,
      }).click();
      cy.findByRole('cell', {
        name: 'x-ray standing wave (XSW)',
        timeout: 10_000,
      }).click();
      cy.findByRole('button', { name: 'Confirm' }).click();

      cy.contains('button', 'Generate DOI').click();

      // expect confirmation page

      cy.contains('Please review the metadata', { timeout: 10000 }).should(
        'be.visible'
      );
      cy.contains('h2', 'Generate DOI').should('not.exist');

      cy.contains('button', 'Go back').click();

      cy.contains('h2', 'Generate DOI', { timeout: 10000 }).should(
        'be.visible'
      );
      cy.contains('Please review the metadata').should('not.exist');
    });

    it('should let user add and remove subjects', () => {
      cy.contains('DOI Title').parent().find('input').type('Test title');
      cy.contains('DOI Description')
        .parent()
        .find('textarea')
        .first()
        .type('Test description');

      // add a technique
      cy.findByRole('button', { name: 'Add technique' }).click();
      cy.findByRole('combobox', { name: 'Select technique' }).type('x-ray');
      cy.findByRole('option', {
        name: 'x-ray standing wave (XSW)',
        timeout: 10_000,
      }).click();
      cy.findByRole('cell', {
        name: 'borrmann effect',
        timeout: 10_000,
      }).click();
      cy.findByRole('button', { name: 'Confirm' }).click();

      // add a subject
      cy.findByRole('combobox', { name: 'Subjects' }).type('subject1{enter}');
      cy.findByRole('combobox', { name: 'Subjects' }).type('subject2{enter}');
      cy.findByRole('combobox', { name: 'Subjects' }).type('subject3{enter}');

      cy.findByRole('button', { name: 'subject1' }).should('be.visible');
      cy.findByRole('button', { name: 'subject2' }).should('be.visible');
      cy.findByRole('button', { name: 'subject3' }).should('be.visible');

      cy.findByRole('combobox', { name: 'Subjects' }).click();
      cy.findByRole('combobox', { name: 'Subjects' }).type(
        '{leftArrow}{leftArrow}{del}'
      );

      cy.findByRole('button', { name: 'subject2' }).should('not.exist');

      // check that subject info displays correctly in confirmation page
      cy.contains('button', 'Generate DOI').click();

      cy.contains('Subject: subject1').should('be.visible');
      cy.contains('Subject: subject3').should('be.visible');
      cy.contains('Subject: subject2').should('not.exist');

      cy.contains('button', 'Generate DOI').click();

      cy.contains('Mint was successful', { timeout: 10000 }).should(
        'be.visible'
      );
    });

    it('should let user add and remove techniques', () => {
      cy.contains('DOI Title').parent().find('input').type('Test title');
      cy.contains('DOI Description')
        .parent()
        .find('textarea')
        .first()
        .type('Test description');

      // add a subject
      cy.findByRole('combobox', { name: 'Subjects' }).type('subject1{enter}');

      // add a technique
      cy.findByRole('button', { name: 'Add technique' }).click();
      cy.findByRole('combobox', { name: 'Select technique' }).type('x-ray');
      cy.findByRole('option', {
        name: 'x-ray standing wave (XSW)',
        timeout: 10_000,
      }).click();
      cy.findByRole('cell', {
        name: 'borrmann effect',
        timeout: 10_000,
      }).click();
      cy.findByRole('button', { name: 'Confirm' }).click();

      cy.findByRole('button', { name: 'Add technique' }).click();
      cy.findByRole('combobox', { name: 'Select technique' }).type('x-ray');
      cy.findByRole('option', {
        name: 'x-ray standing wave (XSW)',
        timeout: 10_000,
      }).click();
      cy.findByRole('cell', {
        name: 'x-ray standing wave (XSW)',
        timeout: 10_000,
      }).click();
      cy.findByRole('button', { name: 'Confirm' }).click();

      cy.findByRole('button', { name: 'Add technique' }).click();
      cy.findByRole('combobox', { name: 'Select technique' }).type('x-ray');
      cy.findByRole('option', {
        name: 'x-ray imaging',
        timeout: 10_000,
      }).click();
      cy.findByRole('cell', {
        name: 'x-ray tomography (CT scan)',
        timeout: 10_000,
      }).click();
      cy.findByRole('button', { name: 'Confirm' }).click();

      cy.findByRole('button', { name: 'borrmann effect' }).should('be.visible');
      cy.findByRole('button', { name: 'x-ray standing wave (XSW)' }).should(
        'be.visible'
      );
      cy.findByRole('button', { name: 'x-ray tomography (CT scan)' }).should(
        'be.visible'
      );

      cy.findByRole('button', { name: 'borrmann effect' })
        .findByTestId('CancelIcon')
        .click();
      cy.findByRole('button', { name: 'borrmann effect' }).should('not.exist');

      // check that technique info displays correctly in confirmation page
      cy.contains('button', 'Generate DOI').click();

      cy.contains('Subject: x-ray standing wave').should('be.visible');
      cy.contains(
        'Value URI: http://purl.org/pan-science/PaNET/PaNET01173'
      ).should('be.visible');
      cy.contains('Subject: x-ray tomography').should('be.visible');
      cy.contains(
        'Value URI: http://purl.org/pan-science/PaNET/PaNET01207'
      ).should('be.visible');
      cy.contains('Subject: borrmann effect').should('not.exist');

      cy.contains('button', 'Generate DOI').click();

      cy.contains('Mint was successful', { timeout: 10000 }).should(
        'be.visible'
      );
    });

    it('should let user add and remove creators', () => {
      cy.contains('DOI Title').parent().find('input').type('Test title');
      cy.contains('DOI Description')
        .parent()
        .find('textarea')
        .first()
        .type('Test description');
      // add a subject
      cy.findByRole('combobox', { name: 'Subjects' }).type('subject1{enter}');

      // add a technique
      cy.findByRole('button', { name: 'Add technique' }).click();
      cy.findByRole('combobox', { name: 'Select technique' }).type('x-ray');
      cy.findByRole('option', {
        name: 'x-ray standing wave (XSW)',
        timeout: 10_000,
      }).click();
      cy.findByRole('cell', {
        name: 'borrmann effect',
        timeout: 10_000,
      }).click();
      cy.findByRole('button', { name: 'Confirm' }).click();

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
      // add a subject
      cy.findByRole('combobox', { name: 'Subjects' }).type('subject1{enter}');

      // add a technique
      cy.findByRole('button', { name: 'Add technique' }).click();
      cy.findByRole('combobox', { name: 'Select technique' }).type('x-ray');
      cy.findByRole('option', {
        name: 'x-ray standing wave (XSW)',
        timeout: 10_000,
      }).click();
      cy.findByRole('cell', {
        name: 'borrmann effect',
        timeout: 10_000,
      }).click();
      cy.findByRole('button', { name: 'Confirm' }).click();

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
      cy.contains('Contributor Type: DataCollector', { timeout: 10000 }).should(
        'be.visible'
      );

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
      // add a subject
      cy.findByRole('combobox', { name: 'Subjects' }).type('subject1{enter}');

      // add a technique
      cy.findByRole('button', { name: 'Add technique' }).click();
      cy.findByRole('combobox', { name: 'Select technique' }).type('x-ray');
      cy.findByRole('option', {
        name: 'x-ray standing wave (XSW)',
        timeout: 10_000,
      }).click();
      cy.findByRole('cell', {
        name: 'borrmann effect',
        timeout: 10_000,
      }).click();
      cy.findByRole('button', { name: 'Confirm' }).click();

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
      cy.contains(
        'No record found: No ICAT User found with name invalid'
      ).should('be.visible');

      cy.contains('button', 'Generate DOI').should('not.be.disabled');
    });

    it('should let user add a related DOI and select their relation & resource type', () => {
      cy.contains('DOI Title').parent().find('input').type('Test title');
      cy.contains('DOI Description')
        .parent()
        .find('textarea')
        .first()
        .type('Test description');
      // add a subject
      cy.findByRole('combobox', { name: 'Subjects' }).type('subject1{enter}');

      // add a technique
      cy.findByRole('button', { name: 'Add technique' }).click();
      cy.findByRole('combobox', { name: 'Select technique' }).type('x-ray');
      cy.findByRole('option', {
        name: 'x-ray standing wave (XSW)',
        timeout: 10_000,
      }).click();
      cy.findByRole('cell', {
        name: 'borrmann effect',
        timeout: 10_000,
      }).click();
      cy.findByRole('button', { name: 'Confirm' }).click();

      // wait for users to load
      cy.contains('button', 'Generate DOI').should('not.be.disabled');

      // DOI from https://support.datacite.org/docs/testing-guide
      cy.contains('Identifier (e.g. DOI, URL)')
        .parent()
        .find('input')
        .type('10.17596/w76y-4s92');
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

      cy.contains('div', 'Identifier: 10.17596/w76y-4s92', { timeout: 10000 })
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

      cy.contains('Mint was successful', { timeout: 10000 }).should(
        'be.visible'
      );
    });

    it('should let user add a non-DOI related identifier and select their relation, identifier & resource type', () => {
      cy.contains('DOI Title').parent().find('input').type('Test title');
      cy.contains('DOI Description')
        .parent()
        .find('textarea')
        .first()
        .type('Test description');
      // add a subject
      cy.findByRole('combobox', { name: 'Subjects' }).type('subject1{enter}');

      // add a technique
      cy.findByRole('button', { name: 'Add technique' }).click();
      cy.findByRole('combobox', { name: 'Select technique' }).type('x-ray');
      cy.findByRole('option', {
        name: 'x-ray standing wave (XSW)',
        timeout: 10_000,
      }).click();
      cy.findByRole('cell', {
        name: 'borrmann effect',
        timeout: 10_000,
      }).click();
      cy.findByRole('button', { name: 'Confirm' }).click();

      // wait for users to load
      cy.contains('button', 'Generate DOI').should('not.be.disabled');

      // DOI from https://support.datacite.org/docs/testing-guide
      cy.contains('Identifier (e.g. DOI, URL)')
        .parent()
        .find('input')
        .type('my.identifier');
      cy.contains('button', 'Add Other').click();

      // shouldn't let users submit DOIs without selecting a relation or resource type
      cy.contains('button', 'Generate DOI').should('be.disabled');

      // expect it defaults to a URL
      cy.contains('a', 'my.identifier');
      cy.contains('label', 'Identifier Type').parent().click();

      cy.contains('ISBN').click();

      cy.contains('label', 'Resource Type').parent().click();

      cy.contains('ComputationalNotebook').click();

      // shouldn't let users submit DOIs without selecting a relation type
      cy.contains('button', 'Generate DOI').should('be.disabled');

      cy.contains('label', 'Relationship').parent().click();

      cy.contains('IsSupplementedBy').click();

      // check that related DOIs info doesn't break the API
      cy.contains('button', 'Generate DOI').click();

      cy.contains('div', 'Identifier: my.identifier', { timeout: 10000 })
        .as('relatedItem')
        .should('exist');
      cy.get('@relatedItem')
        .parent()
        .contains('Relationship: IsSupplementedBy')
        .should('exist');
      cy.get('@relatedItem')
        .parent()
        .contains('Resource Type: ComputationalNotebook')
        .should('exist');
      cy.get('@relatedItem').parent().contains('Type: ISBN').should('exist');

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
