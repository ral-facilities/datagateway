describe('Investigations Table', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.clearDownloadCart();
    cy.visit('/browse/investigation');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Table');
    cy.get('#datagateway-table').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('a')
      .first()
      .click({ force: true });
    cy.location('pathname').should('eq', '/browse/investigation/1/dataset');
  });

  it('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  describe('should be able to sort by', () => {
    it('ascending order', () => {
      cy.contains('Title').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'A nothing almost arrive I. Product middle design never. Cup camera then product father sort vote.'
      );
    });

    it('descending order', () => {
      cy.contains('Title').click();
      cy.contains('Title').click();

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Whom anything affect consider left. Entire order tough. White responsibility economic travel activity.'
      );
    });

    it('no order', () => {
      cy.contains('Title').click();
      cy.contains('Title').click();
      cy.contains('Title').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.be.visible');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Including spend increase ability music skill former. Agreement director concern once technology sometimes someone staff.'
      );
    });

    it('multiple columns', () => {
      cy.contains('Start Date').click();
      cy.contains('Title').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Color knowledge economy return determine tell. Professor able catch cut nice anyone. Can line benefit home.'
      );
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Title"]')
        .find('input')
        .type('dog');

      cy.get('[aria-rowcount="4"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains('1');
    });

    it('date between', () => {
      cy.get('[aria-label="Start Date date filter from"]').type('2019-01-01');

      cy.get('[aria-label="Start Date date filter to"]')
        .parent()
        .find('button')
        .click();

      cy.get('.MuiPickersDay-day[tabindex="0"]')
        .first()
        .click();

      cy.contains('OK').click();

      let date = new Date();
      date.setDate(1);

      cy.get('[aria-label="Start Date date filter to"]').should(
        'have.value',
        date.toISOString().slice(0, 10)
      );

      cy.get('[aria-rowcount="12"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Happy near day assume draw again. Lead pattern nothing approach spring standard.'
      );
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Title"]')
        .find('input')
        .type('dog');

      cy.get('[aria-label="Filter by Visit ID"]')
        .find('input')
        .type('9');

      cy.get('[aria-rowcount="2"]').should('exist');
    });
  });

  describe('should be able to view details', () => {
    it('when no other row is showing details', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.contains(
        'Title: Including spend increase ability music skill former. Agreement director concern once technology sometimes someone staff.'
      ).should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    it('when another other row is showing details', () => {
      cy.get('[aria-label="Show details"]')
        .eq(2)
        .click();

      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.contains(
        'Title: Including spend increase ability music skill former. Agreement director concern once technology sometimes someone staff.'
      ).should('be.visible');
      cy.contains(
        'Title: Dog want single resource major. Necessary bit always available term small stock game.'
      ).should('not.be.visible');
      cy.get('[aria-label="Hide details"]').should('have.length', 1);
    });

    it('and then not view details anymore', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.get('[aria-label="Hide details"]')
        .first()
        .click();

      cy.contains(
        'Title: Including spend increase ability music skill former. Agreement director concern once technology sometimes someone staff.'
      ).should('not.be.visible');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });

  describe('should be able to select items', () => {
    it('individually', () => {
      cy.get('[aria-label="select row 0"]').check();
      cy.get('[aria-label="select row 0"]').should('be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'true');
    });

    it('and unselect them individually', () => {
      cy.get('[aria-label="select row 0"]').check();
      cy.get('[aria-label="select row 0"]').should('be.checked');

      cy.get('[aria-label="select row 0"]').uncheck();
      cy.get('[aria-label="select row 0"]').should('not.be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');
    });

    it('by all items', () => {
      cy.get('[aria-label="select all rows"]').check();
      cy.get('[aria-label="select all rows"]').should('be.checked');
      cy.get(
        `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
      ).should('be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');
    });

    it('by all items in a filtered table', () => {
      cy.get('[aria-label="Filter by Visit ID"]')
        .find('input')
        .type('8');

      cy.server();
      cy.route('**/investigations**').as('getInvestigations');
      cy.wait('@getInvestigations');

      cy.get('[aria-label="select all rows"]').check();
      cy.get('[aria-label="select all rows"]').should('be.checked');
      cy.get(
        `[aria-label="select row ${Math.floor(Math.random() * 3)}"]`
      ).should('be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');

      cy.get('[aria-label="Filter by Visit ID"]')
        .find('input')
        .clear();

      cy.wait('@getInvestigations');
      cy.get('[aria-label="select all rows"]').should('not.be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'true');

      cy.get('[aria-label="select row 0"]').should('be.checked');
      cy.get('[aria-label="select row 1"]').should('be.checked');
      cy.get('[aria-label="select row 2"]').should('not.be.checked');
      cy.get('[aria-label="select row 3"]').should('not.be.checked');
    });

    it('and unselect all items', () => {
      cy.get('[aria-label="select all rows"]').check();
      cy.get('[aria-label="select all rows"]').should('be.checked');

      cy.get('[aria-label="select all rows"]').uncheck();
      cy.get('[aria-label="select all rows"]').should('not.be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');
      cy.get(
        `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
      ).should('not.be.checked');
    });

    it('by shift clicking', () => {
      cy.get('[aria-label="select row 0"]').click();
      cy.get('[aria-label="select row 0"]').should('be.checked');

      cy.get('body')
        .type('{shift}', { release: false })
        .get('[aria-label="select row 5"]')
        .click();
      cy.get('[aria-label="select row 5"]').should('be.checked');

      cy.get('[aria-label="grid"]').scrollTo('top');
      cy.get('[aria-label="select row 4"]').should('be.checked');
      cy.get('[aria-label="select row 3"]').should('be.checked');
      cy.get('[aria-label="select row 2"]').should('be.checked');
      cy.get('[aria-label="select row 1"]').should('be.checked');
    });

    it('and unselect by shift clicking', () => {
      cy.get('[aria-label="select row 0"]').click();
      cy.get('[aria-label="select row 0"]').should('be.checked');

      cy.get('body')
        .type('{shift}', { release: false })
        .get('[aria-label="select row 5"]')
        .click();
      cy.get('[aria-label="select row 5"]').should('be.checked');

      cy.get('[aria-label="grid"]').scrollTo('top');
      cy.get('body')
        .type('{shift}', { release: false })
        .get('[aria-label="select row 2"]')
        .click();
      cy.get('[aria-label="select row 2"]').should('not.be.checked');

      cy.get('[aria-label="grid"]').scrollTo('top');
      cy.get('[aria-label="select row 5"]').should('not.be.checked');
      cy.get('[aria-label="select row 4"]').should('not.be.checked');
      cy.get('[aria-label="select row 3"]').should('not.be.checked');
      cy.get('[aria-label="select row 2"]').should('not.be.checked');

      cy.get('[aria-label="select row 1"]').should('be.checked');
      cy.get('[aria-label="select row 0"]').should('be.checked');
    });
  });
});
