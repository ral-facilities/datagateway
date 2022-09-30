import { join } from 'path';

describe('Datafile preview', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/datafiles*', {
      statusCode: 200,
      fixture: 'datafile.json',
    });
    // intercept request to datafile content and return a mock datafile.
    cy.intercept('GET', '**/getData*', {
      statusCode: 200,
      fixture: 'datafile.txt',
    });
    // intercept request to investigation and return a mock investigation object
    cy.intercept('GET', '**/instruments/1/facilitycycles/16/investigations/*', {
      statusCode: 200,
      fixture: 'investigation.json',
    });
    cy.login();
    cy.visit(
      '/browse/instrument/1/facilityCycle/16/investigation/97/dataset/337/datafile/6084',
      {
        onBeforeLoad(win: Cypress.AUTWindow) {
          cy.spy(win.navigator.clipboard, 'writeText').as('copy');
        },
      }
    );
  });

  it('should show test file content and details', () => {
    // should be able to see the content of the text file
    cy.get('[aria-label="Text content of Datafile 6084.txt"').should('exist');
    cy.contains('First line').should('exist');
    cy.contains('Second line').should('exist');
    cy.contains('Third line').should('exist');

    // show details switch should be on
    // HTML structure of the switch is something like this:
    //
    // <label>
    //   <span>
    //     <...>
    //       <input type="checkbox"> <- MUI uses a checkbox input to store the value of the switch
    //     </...>
    //   </span>
    //   <span>Show details</span>   <- the label for the MUI switch
    // </label>
    cy.get('label')
      .contains('Show details')
      .prev()
      .find('input[type="checkbox"]')
      .should('be.checked');

    // should be able to see details of the datafile
    cy.contains('Datafile 6084.txt').should('exist');
    cy.contains(
      'Effort plan social history carry this summer stuff. Fear source yard small. ' +
        'Together discover new account parent. Learn wall industry red suffer. Black concern building behavior able long.'
    ).should('exist');
    cy.contains('159.93 MB').should('exist');
    cy.contains('/wish/although/eat.txt').should('exist');
    cy.contains('2019-09-05 14:03:35+01:00').should('exist');
    cy.contains('2019-09-05 14:03:35+01:00').should('exist');

    // should be at 100% zoom
    cy.contains('100%').should('exist');
    cy.get('[aria-label="Text content of Datafile 6084.txt"').should(
      'have.css',
      'font-size',
      '12px'
    );
  });

  it('should have a download button that downloads the current datafile', () => {
    // downloads performed in Cypress are saved in cypress/downloads
    // this retrieves the path to that folder
    const downloadFolder = Cypress.config('downloadsFolder');

    cy.contains('Download').click();
    cy.readFile(join(downloadFolder, '_wish_although_eat.txt'));
  });

  it('should have a copy link button that copies the link to the current datafile to the clipboard', () => {
    cy.contains('Copy link').click();
    cy.get('@copy').should(
      'be.calledOnceWithExactly',
      'http://127.0.0.1:3000/browse/instrument/1/facilityCycle/16/investigation/97/dataset/337/datafile/6084'
    );
    // should show a successful after copy is successful
    cy.contains('Link copied to clipboard').should('exist');
    // the message should disappear after a set duration
    cy.contains('Link copied to clipboard').should('not.exist');
  });

  it('should have zoom controls that control the size of the preview content', () => {
    // reset zoom button should not appear initially
    cy.contains('Reset zoom').should('not.exist');

    cy.contains('Zoom in').click();
    cy.get('[aria-label="Text content of Datafile 6084.txt"').should(
      'have.css',
      'font-size',
      '13px'
    );
    cy.contains('110%').should('exist');
    cy.contains('Zoom in').click();
    cy.get('[aria-label="Text content of Datafile 6084.txt"').should(
      'have.css',
      'font-size',
      '14px'
    );
    cy.contains('120%').should('exist');

    cy.contains('Reset zoom').click();
    cy.get('[aria-label="Text content of Datafile 6084.txt"').should(
      'have.css',
      'font-size',
      '12px'
    );
    cy.contains('100%').should('exist');
    // reset zoom should not appear anymore because zoom is reset
    cy.contains('Reset zoom').should('not.exist');

    cy.contains('Zoom out').click();
    cy.get('[aria-label="Text content of Datafile 6084.txt"').should(
      'have.css',
      'font-size',
      '11px'
    );
    cy.contains('90%').should('exist');
    cy.contains('Zoom out').click();
    cy.get('[aria-label="Text content of Datafile 6084.txt"').should(
      'have.css',
      'font-size',
      '10px'
    );
    cy.contains('80%').should('exist');

    cy.contains('Reset zoom').click();
    cy.get('[aria-label="Text content of Datafile 6084.txt"').should(
      'have.css',
      'font-size',
      '12px'
    );
    // reset zoom should not appear anymore because zoom is reset
    cy.contains('Reset zoom').should('not.exist');
    cy.contains('100%').should('exist');
  });

  it('should have a details pane toggle that toggles details pane', () => {
    cy.get('label').contains('Show details').click();

    cy.contains('Datafile 6084.txt').should('not.exist');
    cy.contains(
      'Effort plan social history carry this summer stuff. Fear source yard small. ' +
        'Together discover new account parent. Learn wall industry red suffer. Black concern building behavior able long.'
    ).should('not.exist');
    cy.contains('159.93 MB').should('not.exist');
    cy.contains('/wish/although/eat.txt').should('not.exist');
    cy.contains('2019-09-05 14:03:35+01:00').should('not.exist');
    cy.contains('2019-09-05 14:03:35+01:00').should('not.exist');

    // see above for the HTML structure of the checkbox
    cy.get('label')
      .contains('Show details')
      .prev()
      .find('input[type="checkbox"]')
      .should('not.be.checked');

    cy.get('label').contains('Show details').click();

    cy.contains('Datafile 6084.txt').should('exist');
    cy.contains(
      'Effort plan social history carry this summer stuff. Fear source yard small. ' +
        'Together discover new account parent. Learn wall industry red suffer. Black concern building behavior able long.'
    ).should('exist');
    cy.contains('159.93 MB').should('exist');
    cy.contains('/wish/although/eat.txt').should('exist');
    cy.contains('2019-09-05 14:03:35+01:00').should('exist');
    cy.contains('2019-09-05 14:03:35+01:00').should('exist');

    // see above for the HTML structure of the checkbox
    cy.get('label')
      .contains('Show details')
      .prev()
      .find('input[type="checkbox"]')
      .should('be.checked');
  });
});
