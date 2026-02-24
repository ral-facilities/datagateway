import {
  SessionMintResponse,
  type UserDefinedMintResponse,
} from '../../landing/dls/dataPublication.cy';

describe('DLS - All DOIs Table', () => {
  const store = {};

  before(() => {
    cy.login({ username: 'root', password: 'pw', mechanism: 'simple' });
    cy.seedSessionDataPublication(false).as('sessionDataPublication');

    cy.login(
      {
        username: 'Chris481',
        password: 'pw',
        mechanism: 'simple',
      },
      'Chris481'
    );

    // can seed the user defined DP in before rather than beforeEach as myDOI page is read-only
    cy.seedUserGeneratedDataPublication('Test DOI Title 1').as(
      'dataPublication1'
    );

    cy.seedUserGeneratedDataPublication('Test DOI Title 2').as(
      'dataPublication2'
    );
    cy.dumpAliases(store);
  });

  beforeEach(() => {
    cy.restoreAliases(store);

    cy.login();

    cy.visit('/browse/datapublication');
  });

  after(() => {
    cy.restoreAliases(store);

    cy.login({ username: 'root', password: 'pw', mechanism: 'simple' });
    cy.get<UserDefinedMintResponse>('@dataPublication1').then((dp1) => {
      cy.get<UserDefinedMintResponse>('@dataPublication2').then((dp2) => {
        cy.get<SessionMintResponse>('@sessionDataPublication').then((dp3) => {
          cy.clearDataPublications([
            dp1.body.concept.data_publication_id,
            dp1.body.version.data_publication_id,
            dp2.body.concept.data_publication_id,
            dp2.body.version.data_publication_id,
            dp3.body.data_publication_id,
          ]);
        });
      });
    });
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');

    //Default sort
    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');

    cy.contains('Session DOI').should('have.attr', 'aria-pressed', 'true');
  });

  it('should be able to click a data publication to see its landing page', () => {
    cy.contains('72: Star enter wide nearly off.').click({ force: true });

    cy.get('@sessionDataPublication')
      .its('body.data_publication_id')
      .then((id) =>
        cy.location('pathname').should('eq', `/browse/dataPublication/${id}`)
      );
  });

  it('should be able to sort by all sort directions on single and multiple columns', () => {
    cy.contains('User-created DOI').click();

    //Revert the default sort
    cy.contains('[role="button"]', 'Publication Date')
      .as('dateSortButton')
      .click();

    // ascending order
    cy.contains('[role="button"]', 'Title').as('titleSortButton').click();

    cy.get('[aria-sort="ascending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
      'Test DOI Title 1'
    );

    // descending order
    cy.get('@titleSortButton').click();

    cy.get('[aria-sort="descending"]').should('exist');
    cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
      'Test DOI Title 2'
    );

    // no order
    cy.get('@titleSortButton').click();

    cy.get('[aria-sort="ascending"]').should('not.exist');
    cy.get('[aria-sort="descending"]').should('not.exist');
    cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.exist');

    cy.get('[data-testid="SortIcon"]').should('have.length', 3);
    cy.get('[data-testid="ArrowUpwardIcon"]').should('not.exist');

    cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
      'Test DOI Title 1'
    );

    // can't test multiple sort as no fields are the same that a shift-click would re-sort
  });

  it('should be able to filter with text & date filters on multiple columns', () => {
    cy.contains('User-created DOI').click();

    // test text filter
    cy.get('[aria-label="Filter by Title"]').type('random text', {
      delay: 0,
    });

    cy.get('[role="progressbar"]').should('exist');
    cy.get('[role="progressbar"]').should('not.exist');
    cy.get('[aria-rowcount="0"]').should('exist');

    cy.get('[aria-label="Filter by Title"]').clear();

    cy.get('[aria-rowcount="0"]').should('not.exist');
    cy.get('[aria-label="Filter by Title"]').type('1');

    cy.get('[aria-rowcount="1"]').should('exist');

    // test date filter

    const date = new Date();

    cy.get('input[aria-label="Publication Date filter from"]').type(
      date.toISOString().slice(0, 10)
    );

    cy.get('[aria-rowcount="1"]').should('exist');

    cy.get('input[aria-label="Publication Date filter from"]').type(
      '{ctrl}a{backspace}'
    );

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    cy.get('input[aria-label="Publication Date filter from"]').type(
      futureDate.toISOString().slice(0, 10)
    );

    cy.get('[aria-rowcount="0"]').should('exist');
  });
});
