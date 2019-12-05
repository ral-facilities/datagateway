describe('ISIS - Datafiles Table', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.visit(
      '/browse/instrument/1/facilityCycle/14/investigation/87/dataset/118/datafile'
    );
    cy.server();
    cy.route('**/datafiles*').as('getDatafiles');
    cy.route('**/datafiles/count*').as('getDatafileCount');
    cy.route('**/datafiles*&distinct="ID"').as('getAllIds');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Table');
    cy.get('#datagateway-table').should('be.visible');
  });

  it('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="55"]').should('exist');
  });

  it('should be able to resize a column', () => {
    let columnWidth = 0;

    cy.window()
      .then(window => {
        const windowWidth = window.innerWidth;
        columnWidth = (windowWidth - 40 - 40 - 70) / 4;
      })
      .then(() => expect(columnWidth).to.not.equal(0));

    cy.get('[role="columnheader"]')
      .eq(2)
      .as('nameColumn');
    cy.get('[role="columnheader"]')
      .eq(3)
      .as('locationColumn');

    cy.get('@nameColumn').should($column => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('@locationColumn').should($column => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.equal(columnWidth);
    });

    cy.get('.react-draggable')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 400 })
      .trigger('mouseup');

    cy.get('@nameColumn').should($column => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.greaterThan(columnWidth);
    });

    cy.get('@locationColumn').should($column => {
      const { width } = $column[0].getBoundingClientRect();
      expect(width).to.be.lessThan(columnWidth);
    });
  });

  describe('should be able to sort by', () => {
    it('ascending order', () => {
      cy.get('[role="button"]')
        .contains('Location')
        .click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
        '/ability/save/time.png'
      );
    });

    it('descending order', () => {
      cy.contains('[role="button"]', 'Location').click();
      cy.contains('[role="button"]', 'Location').click();

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc')
        .eq(1)
        .should('not.have.css', 'opacity', '0');
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
        '/worry/anything/able.bmp'
      );
    });

    it('multiple columns', () => {
      cy.contains('[role="button"]', 'Modified Time').click();
      cy.contains('[role="button"]', 'Name').click();
      cy.contains('[role="button"]', 'Name').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Datafile 13529'
      );
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Location"]')
        .find('input')
        .type('sea');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Datafile 17361'
      );
    });

    it('date between', () => {
      cy.get('[aria-label="Modified Time date filter from"]').type(
        '2018-08-12'
      );

      cy.get('[aria-label="Modified Time date filter to"]')
        .parent()
        .find('button')
        .click();

      cy.get('.MuiPickersDay-day[tabindex="0"]')
        .first()
        .click();

      cy.contains('OK').click();

      let date = new Date();
      date.setDate(1);

      cy.get('[aria-label="Modified Time date filter to"]').should(
        'have.value',
        date.toISOString().slice(0, 10)
      );

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Datafile 7302'
      );
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Name"]')
        .find('input')
        .type('5');

      cy.get('[aria-label="Filter by Location"]')
        .find('input')
        .type('.png');

      cy.get('[aria-rowcount="4"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="3"]').contains(
        'Datafile 5865'
      );
    });
  });

  describe('should be able to view details', () => {
    it('when no other row is showing details', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.contains('Name: Datafile 117').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    it('when another other row is showing details', () => {
      cy.get('[aria-label="Show details"]')
        .eq(1)
        .click();

      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.contains('Name: Datafile 117').should('be.visible');
      cy.contains('Name: Datafile 3470').should('not.be.visible');
      cy.get('[aria-label="Hide details"]').should('have.length', 1);
    });

    it('and view datafile details and parameters', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.get('[aria-controls="datafile-details-panel"]').should('be.visible');

      cy.contains(
        'Description: Remember word economic catch. After television scene alone.\nPartner send rise your. Exist room long success financial. Help itself culture money child realize take rise.'
      ).should('be.visible');

      cy.get('[aria-controls="datafile-parameters-panel"]').should(
        'be.visible'
      );
      cy.get('[aria-controls="datafile-parameters-panel"]').click();

      cy.contains('PARAMETERTYPE 42: accept410').should('be.visible');
    });

    it('and then not view details anymore', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.get('[aria-label="Hide details"]')
        .first()
        .click();

      cy.contains('Name: Datafile 117').should('not.be.visible');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });

  describe('should be able to select items', () => {
    beforeEach(() => {
      cy.clearDownloadCart();
    });

    it('individually', () => {
      cy.wait(['@getDatafiles', '@getAllIds']);
      cy.get('[aria-label="select row 0"]').check();
      cy.get('[aria-label="select row 0"]').should('be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'true');
    });

    it('and unselect them individually', () => {
      cy.wait(['@getDatafiles', '@getAllIds']);
      cy.get('[aria-label="select row 0"]').check();
      cy.get('[aria-label="select row 0"]').should('be.checked');

      cy.get('[aria-label="select row 0"]').uncheck();
      cy.get('[aria-label="select row 0"]').should('not.be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');
    });

    it('by all items', () => {
      cy.wait(['@getDatafiles', '@getAllIds']);
      cy.get('[aria-label="select all rows"]').check();
      cy.get('[aria-label="select all rows"]').should('be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');
      cy.get(
        `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
      ).should('be.checked');

      cy.get('[aria-label="grid"]').scrollTo('bottom');
      cy.wait('@getDatafiles');
      cy.get('[aria-label="grid"]').scrollTo('bottom');
      cy.get(`[aria-label="select row 54"]`).should('be.checked');
      cy.get('[aria-label="select all rows"]').check();
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');
    });

    it('by all items in a filtered table', () => {
      cy.wait('@getDatafiles');
      cy.get('[aria-label="Filter by Location"]')
        .find('input')
        .type('e');

      cy.wait(['@getDatafiles', '@getAllIds']);

      cy.get('[aria-label="select all rows"]').check();
      cy.get('[aria-label="select all rows"]').should('be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');
      cy.get(
        `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
      ).should('be.checked');

      cy.get('[aria-label="Filter by Location"]')
        .find('input')
        .clear();

      cy.wait(['@getDatafiles', '@getAllIds']);
      cy.get('[aria-label="select all rows"]').should('not.be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'true');

      cy.get('[aria-label="select row 0"]').should('be.checked');
      cy.get('[aria-label="select row 1"]').should('be.checked');
      cy.get('[aria-label="select row 2"]').should('not.be.checked');
      cy.get('[aria-label="select row 3"]').should('not.be.checked');

      cy.get('[aria-label="grid"]').scrollTo('bottom');
      cy.wait('@getDatafiles');
      cy.get('[aria-label="grid"]').scrollTo('bottom');
      cy.get('[aria-label="select row 53"]').should('not.be.checked');
      cy.get('[aria-label="select row 54"]').should('be.checked');
    });

    it('and unselect all items', () => {
      cy.wait('@getDatafiles');
      cy.get('[aria-label="grid"]').scrollTo('bottom');
      cy.wait('@getDatafiles');
      cy.get('[aria-label="grid"]').scrollTo('bottom');

      cy.get('[aria-label="select all rows"]').check();
      cy.get('[aria-label="select all rows"]').should('be.checked');

      cy.reload();
      cy.wait(['@getDatafiles', '@getAllIds']);

      cy.get('[aria-label="select all rows"]').should('be.checked');
      cy.get('[aria-label="select all rows"]').uncheck();
      cy.get('[aria-label="select all rows"]').should('not.be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');
      cy.get(
        `[aria-label="select row ${Math.floor(Math.random() * 10)}"]`
      ).should('not.be.checked');

      cy.get('[aria-label="grid"]').scrollTo('bottom');
      cy.wait('@getDatafiles');
      cy.get('[aria-label="grid"]').scrollTo('bottom');
      cy.get(`[aria-label="select row 55"]`).should('not.be.checked');
      cy.get('[aria-label="select all rows"]').should('not.be.checked');
      cy.get('[aria-label="select all rows"]')
        .should('have.attr', 'data-indeterminate')
        .and('eq', 'false');
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
      cy.get('[aria-label="select row 2"]').click();
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
