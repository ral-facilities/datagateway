describe('Datafile search tab', () => {
  let facilityName: string;

  before(() => {
    cy.request('/datagateway-search-settings.json').then((settings) => {
      if (settings.body.facilityName) facilityName = settings.body.facilityName;
    });
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/search/data/');
    cy.intercept('**/search/documents*', {
      fixture: 'datafileSearchResults.json',
    });
    cy.intercept('**/datasets/count*', {
      body: 1,
    });
    cy.intercept('**/datafiles/count*', {
      body: 1,
    });
    cy.intercept(`**/topcat/user/cart/${facilityName}/cartItems`, {
      statusCode: 200,
    });
    cy.intercept(`**/topcat/user/cart/${facilityName}*`, {
      body: {
        cartItems: [],
      },
    });

    // only the datafile tab is tested here, so we want to hide investigation & dataset tabs
    // open search type dropdown menu
    cy.findByRole('button', { name: 'Types (3)' }).click();
    // uncheck investigation
    cy.findByRole('listbox').within(() => {
      cy.findByRole('checkbox', { name: 'Investigation checkbox' }).click();
      cy.findByRole('checkbox', { name: 'Dataset checkbox' }).click();
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

    cy.findByRole('tab', { name: 'Datafile' }).within(() => {
      cy.findByText('4').should('exist');
    });

    // 5 rows, 4 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 5);

    cy.findByRole('button', { name: 'Toggle Format filter panel' }).click();

    cy.findAllByLabelText('Format filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add isis neutron raw filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('173').should('exist');
          });
      });

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();

    cy.findAllByLabelText('Parameter name filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add finish_date filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('300').should('exist');
          });

        cy.findByRole('button', { name: 'Add good_frames filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('300').should('exist');
          });

        cy.findByRole('button', { name: 'Add good_proton_charge filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('300').should('exist');
          });
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

  it('should be able to open the details panel of a specific row', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('carbon');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    cy.findAllByRole('row').should('have.length', 5);

    cy.findAllByRole('row')
      .eq(1)
      .within(() => {
        cy.findByRole('button', { name: 'Show details' }).click();
      });

    cy.findByTestId('datafile-details-panel').within(() => {
      cy.findByText('EVS07934.RAW').should('exist');
      cy.findByText('940.03 KB').should('exist');
      cy.findByText(
        '\\\\isis\\inst$\\NDXEVS\\Instrument\\data\\cycle_99_5\\EVS07934.RAW'
      ).should('exist');
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
    cy.findByRole('button', { name: 'Toggle Format filter panel' }).click();

    // select the filter we want
    cy.findAllByLabelText('Format filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Add isis neutron raw filter',
        })
          .click()
          .within(() => {
            cy.findByRole('checkbox').should('be.checked');
          });
      });

    // intercept search request to return predefined filtered search result
    cy.intercept('**/search/documents*', {
      fixture: 'filteredDatafileSearchResults.json',
    });

    // apply the filter
    cy.findAllByRole('button', { name: 'Apply' }).filter(':visible').click();

    // the search result should be filtered
    cy.findAllByRole('row').should('have.length', 2);

    // check that filter chips are displayed
    cy.findByTestId('tabpanel-datafile').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByText('Format: isis neutron raw').should('exist');
        });
    });

    // open the filter panel to check that the filter is selected
    cy.findByRole('button', { name: 'Toggle Format filter panel' }).click();
    cy.findAllByLabelText('Format filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Remove isis neutron raw filter',
        }).within(() => {
          cy.findByRole('checkbox').should('be.checked');
        });
      });

    // open the other filter panel to see the panel shows the updated list of filters
    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();
    cy.findAllByLabelText('Parameter name filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Add finish_date filter',
        }).within(() => {
          cy.findByRole('checkbox').should('not.be.checked');
        });

        // the filtered search results don't include this facet
        cy.findByRole('button', {
          name: 'Add good_frames filter',
        }).should('not.exist');

        cy.findByRole('button', {
          name: 'Add good_proton_charge filter',
        }).within(() => {
          cy.findByRole('checkbox').should('not.be.checked');
        });
      });

    cy.findAllByLabelText('Format filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Remove isis neutron raw filter',
        }).click();
      });

    cy.intercept('**/search/documents*', {
      fixture: 'datafileSearchResults.json',
    });

    cy.findByRole('button', { name: 'Apply' }).click();

    // 5 rows, 4 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 5);

    // filter chips should not exist anymore
    cy.findByTestId('tabpanel-datafile').within(() => {
      cy.findByLabelText('Selected filters')
        .children()
        .should('have.length', 0);
    });

    cy.findAllByLabelText('Format filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add isis neutron raw filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('173').should('exist');
          });
      });

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();

    cy.findAllByLabelText('Parameter name filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add finish_date filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('300').should('exist');
          });

        cy.findByRole('button', { name: 'Add good_frames filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('300').should('exist');
          });

        cy.findByRole('button', { name: 'Add good_proton_charge filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('300').should('exist');
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
    cy.findByRole('button', { name: 'Toggle Format filter panel' }).click();

    // select the filter we want
    cy.findAllByLabelText('Format filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Add isis neutron raw filter',
        }).click();
      });

    // intercept search request to return predefined filtered search result
    cy.intercept('**/search/documents*', {
      fixture: 'filteredDatafileSearchResults.json',
    });

    // apply the filter
    cy.findAllByRole('button', { name: 'Apply' }).filter(':visible').click();

    // the search result should be filtered
    cy.findAllByRole('row').should('have.length', 2);

    cy.intercept('**/search/documents*', {
      fixture: 'datafileSearchResults.json',
    });

    // check that filter chips are displayed
    cy.findByTestId('tabpanel-datafile').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', { name: 'Format: isis neutron raw' })
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
    cy.findByTestId('tabpanel-datafile').within(() => {
      cy.findByLabelText('Selected filters')
        .children()
        .should('have.length', 0);
    });

    // open the filter panel to check that the filter is not selected anymore
    cy.findByRole('button', { name: 'Toggle Format filter panel' }).click();
    cy.findAllByLabelText('Format filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Add isis neutron raw filter',
        }).within(() => {
          cy.findByRole('checkbox').should('not.be.checked');
          cy.findByText('173').should('exist');
        });
      });

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();
    cy.findAllByLabelText('Parameter name filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add finish_date filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('300').should('exist');
          });

        cy.findByRole('button', { name: 'Add good_frames filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('300').should('exist');
          });

        cy.findByRole('button', { name: 'Add good_proton_charge filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('300').should('exist');
          });
      });
  });
});
