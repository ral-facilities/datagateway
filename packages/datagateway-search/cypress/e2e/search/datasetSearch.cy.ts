describe('Dataset search tab', () => {
  let facilityName: string;

  before(() => {
    cy.readFile('server/e2e-settings.json').then((settings) => {
      if (settings.facilityName) facilityName = settings.facilityName;
    });
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/search/data/');
    cy.intercept('**/search/documents*', {
      fixture: 'datasetSearchResults.json',
    });
    cy.intercept('**/datasets/count*', {
      body: 1,
    });
    cy.intercept('**/datafiles/count*', {
      body: 1,
    });
    cy.intercept(`**/topcat/user/cart/${facilityName}*`, {
      statusCode: 200,
      body: {
        cartItems: [],
      },
    });

    // only the dataset tab is tested here, so we want to hide investigation & datafile tabs
    // open search type dropdown menu
    cy.findByRole('button', { name: 'Types (3)' }).click();
    // uncheck investigation
    cy.findByRole('listbox').within(() => {
      cy.findByRole('checkbox', { name: 'Investigation checkbox' }).click();
      cy.findByRole('checkbox', { name: 'Datafile checkbox' }).click();
    });
    // close the dropdown menu
    cy.get('body').type('{esc}');
  });

  it('should perform search query and show search results correctly', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('carbon');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    cy.findByRole('tab', { name: 'Dataset' }).within(() => {
      cy.findByText('4').should('exist');
    });

    // 5 rows, 4 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 5);

    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();

    cy.findAllByLabelText('Type filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add experiment_raw filter' })
          .should('exist')
          .within(() => {
            cy.findByText('252').should('exist');
          });
      });
  });

  it('should be able to open the details panel of a specific row', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('carbon');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    // 5 rows, 4 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 5);

    cy.findAllByRole('row')
      .eq(1)
      .within(() => {
        cy.findByRole('button', { name: 'Show details' }).click();
      });

    cy.findByTestId('dataset-details-panel').within(() => {
      cy.findByText('raw').should('exist');
      cy.findByText(
        'LOQ54000 Team LOQ GLASSY CARBON 4-SEP-1997 10:03:33 20.3'
      ).should('exist');
    });
  });

  it('should be able to add/remove to/from download cart', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('carbon');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    // 5 rows, 4 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 5);

    cy.intercept(`**/topcat/user/cart/${facilityName}/cartItems`, {
      fixture: 'downloadCartItems.json',
    });

    cy.findAllByRole('row')
      .eq(1)
      .within(() => {
        cy.findByRole('checkbox').click();
        cy.findByRole('checkbox').should('be.checked');
      });

    cy.intercept(`**/topcat/user/cart/${facilityName}/cartItems`, {
      body: {
        cartItems: [],
      },
    });

    cy.findAllByRole('row')
      .eq(1)
      .within(() => {
        cy.findByRole('checkbox').click();
        cy.findByRole('checkbox').should('not.be.checked');
      });
  });

  it('should be able to filter search results by facets', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('carbon');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    cy.findAllByRole('row').should('have.length', 5);

    // open the filter panel, then select some filters
    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();

    // select the filter we want
    cy.findAllByLabelText('Type filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Add experiment_raw filter',
        }).click();
        cy.findByRole('button', {
          name: 'Add experiment_raw filter',
        }).within(() => {
          cy.findByRole('checkbox').should('be.checked');
        });
      });

    // intercept search request to return predefined filtered search result
    cy.intercept('**/search/documents*', {
      fixture: 'filteredDatasetSearchResults.json',
    });

    // apply the filter
    cy.findAllByRole('button', { name: 'Apply' }).filter(':visible').click();

    // the search result should be filtered
    cy.findAllByRole('row').should('have.length', 2);

    // open the filter panel to check that the filter is selected
    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();
    cy.findByTestId('tabpanel-dataset').within(() => {
      cy.findByLabelText('Type filter panel').within(() => {
        cy.findByRole('button', {
          name: 'Remove experiment_raw filter',
        }).within(() => {
          cy.findByRole('checkbox').should('be.checked');
          cy.findByText('100').should('exist');
        });
      });
    });

    // remove the selected filter
    cy.findByTestId('tabpanel-dataset').within(() => {
      cy.findByLabelText('Type filter panel').within(() => {
        cy.findByRole('button', {
          name: 'Remove experiment_raw filter',
        }).click();
      });
    });

    cy.intercept('**/search/documents*', {
      fixture: 'datasetSearchResults.json',
    });

    cy.findByRole('button', { name: 'Apply' }).click();

    // 5 rows, 4 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 5);

    // filter chips should not exist anymore
    cy.findByTestId('tabpanel-dataset').within(() => {
      cy.findByLabelText('Selected filters')
        .children()
        .should('have.length', 0);
    });

    // open the filter panel to check that the filter is selected
    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();
    cy.findByTestId('tabpanel-dataset').within(() => {
      cy.findByLabelText('Type filter panel').within(() => {
        cy.findByRole('button', {
          name: 'Add experiment_raw filter',
        }).within(() => {
          cy.findByRole('checkbox').should('not.be.checked');
          cy.findByText('252').should('exist');
        });
      });
    });
  });

  it('should allow filters to be removed by removing filter chips', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('carbon');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    // 5 rows, 4 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 5);

    // open the filter panel, then select some filters
    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();

    // select the filter we want
    cy.findByTestId('tabpanel-dataset').within(() => {
      cy.findByLabelText('Type filter panel').within(() => {
        cy.findByRole('button', {
          name: 'Add experiment_raw filter',
        }).click();
      });
    });

    // intercept search request to return predefined filtered search result
    cy.intercept('**/search/documents*', {
      fixture: 'filteredDatasetSearchResults.json',
    });

    // apply the filter
    cy.findAllByRole('button', { name: 'Apply' }).filter(':visible').click();

    // the search result should be filtered
    cy.findAllByRole('row').should('have.length', 2);

    cy.intercept('**/search/documents*', {
      fixture: 'datasetSearchResults.json',
    });

    // check that filter chips are displayed
    cy.findByTestId('tabpanel-dataset').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', { name: 'Type: experiment_raw' })
            .should('exist')
            .within(() => {
              // remove the filter chip
              cy.findByTestId('CancelIcon').click();
            });
        });
    });

    // the search result should be filtered
    cy.findAllByRole('row').should('have.length', 5);

    // filter chips should not exist anymore
    cy.findByTestId('tabpanel-dataset').within(() => {
      cy.findByLabelText('Selected filters')
        .children()
        .should('have.length', 0);
    });

    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();
    cy.findByTestId('tabpanel-dataset').within(() => {
      cy.findByLabelText('Type filter panel').within(() => {
        cy.findByRole('button', {
          name: 'Add experiment_raw filter',
        }).within(() => {
          cy.findByRole('checkbox').should('not.be.checked');
          cy.findByText('252').should('exist');
        });
      });
    });
  });
});
