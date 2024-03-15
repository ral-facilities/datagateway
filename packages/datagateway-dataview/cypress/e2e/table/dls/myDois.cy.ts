describe('DLS - MyDOIs Table', () => {
  it('Should redirect when logged in anonymously', () => {
    cy.login();
    cy.visit('/my-dois/DLS');
    cy.url().should('include', '/login');
  });

  describe('Logged in tests', () => {
    beforeEach(() => {
      cy.intercept(
        /\/datapublications\?.*where=%7B%22users\.contributorType%22%3A%7B%22eq%22%3A%22Minter%22%7D%7D.*where=%7B%22relatedItems\.relationType%22%3A%7B%22eq%22%3A%22HasVersion%22%7D%7D.*/,
        (req) => {
          // delete type = investigation requirement
          const [url, search] = req.url.split('?');
          const params = new URLSearchParams(search);
          // params.delete with value is still a new standard, so use workaround for now until browser compat catches up
          // params.delete('where', '{"users.contributorType":{"eq":"Minter"}}');
          // params.delete('where', '{"relatedItems.relationType":{"eq":"HasVersion"}}');
          const removeValue = (
            params: URLSearchParams,
            key: string,
            valueToRemove: string
          ): URLSearchParams => {
            const values = params.getAll(key);
            if (values.length) {
              params.delete(key);
              for (const value of values) {
                if (value !== valueToRemove) {
                  params.append(key, value);
                }
              }
            }
            return params;
          };
          removeValue(
            params,
            'where',
            '{"relatedItems.relationType":{"eq":"HasVersion"}}'
          );
          removeValue(
            params,
            'where',
            '{"users.contributorType":{"eq":"Minter"}}'
          );
          params.append(
            'where',
            JSON.stringify({
              'users.contributorType': {
                eq: 'ProjectLeader',
              },
            })
          );
          req.url = `${url}?${params.toString()}`;

          req.continue();
        }
      ).as('getDataPublications');
      cy.login(
        {
          username: 'root',
          password: 'pw',
          mechanism: 'simple',
        },
        'Chris481'
      );
      cy.visit('/my-dois/DLS').wait('@getDataPublications');
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

      cy.location('pathname').should('eq', '/browse/dataPublication/14');
    });

    // can't test sorting as there's only 1 table item

    it('should be able to filter with text & date filters on multiple columns', () => {
      // test text filter
      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-label="Filter by Title"]').type('random text');

      cy.get('[aria-rowcount="0"]').should('exist');
      cy.get('[aria-label="Filter by Title"]').clear();
      cy.get('[aria-label="Filter by Title"]').type('Officer');

      // test date filter
      cy.get('[aria-rowcount="1"]').should('exist');

      const date = new Date();

      cy.get('input[aria-label="Publication Date filter to"]').type(
        date.toISOString().slice(0, 10)
      );

      cy.get('[aria-rowcount="1"]').should('exist');

      cy.get('input[id="Publication Date filter from"]').type('2019-01-01');

      cy.get('[aria-rowcount="0"]').should('exist');
    });
  });
});
