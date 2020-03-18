describe('ISIS - FacilityCycles Table', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.visit('/browse/instrument/1/facilityCycle');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click a facility cycle to see its investigations', () => {
    cy.get('[role="gridcell"] a')
      .first()
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/14/investigation'
    );
  });

  // Not enough data in facility cycles to load.
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  it('should be able to resize a column', () => {
    let columnWidth = 0;

    cy.window()
      .then(window => {
        const windowWidth = window.innerWidth;
        columnWidth = windowWidth / 4;
      })
      .then(() => expect(columnWidth).to.not.equal(0));

    cy.get('[role="columnheader"]')
      .eq(0)
      .as('titleColumn');
    cy.get('[role="columnheader"]')
      .eq(1)
      .as('descriptionColumn');

    cy.get('@titleColumn').should($column => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('@descriptionColumn').should($column => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 400 })
      .trigger('mouseup');

    cy.get('@titleColumn').should($column => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.greaterThan(columnWidth);
    });

    cy.get('@descriptionColumn').should($column => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.lessThan(columnWidth);
    });
  });

  describe('should be able to sort by', () => {
    it('ascending order', () => {
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Down free attention recognize travel. Life newspaper anyone father same you. Especially participant discussion night common smile term.'
      );
    });

    it('descending order', () => {
      cy.contains('[role="button"]', 'Name').click();
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Down free attention recognize travel. Life newspaper anyone father same you. Especially participant discussion night common smile term.'
      );
    });

    it('no order', () => {
      cy.contains('[role="button"]', 'Name').click();
      cy.contains('[role="button"]', 'Name').click();
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.be.visible');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Down free attention recognize travel. Life newspaper anyone father same you. Especially participant discussion night common smile term.'
      );
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Start Date').click();
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Many last prepare small. Maintain throw hope parent.\nEntire soon option bill fish against power.\nRather why rise month shake voice.'
      );
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Name"]')
        .find('input')
        .type('2010');

      cy.get('[aria-rowcount="2"]').should('exist');
      cy.get('[aria-rowindex="2"] [aria-colindex="2"]').contains(
        'Movie hour together plan near approach. Body drive today ever after much war. List idea billion health pressure.'
      );
    });

    it('date between', () => {
      cy.get('[aria-label="Start Date date filter from"]').type('2010-04-02');

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

      cy.get('[aria-rowcount="7"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains(
        'Down free attention recognize travel. Life newspaper anyone father same you. Especially participant discussion night common smile term.'
      );
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Name"]')
        .find('input')
        .type('3');

      cy.get('[aria-label="Filter by Description"]')
        .find('input')
        .type('Call');

      cy.get('[aria-rowcount="1"]').should('exist');
    });
  });
});
