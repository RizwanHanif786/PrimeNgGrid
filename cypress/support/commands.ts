declare namespace Cypress {
  interface Chainable {
    login(username: string, password: string): void;
  }
}
Cypress.Commands.add("login", (username, password) => {
    cy.log("username", username);
    cy.log("password", password);
    cy.visit("/");
    cy.wait(5000);
    cy.get('[data-cy="login-username"]').should('be.visible').type(username, {force: true}).should("have.value", username);
    cy.get('[data-cy="login-password"]').should('be.visible').type(password, {force: true}).should("have.value", password);
    cy.intercept("POST", "api/v1/DashUsers/authenticate*").as("authenticate");

    cy.get('[data-cy="login-button"]').click();
    cy.wait("@authenticate").then((interception: any) => {
        if (interception.request.body) {
            const payload = interception.request.body;
            expect(payload.username).to.equal(username);
            expect(payload.password).to.equal(password); 
        }

        if (interception.response) {
            const { customerId, id, userId } = interception.response.body;
            expect(interception.response.statusCode).to.eq(200);
            expect(id).to.exist;
            expect(customerId).to.exist;
            expect(userId).to.exist;
            if(username =='sadmin'){
              expect(customerId).to.exist.and.to.equal(1); 
              expect(userId).to.exist.and.to.equal(1);
            }
        }
        cy.wait(10000);
        cy.url().should("include", "/service/dashboard");
        cy.wait(1000);
    });

});
