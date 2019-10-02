declare namespace Cypress {
  interface Chainable<Subject> {
    login(
      username: string,
      password: string
    ): Cypress.Chainable<Cypress.Response>;
  }
}
