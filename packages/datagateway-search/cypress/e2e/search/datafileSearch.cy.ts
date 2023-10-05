describe('Datafile search tab', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/search/data/');

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
    cy.findByRole('searchbox', { name: 'Search text input' }).type(
      'dog AND big'
    );
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    cy.findByRole('tab', { name: 'Datafile' }).within(() => {
      cy.findByText('2').should('exist');
    });

    // 3 rows, 2 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 3);

    cy.findByRole('button', { name: 'Toggle Format filter panel' }).click();

    cy.findAllByLabelText('Format filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add DATAFILEFORMAT 9 filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('1').should('exist');
          });
      });

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();

    cy.findAllByLabelText('Parameter name filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add PARAMETERTYPE 23 filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('1').should('exist');
          });

        cy.findByRole('button', { name: 'Add PARAMETERTYPE 46 filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('1').should('exist');
          });
      });
  });

  it('should be able to add/remove to/from download cart', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('+dog +big');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    // 3 rows, 2 for search results, 1 for the header row
    cy.findAllByRole('row').should('have.length', 3);

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

  it('should be able to open the details panel of a specific row', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('+dog +big');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    cy.findAllByRole('row').should('have.length', 3);

    cy.findAllByRole('row')
      .eq(1)
      .within(() => {
        cy.findByRole('button', { name: 'Show details' }).click();
      });

    cy.findByTestId('datafile-details-panel').within(() => {
      cy.findByText('Datafile 1302').should('exist');
      cy.findByText('32.89 MB').should('exist');
      cy.findByText('/memory/dog/experience.jpg').should('exist');
    });
  });

  it('should be able to filter search results by facets', () => {
    // type in search query
    cy.findByRole('searchbox', { name: 'Search text input' }).type('dog');
    // uncheck my data
    cy.findByRole('checkbox', { name: 'My data' }).click();
    // click on search button
    cy.findByRole('button', { name: 'Submit search' }).click();

    cy.findAllByRole('row').should('have.length', 27);

    // open the filter panel, then select some filters
    cy.findByRole('button', { name: 'Toggle Format filter panel' }).click();

    // select the filter we want
    cy.findAllByLabelText('Format filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Add DATAFILEFORMAT 1 filter',
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
    cy.findByTestId('tabpanel-datafile').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByText('Format: DATAFILEFORMAT 1').should('exist');
        });
    });

    // open the filter panel to check that the filter is selected
    cy.findByRole('button', { name: 'Toggle Format filter panel' }).click();
    cy.findAllByLabelText('Format filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Remove DATAFILEFORMAT 1 filter',
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
          name: 'Add PARAMETERTYPE 19 filter',
        }).should('not.exist');

        cy.findByRole('button', {
          name: 'Add PARAMETERTYPE 23 filter',
        }).within(() => {
          cy.findByRole('checkbox').should('not.be.checked');
          cy.findByRole('checkbox').click();
        });
      });

    cy.findByRole('button', { name: 'Apply' }).click();

    cy.findAllByRole('row').should('have.length', 2);

    // remove both filters, one by deselecting the filter, one via removing the chip

    // check that filter chips are displayed
    cy.findByTestId('tabpanel-datafile').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', {
            name: 'Parameter name: PARAMETERTYPE 23',
            exact: false,
          }).should('exist');
          cy.findByRole('button', {
            name: 'Format: DATAFILEFORMAT 1',
            exact: false,
          })
            .should('exist')
            .within(() => {
              // remove the filter chip
              cy.findByTestId('CancelIcon').click();
            });
        });
    });

    cy.findAllByRole('row').should('have.length', 5);

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();
    cy.findAllByLabelText('Parameter name filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Remove PARAMETERTYPE 23 filter',
        }).click();
      });

    cy.findByRole('button', { name: 'Apply' }).click();

    cy.findAllByRole('row').should('have.length', 27);

    // filter chips should not exist anymore
    cy.findByTestId('tabpanel-datafile').within(() => {
      cy.findByLabelText('Selected filters')
        .children()
        .should('have.length', 0);
    });

    cy.findAllByLabelText('Parameter name filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add PARAMETERTYPE 23 filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('4').should('exist');
          });

        cy.findByRole('button', { name: 'Add PARAMETERTYPE 19 filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('3').should('exist');
          });
      });

    cy.findByRole('button', {
      name: 'Toggle Parameter name filter panel',
    }).click();

    cy.findByRole('button', {
      name: 'Toggle Format filter panel',
    }).click();

    cy.findAllByLabelText('Format filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add DATAFILEFORMAT 1 filter' })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox').should('not.be.checked');
            cy.findByText('3').should('exist');
          });
      });

    cy.findByRole('button', {
      name: 'Toggle Format filter panel',
    }).click();

    cy.findByRole('button', {
      name: 'Toggle Sample filter panel',
    }).click();

    // select the filter we want
    cy.findAllByLabelText('Sample filter panel')
      .filter(':visible')
      .within(() => {
        cy.findByRole('button', {
          name: 'Add SAMPLETYPE 30 filter',
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
    cy.findAllByRole('row').should('have.length', 7);

    // check that filter chips are displayed
    cy.findByTestId('tabpanel-datafile').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByText('Sample: SAMPLETYPE 30').should('exist');
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

    cy.findAllByRole('row').should('have.length', 27);

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
    cy.findByRole('option', { name: 'PARAMETERTYPE 33' }).click();

    cy.findByRole('button', { name: /Parameter type /i }).click();

    cy.findByRole('option', { name: 'Numeric' }).click();

    cy.findByRole('spinbutton', { name: 'Minimum value' }).type('30');

    cy.findByRole('spinbutton', { name: 'Maximum value' }).type('40');

    cy.findByRole('button', { name: 'Add filter' }).click();

    cy.findByRole('button', { name: 'Apply' }).click();

    cy.findAllByRole('row').should('have.length', 3);

    // check that filter chips are displayed & remove
    cy.findByTestId('tabpanel-datafile').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', {
            name: 'PARAMETERTYPE 33: 30 to 40',
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
    cy.findByRole('option', { name: 'PARAMETERTYPE 23' }).click();

    cy.findByRole('button', { name: /Parameter type /i }).click();

    cy.findByRole('option', { name: 'String' }).click();

    cy.findByRole('button', { name: /Parameter equals /i }).click();

    cy.findByRole('option', { name: /value 23/i }).click();

    cy.findByRole('button', { name: 'Add filter' }).click();

    cy.findByRole('button', { name: 'Apply' }).click();

    cy.findAllByRole('row').should('have.length', 5);

    // check that filter chips are displayed & remove
    cy.findByTestId('tabpanel-datafile').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', {
            name: 'PARAMETERTYPE 23: value 23',
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
    cy.findByRole('option', { name: 'PARAMETERTYPE 19' }).click();

    cy.findByRole('button', { name: /Parameter type /i }).click();

    cy.findByRole('option', { name: 'Date and time' }).click();

    cy.findByRole('button', { name: /Parameter is in /i }).click();

    cy.findByRole('option', { name: /Older/i }).click();

    cy.findByRole('button', { name: 'Add filter' }).click();

    cy.findByRole('button', { name: 'Apply' }).click();

    cy.findAllByRole('row').should('have.length', 2);

    // check that filter chips are displayed
    cy.findByTestId('tabpanel-datafile').within(() => {
      cy.findByLabelText('Selected filters')
        .should('exist')
        .within(() => {
          cy.findByRole('button', {
            name: 'PARAMETERTYPE 19: Older',
            exact: false,
          }).should('exist');
        });
    });
  });
});
