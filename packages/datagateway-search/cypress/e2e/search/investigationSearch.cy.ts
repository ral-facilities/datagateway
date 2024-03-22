describe('Investigation search tab', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/search/data/');

    // only the investigation tab is tested here, so we want to hide dataset & datafile tabs
    // open search type dropdown menu
    cy.findByRole('button', { name: 'Types (3)' }).click();

    cy.findByRole('listbox').within(() => {
      cy.findByRole('checkbox', { name: 'Dataset checkbox' }).click();
      cy.findByRole('checkbox', { name: 'Datafile checkbox' }).click();
    });
    // close the dropdown menu
    cy.get('body').type('{esc}');
  });

  it('should perform search query and show search results correctly', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('dog');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    cy.findByRole('tab', { name: 'Investigation' }).within(() => {
      cy.findByText('5').should('exist');
    });

    // expecting 6 rows, 5 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 6);

    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();
    cy.findAllByLabelText('Type filter panel').within(() => {
      cy.findByRole('button', { name: 'Add INVESTIGATIONTYPE 2 filter' })
        .should('exist')
        .within(() => {
          cy.findByText('3').should('exist');
        });

      cy.findByRole('button', { name: 'Add INVESTIGATIONTYPE 1 filter' })
        .should('exist')
        .within(() => {
          cy.findByText('2').should('exist');
        });
    });

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();
    cy.findAllByLabelText('Parameter name filter panel').within(() => {
      cy.findByRole('button', { name: 'Add PARAMETERTYPE 2 filter' })
        .should('exist')
        .within(() => {
          cy.findByText('2').should('exist');
        });

      cy.findByRole('button', { name: 'Add PARAMETERTYPE 11 filter' })
        .should('exist')
        .within(() => {
          cy.findByText('1').should('exist');
        });
    });

    cy.findByRole('button', {
      name: 'Toggle Sample filter panel',
    }).click();
    cy.findAllByLabelText('Sample filter panel').within(() => {
      cy.findByRole('button', { name: 'Add SAMPLETYPE 38 filter' })
        .should('exist')
        .within(() => {
          cy.findByText('1').should('exist');
        });
    });

    cy.findByRole('button', {
      name: 'Toggle Instrument filter panel',
    }).click();
    cy.findAllByLabelText('Instrument filter panel').within(() => {
      cy.findByRole('button', { name: 'Add INSTRUMENT 8 filter' })
        .should('exist')
        .within(() => {
          cy.findByText('2').should('exist');
        });

      cy.findByRole('button', { name: 'Add INSTRUMENT 14 filter' })
        .should('exist')
        .within(() => {
          cy.findByText('1').should('exist');
        });
    });
  });

  it('should be able to open the details panel of a specific row', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('dog');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    // 6 rows, 5 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 6);

    cy.findAllByRole('row')
      .eq(1)
      .within(() => {
        cy.findByRole('button', { name: 'Show details' }).click();
      });

    cy.findByTestId('investigation-details-panel').within(() => {
      cy.findByText('Majority about dog idea bag summer', {
        exact: false,
      }).should('exist');
      cy.findByText('INVESTIGATION 52').should('exist');
    });
  });

  it('should be able to add/remove to/from download cart', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('dog');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    // 6 rows, 5 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 6);

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
    cy.findByRole('searchbox', { name: 'Search text input' }).type('dog');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    cy.findAllByRole('row').should('have.length', 6);

    // open the filter panel, then select some filters
    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();

    // select the filter we want
    cy.findAllByLabelText('Type filter panel').within(() => {
      cy.findByRole('button', {
        name: 'Add INVESTIGATIONTYPE 2 filter',
      })
        .as('filter')
        .click();
      cy.get('@filter').within(() => {
        cy.findByRole('checkbox').should('be.checked');
      });
    });

    // apply the filter
    cy.findAllByRole('button', { name: 'Apply' }).click();

    // the search result should be filtered
    cy.findAllByRole('row').should('have.length', 4);

    // check that filter chips are displayed
    cy.findByTestId('tabpanel-investigation').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByText('Type: INVESTIGATIONTYPE 2').should('exist');
        });
    });

    // open the filter panel to check that the filter is selected
    cy.findByRole('button', { name: 'Toggle Type filter panel' }).click();
    cy.findAllByLabelText('Type filter panel').within(() => {
      cy.findByRole('button', {
        name: 'Remove INVESTIGATIONTYPE 2 filter',
      }).within(() => {
        cy.findByRole('checkbox').should('be.checked');
      });
    });

    // open another filter panel to see the panel shows the updated list of filters
    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();
    cy.findAllByLabelText('Parameter name filter panel').within(() => {
      // the filtered search results don't include this facet
      cy.findByRole('button', {
        name: 'Add PARAMETERTYPE 11 filter',
      }).should('not.exist');

      cy.findByRole('button', {
        name: 'Add PARAMETERTYPE 2 filter',
      }).within(() => {
        cy.findByRole('checkbox').should('not.be.checked');
        cy.findByRole('checkbox').click();
      });
    });

    cy.findByRole('button', { name: 'Apply' }).click();

    cy.findAllByRole('row').should('have.length', 2);

    // remove both filters, one by deselecting the filter, one via removing the chip

    // check that filter chips are displayed
    cy.findByTestId('tabpanel-investigation').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', {
            name: 'Parameter name: PARAMETERTYPE 2',
            exact: false,
          }).should('exist');
          cy.findByRole('button', {
            name: 'Type: INVESTIGATIONTYPE 2',
            exact: false,
          })
            .should('exist')
            .within(() => {
              // remove the filter chip
              cy.findByTestId('CancelIcon').click();
            });
        });
    });

    cy.findAllByRole('row').should('have.length', 3);

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();
    cy.findAllByLabelText('Parameter name filter panel').within(() => {
      cy.findByRole('button', {
        name: 'Remove PARAMETERTYPE 2 filter',
      }).click();
    });

    cy.findByRole('button', { name: 'Apply' }).click();

    cy.findAllByRole('row').should('have.length', 6);

    // filter chips should not exist anymore
    cy.findByTestId('tabpanel-investigation').within(() => {
      cy.findByLabelText('Selected filters')
        .children()
        .should('have.length', 0);
    });

    cy.findAllByLabelText('Parameter name filter panel').within(() => {
      cy.findByRole('button', { name: 'Add PARAMETERTYPE 2 filter' })
        .should('exist')
        .within(() => {
          cy.findByRole('checkbox').should('not.be.checked');
          cy.findByText('2').should('exist');
        });

      cy.findByRole('button', { name: 'Add PARAMETERTYPE 11 filter' })
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

    cy.findAllByLabelText('Type filter panel').within(() => {
      cy.findByRole('button', { name: 'Add INVESTIGATIONTYPE 2 filter' })
        .should('exist')
        .within(() => {
          cy.findByRole('checkbox').should('not.be.checked');
          cy.findByText('3').should('exist');
        });
    });

    cy.findByRole('button', {
      name: 'Toggle Type filter panel',
    }).click();

    cy.findByRole('button', {
      name: 'Toggle Sample filter panel',
    }).click();

    // select the filter we want
    cy.findAllByLabelText('Sample filter panel').within(() => {
      cy.findByRole('button', {
        name: 'Add SAMPLETYPE 38 filter',
      })
        .as('filter')
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
    cy.findByTestId('tabpanel-investigation').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', {
            name: 'Sample: SAMPLETYPE 38',
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
    cy.findAllByLabelText('Instrument filter panel').within(() => {
      cy.findByRole('button', {
        name: 'Add INSTRUMENT 8 filter',
      })
        .as('filter')
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
    cy.findByTestId('tabpanel-investigation').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByText('Instrument: INSTRUMENT 8').should('exist');
        });
    });
  });

  it('should be able to filter search results by parameter filters', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('dog');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    cy.findAllByRole('row').should('have.length', 6);

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
    cy.findByRole('option', { name: 'PARAMETERTYPE 2' }).click();

    cy.findByRole('button', { name: /Parameter type /i }).click();

    cy.findByRole('option', { name: 'Numeric' }).click();

    cy.findByRole('spinbutton', { name: 'Minimum value' }).type('5');

    cy.findByRole('spinbutton', { name: 'Maximum value' }).type('10');

    cy.findByRole('button', { name: 'Add filter' }).click();

    cy.findByRole('button', { name: 'Apply' }).click();

    cy.findAllByRole('row').should('have.length', 2);

    // check that filter chips are displayed & remove
    cy.findByTestId('tabpanel-investigation').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', {
            name: 'PARAMETERTYPE 2: 5 to 10',
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
    cy.findByRole('option', { name: 'PARAMETERTYPE 47' }).click();

    cy.findByRole('button', { name: /Parameter type /i }).click();

    cy.findByRole('option', { name: 'String' }).click();

    cy.findByRole('button', { name: /Parameter equals /i }).click();

    cy.findByRole('option', { name: /value 47/i }).click();

    cy.findByRole('button', { name: 'Add filter' }).click();

    cy.findByRole('button', { name: 'Apply' }).click();

    cy.findAllByRole('row').should('have.length', 2);

    // check that filter chips are displayed & remove
    cy.findByTestId('tabpanel-investigation').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', {
            name: 'PARAMETERTYPE 47: value 47',
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
    cy.findByRole('option', { name: 'PARAMETERTYPE 25' }).click();

    cy.findByRole('button', { name: /Parameter type /i }).click();

    cy.findByRole('option', { name: 'Date and time' }).click();

    cy.findByRole('button', { name: /Parameter is in /i }).click();

    cy.findByRole('option', { name: /Older/i }).click();

    cy.findByRole('button', { name: 'Add filter' }).click();

    cy.findByRole('button', { name: 'Apply' }).click();

    cy.findAllByRole('row').should('have.length', 2);

    // check that filter chips are displayed
    cy.findByTestId('tabpanel-investigation').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', {
            name: 'PARAMETERTYPE 25: Older',
            exact: false,
          }).should('exist');
        });
    });
  });

  it('should link to an investigation', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('dog');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    cy.get('[href="/browse/investigation/3/dataset"]');
  });
});
