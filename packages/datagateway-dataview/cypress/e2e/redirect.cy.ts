describe('Redirect', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('DOI Redirect', () => {
    it('should redirect to correct page if valid id', () => {
      cy.visit('/doi-redirect/LILS/investigation/8');

      cy.url().should(
        'include',
        '/browse/instrument/2/facilityCycle/8/investigation/8/dataset'
      );
    });

    it('should redirect to login if redirect request errors', () => {
      cy.visit('/doi-redirect/LILS/investigation/100000000000');

      cy.url().should('include', '/login');
    });

    it('should redirect to homepage if redirect request errors when logged in', () => {
      cy.login({ username: 'root', password: 'pw', mechanism: 'simple' });
      cy.visit('/doi-redirect/LILS/investigation/100000000000');

      cy.url().should('include', '/datagateway');
    });
  });

  describe('Generic Redirect', () => {
    it('should redirect to correct page given a redirect URL (DLS visit id redirect)', () => {
      cy.visit('/redirect/DLS/investigation/visitId/70');

      cy.url().should(
        'include',
        '/browse/proposal/INVESTIGATION%201/investigation/1/dataset'
      );
    });

    it('should redirect to login if redirect request errors', () => {
      cy.visit('/redirect/DLS/investigation/visitId/INVALID');

      cy.url().should('include', '/login');
    });

    it('should redirect to homepage if redirect request errors when logged in', () => {
      cy.login({ username: 'root', password: 'pw', mechanism: 'simple' });
      cy.visit('/redirect/DLS/investigation/visitId/INVALID');

      cy.url().should('include', '/datagateway');
    });
  });
});
