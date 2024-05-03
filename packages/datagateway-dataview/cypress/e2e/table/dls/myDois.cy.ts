import { type MintResponse } from '../../landing/dls/dataPublication.cy';

describe('DLS - MyDOIs Table', () => {
  it('Should redirect when logged in anonymously', () => {
    cy.login();
    cy.visit('/my-dois/DLS');
    cy.url().should('include', '/login');
  });

  describe('Logged in tests', () => {
    beforeEach(() => {
      cy.intercept('**/datapublications?order=*').as('dataPublicationsOrder');

      cy.login(
        {
          username: 'Chris481',
          password: 'pw',
          mechanism: 'simple',
        },
        'Chris481'
      );
      cy.seedUserGeneratedDataPublication('Test DOI Title 1').as(
        'dataPublication1'
      );

      cy.seedUserGeneratedDataPublication('Test DOI Title 2').as(
        'dataPublication2'
      );

      cy.visit('/my-dois/DLS');
    });

    afterEach(() => {
      cy.get<MintResponse>('@dataPublication1').then((dp1) => {
        cy.get<MintResponse>('@dataPublication2').then((dp2) => {
          cy.clearUserGeneratedDataPublications([
            dp1.body.concept.data_publication,
            dp1.body.version.data_publication,
            dp2.body.concept.data_publication,
            dp2.body.version.data_publication,
          ]);
        });
      });
    });

    it('should load correctly', () => {
      cy.title().should('equal', 'DataGateway DataView');
      cy.get('#datagateway-dataview').should('be.visible');

      //Default sort
      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
    });

    it('should be able to click an data publication to see its landing page', () => {
      cy.contains('Test DOI Title 1').click();

      cy.get('@dataPublication1')
        .its('body.concept.data_publication')
        .then((id) =>
          cy.location('pathname').should('eq', `/browse/dataPublication/${id}`)
        );
    });

    it('should be able to sort by all sort directions on single and multiple columns', () => {
      //Revert the default sort
      cy.contains('[role="button"]', 'Publication Date')
        .as('dateSortButton')
        .click();
      cy.wait('@dataPublicationsOrder', { timeout: 10000 });

      // ascending order
      cy.contains('[role="button"]', 'Title').as('titleSortButton').click();
      cy.wait('@dataPublicationsOrder', { timeout: 10000 });

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
        'Test DOI Title 1'
      );

      // descending order
      cy.get('@titleSortButton').click();
      cy.wait('@dataPublicationsOrder', { timeout: 10000 });

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
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

      // multiple columns (shift click)
      cy.get('@dateSortButton').click();
      cy.wait('@dataPublicationsOrder', { timeout: 10000 });
      cy.get('@titleSortButton').click({ shiftKey: true });
      cy.wait('@dataPublicationsOrder', { timeout: 10000 });
      cy.get('@titleSortButton').click({ shiftKey: true });
      cy.wait('@dataPublicationsOrder', { timeout: 10000 });

      cy.get('[aria-rowindex="1"] [aria-colindex="1"]').contains(
        'Test DOI Title 2'
      );

      // should replace previous sort when clicked without shift
      cy.contains('[role="button"]', 'DOI').click();
      cy.get('[aria-sort="ascending"]').should('have.length', 1);
    });

    it('should be able to filter with text & date filters on multiple columns', () => {
      // test text filter
      // cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-label="Filter by Title"]').type('random text');

      cy.get('[aria-rowcount="0"]').should('exist');
      cy.get('[aria-label="Filter by Title"]').clear();
      cy.get('[aria-label="Filter by Title"]').type('1');

      // test date filter
      cy.get('[aria-rowcount="1"]').should('exist');

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
});
