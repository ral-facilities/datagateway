declare namespace Cypress {
  interface Chainable<Subject> {
    login(
      username: string,
      password: string
    ): Cypress.Chainable<Cypress.Response>;
    clearDownloadCart(): Cypress.Chainable<Cypress.Response>;
    seedDownloadCart(): Cypress.Chainable<Cypress.Response>;
    addCartItem(
      cartItem: string
    ): Cypress.Chainable<Cypress.Response>;
    deleteTestDownload(
      fileName: string
    ): Cypress.Chainable<Cypress.Response>;
  }
}
