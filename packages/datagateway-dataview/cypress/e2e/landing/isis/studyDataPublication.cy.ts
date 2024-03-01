describe('ISIS - Study Data Publication Landing', () => {
  beforeEach(() => {
    cy.intercept(
      /\/datapublications\?.*where=%7B%22type\.name%22%3A%7B%22eq%22%3A%22investigation%22%7D%7D.*/,
      (req) => {
        // delete type = investigation requirement
        const [url, search] = req.url.split('?');
        const params = new URLSearchParams(search);
        // params.delete with value is still a new standard, so use workaround for now until browser compat catches up
        // params.delete('where', '{"type.name":{"eq":"investigation"}}');
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
        removeValue(params, 'where', '{"type.name":{"eq":"investigation"}}');
        req.url = `${url}?${params.toString()}`;

        req.continue((res) => {
          // remove the "study" datapublication i.e. the one whose ID is in the URL
          const i = res.body.findIndex((dp) => dp.id === 57);
          if (i !== -1) res.body.splice(i, 1);
        });
      }
    ).as('getDataPublications');

    cy.login();
    cy.visit('/browseDataPublications/instrument/13/dataPublication/57');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
    cy.contains('Dream he television').should('be.visible');
    cy.get('[data-testid="isis-dataPublication-landing"]')
      .contains('Because fine have business')
      .should('be.visible');

    cy.get('[data-testid="isis-dataPublication-landing"]')
      .contains('a', '1-64379-596-1')
      .should('have.attr', 'href', 'https://doi.org/1-64379-596-1');

    cy.get('[data-testid="landing-datapublication-part-label"').should(
      'have.length',
      2
    );
  });

  it('should be able to click tab to see investigations', () => {
    cy.get('#datapublication-investigations-tab')
      .first()
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseDataPublications/instrument/13/dataPublication/57/investigation'
    );
  });

  it('should be able to click a specific investigation', () => {
    cy.get('[data-testid="landing-datapublication-part-label"')
      .children()
      .first()
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browseDataPublications/instrument/13/dataPublication/57/investigation/46'
    );
  });

  it('should load correctly when investigation missing', () => {
    cy.intercept(
      /\/datapublications\?.*where=%7B%22type\.name%22%3A%7B%22eq%22%3A%22investigation%22%7D%7D.*/,
      []
    );

    cy.contains('1-64379-596-1').should('be.visible');
    cy.get('[data-testid="landing-datapublication-part-label"').should(
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
    cy.get('[data-testid="landing-dataPublication-pid-link"]')
      .first()
      .trigger('mouseover');
    cy.get('[role="tooltip"]').should('exist');

    cy.get('body').type('{esc}');

    cy.get('[data-testid="landing-dataPublication-pid-link"]')
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
