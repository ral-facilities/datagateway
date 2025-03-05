describe('Dataset search tab', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/search/data/');

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
    cy.findByRole('searchbox', { name: 'Search text input' }).type('last');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    cy.findByRole('tab', { name: 'Dataset' }).within(() => {
      cy.findByText('7').should('exist');
    });

    // 8 rows, 7 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 8);

    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();

    cy.findAllByLabelText('Type filter panel').within(() => {
      cy.findByRole('button', { name: 'Add DATASETTYPE 1 filter' })
        .should('exist')
        .within(() => {
          cy.findByText('4').should('exist');
        });

      cy.findByRole('button', { name: 'Add DATASETTYPE 2 filter' })
        .should('exist')
        .within(() => {
          cy.findByText('2').should('exist');
        });
    });

    cy.findByRole('button', { name: 'Toggle Sample filter panel' }).click();

    cy.findAllByLabelText('Sample filter panel').within(() => {
      cy.findByRole('button', { name: 'Add SAMPLETYPE 18 filter' })
        .should('exist')
        .within(() => {
          cy.findByText('1').should('exist');
        });
    });

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();

    cy.findAllByLabelText('Parameter name filter panel').within(() => {
      cy.findByRole('button', { name: 'Add PARAMETERTYPE 1 filter' })
        .should('exist')
        .within(() => {
          cy.findByText('1').should('exist');
        });
    });

    cy.findByRole('button', {
      name: 'Toggle Instrument filter panel',
    }).click();
    cy.findAllByLabelText('Instrument filter panel').within(() => {
      cy.findByRole('button', { name: 'Add INSTRUMENT 13 filter' })
        .should('exist')
        .within(() => {
          // shouldn't find a facet count
          cy.findByText(/^[0-9]+$/).should('not.exist');
        });

      cy.findByRole('button', { name: 'Add INSTRUMENT 1 filter' })
        .should('exist')
        .within(() => {
          cy.findByText(/^[0-9]+$/).should('not.exist');
        });
    });
  });

  it('should be able to open the details panel of a specific row', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('last');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    // 8 rows, 7 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 8);

    cy.findAllByRole('row')
      .eq(1)
      .within(() => {
        cy.findByRole('button', { name: 'Show details' }).click();
      });

    cy.findByTestId('dataset-details-panel').within(() => {
      cy.findByText('DATASET 75').should('exist');
      cy.findByText('Group story magazine hotel stand', {
        exact: false,
      }).should('exist');
    });
  });

  it('should be able to add/remove to/from download cart', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('last');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    // 8 rows, 7 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 8);

    cy.findAllByRole('row')
      .eq(1)
      .within(() => {
        cy.findByRole('checkbox').click();
        cy.findByRole('checkbox').should('be.checked');
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
    cy.findByRole('searchbox', { name: 'Search text input' }).type('last');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    cy.findAllByRole('row').should('have.length', 8);

    // open the filter panel, then select some filters
    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();

    // select the filter we want
    cy.findAllByLabelText('Type filter panel').within(() => {
      cy.findByRole('button', {
        name: 'Add DATASETTYPE 1 filter',
      })
        .as('filter', { type: 'static' })
        .click();
      cy.get('@filter').within(() => {
        cy.findByRole('checkbox').should('be.checked');
      });
    });

    // apply the filter
    cy.findAllByRole('button', { name: 'Apply' }).click();

    // the search result should be filtered
    cy.findAllByRole('row').should('have.length', 5);

    // check that filter chips are displayed
    cy.findByTestId('tabpanel-dataset').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByText('Type: DATASETTYPE 1').should('exist');
        });
    });

    // open the filter panel to check that the filter is selected
    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();
    cy.findAllByLabelText('Type filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Remove DATASETTYPE 1 filter',
        }).within(() => {
          cy.findByRole('checkbox').should('be.checked');
        });
      });

    // open another filter panel to see the panel shows the updated list of filters
    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();
    cy.findAllByLabelText('Parameter name filter panel')
      .filter(':visible')
      .within(() => {
        // the filtered search results don't include this facet
        cy.findByRole('button', {
          name: 'Add PARAMETERTYPE 1 filter',
        }).should('not.exist');

        cy.findByRole('button', {
          name: 'Add PARAMETERTYPE 40 filter',
        }).within(() => {
          cy.findByRole('checkbox').should('not.be.checked');
          cy.findByRole('checkbox').click();
        });
      });

    cy.findByRole('button', { name: 'Apply' }).click();

    cy.findAllByRole('row').should('have.length', 2);

    // remove both filters, one by deselecting the filter, one via removing the chip

    // check that filter chips are displayed
    cy.findByTestId('tabpanel-dataset').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', {
            name: 'Parameter name: PARAMETERTYPE 40',
            exact: false,
          }).should('exist');
          cy.findByRole('button', {
            name: 'Type: DATASETTYPE 1',
            exact: false,
          })
            .should('exist')
            .within(() => {
              // remove the filter chip
              cy.findByTestId('CancelIcon').click();
            });
        });
    });

    cy.findAllByRole('row').should('have.length', 2);

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();
    cy.findAllByLabelText('Parameter name filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Remove PARAMETERTYPE 40 filter',
        }).click();
      });

    cy.findByRole('button', { name: 'Apply' }).click();

    cy.findAllByRole('row').should('have.length', 8);

    // filter chips should not exist anymore
    cy.findByTestId('tabpanel-dataset').within(() => {
      cy.findByLabelText('Selected filters')
        .children()
        .should('have.length', 0);
    });

    cy.findAllByLabelText('Parameter name filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add PARAMETERTYPE 40 filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('1').should('exist');
          });

        cy.findByRole('button', { name: 'Add PARAMETERTYPE 1 filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('1').should('exist');
          });
      });

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();

    cy.findByRole('button', {
      name: 'Toggle Type filter panel',
    }).click();

    cy.findAllByLabelText('Type filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add DATASETTYPE 1 filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('4').should('exist');
          });
      });

    cy.findByRole('button', {
      name: 'Toggle Type filter panel',
    }).click();

    cy.findByRole('button', {
      name: 'Toggle Sample filter panel',
    }).click();

    // select the filter we want
    cy.findAllByLabelText('Sample filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Add SAMPLETYPE 18 filter',
        })
          .as('filter', { type: 'static' })
          .click();
        cy.get('@filter').within(() => {
          cy.findByRole('checkbox').should('be.checked');
        });
      });

    // apply the filter
    cy.findAllByRole('button', { name: 'Apply' }).click();

    // the search result should be filtered
    cy.findAllByRole('row').should('have.length', 2);

    // check that filter chips are displayed
    cy.findByTestId('tabpanel-dataset').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', {
            name: 'Sample: SAMPLETYPE 18',
            exact: false,
          })
            .should('exist')
            .within(() => {
              // remove the filter chip
              cy.findByTestId('CancelIcon').click();
            });
        });
    });

    cy.findByRole('button', {
      name: 'Toggle Instrument filter panel',
    }).click();

    // select the filter we want
    cy.findAllByLabelText('Instrument filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Add INSTRUMENT 13 filter',
        })
          .as('filter', { type: 'static' })
          .click();
        cy.get('@filter').within(() => {
          cy.findByRole('checkbox').should('be.checked');
        });
      });

    // apply the filter
    cy.findAllByRole('button', { name: 'Apply' }).click();

    // the search result should be filtered
    cy.findAllByRole('row').should('have.length', 3);

    // check that filter chips are displayed
    cy.findByTestId('tabpanel-dataset').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByText('Instrument: INSTRUMENT 13').should('exist');
        });
    });
  });

  it('should be able to filter search results by parameter filters', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type(
      'last table'
    );
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    cy.findAllByRole('row').should('have.length', 11);

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();
    cy.findByText('Parameter filters')
      .parent()
      .within(() => {
        cy.findByRole('button', { name: 'Add' }).click();
      });

    cy.findByRole('button', { name: /Parameter name /i }).click();

    // numeric parameter
    cy.findByRole('option', { name: 'PARAMETERTYPE 1' }).click();

    cy.findByRole('button', { name: /Parameter type /i }).click();

    cy.findByRole('option', { name: 'Numeric' }).click();

    cy.findByRole('spinbutton', { name: 'Minimum value' }).type('15');

    cy.findByRole('spinbutton', { name: 'Maximum value' }).type('25');

    cy.findByRole('button', { name: 'Add filter' }).click();

    cy.findByRole('button', { name: 'Apply' }).click();

    cy.findAllByRole('row').should('have.length', 2);

    // check that filter chips are displayed & remove
    cy.findByTestId('tabpanel-dataset').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', {
            name: 'PARAMETERTYPE 1: 15 to 25',
            exact: false,
          })
            .should('exist')
            .within(() => {
              cy.findByTestId('CancelIcon').click();
            });
        });
    });

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();
    cy.findByText('Parameter filters')
      .parent()
      .within(() => {
        cy.findByRole('button', { name: 'Add' }).click();
      });

    cy.findByRole('button', { name: /Parameter name /i }).click();

    // string parameter
    cy.findByRole('option', { name: 'PARAMETERTYPE 40' }).click();

    cy.findByRole('button', { name: /Parameter type /i }).click();

    cy.findByRole('option', { name: 'String' }).click();

    cy.findByRole('button', { name: /Parameter equals /i }).click();

    cy.findByRole('option', { name: /value 40/i }).click();

    cy.findByRole('button', { name: 'Add filter' }).click();

    cy.findByRole('button', { name: 'Apply' }).click();

    cy.findAllByRole('row').should('have.length', 2);

    // check that filter chips are displayed & remove
    cy.findByTestId('tabpanel-dataset').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', {
            name: 'PARAMETERTYPE 40: value 40',
            exact: false,
          })
            .should('exist')
            .within(() => {
              cy.findByTestId('CancelIcon').click();
            });
        });
    });

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();
    cy.findByText('Parameter filters')
      .parent()
      .within(() => {
        cy.findByRole('button', { name: 'Add' }).click();
      });

    cy.findByRole('button', { name: /Parameter name /i }).click();

    // datetime parameter
    cy.findByRole('option', { name: 'PARAMETERTYPE 4' }).click();

    cy.findByRole('button', { name: /Parameter type /i }).click();

    cy.findByRole('option', { name: 'Date and time' }).click();

    cy.findByRole('button', { name: /Parameter is in /i }).click();

    cy.findByRole('option', { name: /Older/i }).click();

    cy.findByRole('button', { name: 'Add filter' }).click();

    cy.findByRole('button', { name: 'Apply' }).click();

    cy.findAllByRole('row').should('have.length', 2);

    // check that filter chips are displayed
    cy.findByTestId('tabpanel-dataset').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', {
            name: 'PARAMETERTYPE 4: Older',
            exact: false,
          }).should('exist');
        });
    });
  });
});
