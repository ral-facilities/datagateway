describe('ISIS - Investigations Table', () => {
  beforeEach(() => {
    cy.login('root', 'pw');
    cy.visit('/browse/instrument/1/facilityCycle/14/investigation');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('[role="gridcell"] a').first().click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/14/investigation/87/dataset'
    );
  });

  // Not enough investigations to test scrolling.
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  it('should be able to resize a column', () => {
    let columnWidth = 0;

    cy.window()
      .then((window) => {
        const windowWidth = window.innerWidth;
        columnWidth = (windowWidth - 40 - 40) / 8;
      })
      .then(() => expect(columnWidth).to.not.equal(0));

    cy.get('[role="columnheader"]').eq(2).as('titleColumn');
    cy.get('[role="columnheader"]').eq(3).as('visitColumn');

    cy.get('@titleColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('@visitColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 200 })
      .trigger('mouseup');

    cy.get('@titleColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.greaterThan(columnWidth);
    });

    cy.get('@visitColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.lessThan(columnWidth);
    });

    // table width should grow if a column grows too large
    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 800 })
      .trigger('mouseup');

    cy.get('@visitColumn').should(($column) => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.equal(84);
    });

    cy.get('[aria-label="grid"]').then(($grid) => {
      const { width } = $grid[0].getBoundingClientRect();
      cy.window().should(($window) => {
        expect(width).to.be.greaterThan($window.innerWidth);
      });
    });
  });

  describe('should be able to sort by', () => {
    it('ascending order', () => {
      cy.contains('[role="button"]', 'Title').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Series toward yes cost analysis. Name town other state action like. Culture fill either collection phone. Space few should lawyer various quite today well.'
      );
    });

    it('descending order', () => {
      cy.contains('[role="button"]', 'Title').click();
      cy.contains('[role="button"]', 'Title').click();

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Series toward yes cost analysis. Name town other state action like. Culture fill either collection phone. Space few should lawyer various quite today well.'
      );
    });

    it('no order', () => {
      cy.contains('[role="button"]', 'Title').click();
      cy.contains('[role="button"]', 'Title').click();
      cy.contains('[role="button"]', 'Title').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Series toward yes cost analysis. Name town other state action like. Culture fill either collection phone. Space few should lawyer various quite today well.'
      );
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Start Date').click();
      cy.contains('[role="button"]', 'Title').click();
      cy.contains('[role="button"]', 'Visit ID').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Series toward yes cost analysis. Name town other state action like. Culture fill either collection phone. Space few should lawyer various quite today well.'
      );
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Title"]').find('input').type('series');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains('15');
    });

    it('date between', () => {
      cy.get('[aria-label="Start Date date filter from"]').type('2006-08-05');

      cy.get('[aria-label="Start Date date filter to"]')
        .parent()
        .find('button')
        .click();

      cy.get('.MuiPickersDay-day[tabindex="0"]').first().click();

      cy.contains('OK').click();

      const date = new Date();
      date.setDate(1);

      cy.get('[aria-label="Start Date date filter to"]').should(
        'have.value',
        date.toISOString().slice(0, 10)
      );

      cy.get('[aria-rowcount="1"]').should('not.exist');
      cy.contains(
        'Series toward yes cost analysis. Name town other state action like. Culture fill either collection phone. Space few should lawyer various quite today well.'
      ).should('not.exist');
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Title"]').find('input').type('series');

      cy.get('[aria-label="Filter by Visit ID"]').find('input').type('15');

      cy.get('[aria-rowcount="1"]').should('exist');
    });
  });

  describe('should be able to view details', () => {
    beforeEach(() => {
      // Check that we have received the size from the API as this will produce
      // a re-render which can prevent the click.
      cy.contains('[aria-rowindex="1"] [aria-colindex="7"]', '11.06 GB').should(
        'exist'
      );
    });

    it('when not other row is showing details', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('#details-panel').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    // Cannot test showing details when another row is showing details
    // as well since we are currently limited to 1 investigation to test.

    it('and view investigation details, users, samples and publications', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('[aria-controls="investigation-details-panel"]').should(
        'be.visible'
      );

      cy.get('#details-panel')
        .contains(
          'Most within thus represent stock entire. Shoulder table board. Tax step street early either third life. Edge building say wife use upon. If half true media matter Mr. Still support shake.'
        )
        .should('be.visible');

      cy.get('[aria-controls="investigation-users-panel"]').should(
        'be.visible'
      );
      cy.get('[aria-controls="investigation-users-panel"]').click();

      cy.get('#details-panel').contains('Michelle228').should('be.visible');

      cy.get('[aria-controls="investigation-samples-panel"]').should(
        'be.visible'
      );
      cy.get('[aria-controls="investigation-samples-panel"]').click();

      cy.get('#details-panel').contains('SAMPLE 87').should('be.visible');

      cy.get('[aria-controls="investigation-publications-panel"]').should(
        'be.visible'
      );
      cy.get('[aria-controls="investigation-publications-panel"]').click();

      cy.get('#details-panel')
        .contains(
          'Follow team before this. Beat likely soldier anyone. By management look activity economic plant others. Take move turn pay. Walk project charge against sell.'
        )
        .should('be.visible');
    });

    it('and then not view details anymore', () => {
      cy.get('[aria-label="Show details"]').first().click();

      cy.get('[aria-label="Hide details"]').first().click();

      cy.get('#details-panel').should('not.exist');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });
});
