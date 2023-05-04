describe('Investigation search tab', () => {
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
      fixture: 'investigationSearchResults.json',
    });
    cy.intercept('**/investigations?*').as('investigations');
    cy.intercept('**/datasets/count*', {
      body: 1,
    });
    cy.intercept('**/datafiles/count*', {
      body: 1,
    });
    cy.intercept(`**/topcat/user/cart/${facilityName}*`, {
      body: {
        cartItems: [],
      },
    });

    // only the dataset tab is tested here, so we want to hide investigation & datafile tabs
    // open search type dropdown menu
    cy.findByRole('button', { name: 'Types (3)' }).click();
    // uncheck investigation
    cy.findByRole('listbox').within(() => {
      cy.findByRole('checkbox', { name: 'Dataset checkbox' }).click();
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

    cy.findByRole('tab', { name: 'Investigation' }).within(() => {
      cy.findByText('6').should('exist');
    });

    // expecting 7 rows, 6 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 7);

    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();
    cy.findAllByLabelText('Type filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add experiment filter' })
          .should('exist')
          .within(() => {
            cy.findByText('191').should('exist');
          });

        cy.findByRole('button', { name: 'Add calibration filter' })
          .should('exist')
          .within(() => {
            cy.findByText('109').should('exist');
          });
      });

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();
    cy.findAllByLabelText('Parameter name filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add bcat_inv_str filter' })
          .should('exist')
          .within(() => {
            cy.findByText('241').should('exist');
          });

        cy.findByRole('button', { name: 'Add run_number_range filter' })
          .should('exist')
          .within(() => {
            cy.findByText('189').should('exist');
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

    // 7 rows, 6 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 7);

    cy.findAllByRole('row')
      .eq(1)
      .within(() => {
        cy.findByRole('button', { name: 'Show details' }).click();
      });
  });

  it('should be able to add/remove to/from download cart', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('carbon');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    // 7 rows, 6 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 7);

    cy.intercept(`**/topcat/user/cart/${facilityName}/cartItems`, {
      fixture: 'downloadCartItems.json',
    });

    cy.findAllByRole('row')
      .eq(1)
      .within(() => {
        cy.findByRole('checkbox').click().should('be.checked');
      });

    cy.intercept(`**/topcat/user/cart/${facilityName}/cartItems`, {
      body: {
        cartItems: [],
      },
    });

    cy.findAllByRole('row')
      .eq(1)
      .within(() => {
        cy.findByRole('checkbox').click().should('not.be.checked');
      });
  });

  it('should be able to filter search results by facets', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('carbon');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    // 7 rows, 6 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 7);

    // open the filter panel, then select some filters
    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();

    // select the filter we want
    cy.findAllByLabelText('Type filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Add experiment filter',
        })
          .click()
          .within(() => {
            cy.findByRole('checkbox').should('be.checked');
          });
      });

    // intercept search request to return predefined filtered search result
    cy.intercept('**/search/documents*', {
      fixture: 'filteredInvestigationSearchResults.json',
    });

    // apply the filter
    cy.findAllByRole('button', { name: 'Apply' }).filter(':visible').click();

    // the search result should be filtered
    cy.findAllByRole('row').should('have.length', 2);

    // open the filter panel to check that the filter is selected
    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();
    cy.findAllByLabelText('Type filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Remove experiment filter',
        }).within(() => {
          cy.findByRole('checkbox').should('be.checked');
          cy.findByText('191').should('exist');
        });

        cy.findByRole('button', { name: 'Add calibration filter' }).should(
          'not.exist'
        );
      });

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();
    cy.findAllByLabelText('Parameter name filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add bcat_inv_str filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('241').should('exist');
          });

        cy.findByRole('button', { name: 'Add run_number_range filter' }).should(
          'not.exist'
        );
      });

    // check that filter chips are displayed
    cy.findByTestId('tabpanel-investigation').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByText('Type: experiment').should('exist');
        });
    });

    // try to remove the filter
    cy.findAllByLabelText('Type filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Remove experiment filter',
        }).click();
      });

    cy.intercept('**/search/documents*', {
      fixture: 'investigationSearchResults.json',
    });

    // apply the changes
    cy.findByRole('button', { name: 'Apply' }).click();

    // 7 rows, 6 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 7);

    // filter chips should not exist anymore
    cy.findByTestId('tabpanel-investigation').within(() => {
      cy.findByLabelText('Selected filters')
        .children()
        .should('have.length', 0);
    });

    // open the filter panel to check that the filter is not selected anymore
    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();
    cy.findAllByLabelText('Type filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Add experiment filter',
        }).within(() => {
          cy.findByRole('checkbox').should('not.be.checked');
          cy.findByText('191').should('exist');
        });

        cy.findByRole('button', { name: 'Add calibration filter' }).within(
          () => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('109').should('exist');
          }
        );
      });

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();
    cy.findAllByLabelText('Parameter name filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add bcat_inv_str filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('241').should('exist');
          });

        cy.findByRole('button', { name: 'Add run_number_range filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('189').should('exist');
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

    // 7 rows, 6 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 7);

    // open the filter panel, then select some filters
    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();

    // select the filter we want
    cy.findAllByLabelText('Type filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Add experiment filter',
        }).click();
      });

    // intercept search request to return predefined filtered search result
    cy.intercept('**/search/documents*', {
      fixture: 'filteredInvestigationSearchResults.json',
    });

    // apply the filter
    cy.findAllByRole('button', { name: 'Apply' }).filter(':visible').click();

    // the search result should be filtered
    cy.findAllByRole('row').should('have.length', 2);

    cy.intercept('**/search/documents*', {
      fixture: 'investigationSearchResults.json',
    });

    // check that filter chips are displayed
    cy.findByTestId('tabpanel-investigation').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', { name: 'Type: experiment' })
            .should('exist')
            .within(() => {
              // remove the filter chip
              cy.findByTestId('CancelIcon').click();
            });
        });
    });

    // the search result should be filtered
    cy.findAllByRole('row').should('have.length', 7);

    // filter chips should not exist anymore
    cy.findByTestId('tabpanel-investigation').within(() => {
      cy.findByLabelText('Selected filters')
        .children()
        .should('have.length', 0);
    });

    // open the filter panel to check that the filter is not selected anymore
    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();
    cy.findAllByLabelText('Type filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Add experiment filter',
        }).within(() => {
          cy.findByRole('checkbox').should('not.be.checked');
          cy.findByText('191').should('exist');
        });

        cy.findByRole('button', { name: 'Add calibration filter' }).within(
          () => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('109').should('exist');
          }
        );
      });

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();
    cy.findAllByLabelText('Parameter name filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add bcat_inv_str filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('241').should('exist');
          });

        cy.findByRole('button', { name: 'Add run_number_range filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('189').should('exist');
          });
      });
  });

  it('should link to an investigation', () => {
    cy.get('#filled-search').type('dog');

    cy.get('[aria-label="Submit search"]')
      .click()
      .wait(['@investigations', '@investigationsCount'], {
        timeout: 10000,
      });
    cy.get('[href="/browse/investigation/6/dataset"]');
  });
});
