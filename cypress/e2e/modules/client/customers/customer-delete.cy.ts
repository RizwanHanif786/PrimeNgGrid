import { environment } from "src/environments/environment";

describe("Delete Customer Feature", () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.intercept("GET", `${Cypress.env("customersEndpoint")}*`).as("refreshedCustomers");
        cy.visit("/service/customer");
        cy.wait(5000);
    });

    if(profile.username == 'sadmin') {

    it("should delete existing customer", () => {
        cy.wait("@refreshedCustomers").then((interception) => {
            const body = interception.response?.body;
            if (body?.length) {
                const customerId = body[body.length - 1].id;
                cy.get('[data-cy="delete-customer-button"]')
                    .should("be.visible")
                    .eq(body.length - 1)
                    .click();
                cy.wait(1000);
                cy.url().should(
                    "include",
                    `/service/customer/delete/${customerId}`
                );
                cy.wait(1000)
                cy.get('[data-cy="page_title"]')
                .should("be.visible")
                .and("contain.text", "Remove Customer");
        

                cy.intercept("DELETE", `${Cypress.env("customersEndpoint")}/${customerId}*`).as("deleteCustomer");
                cy.get('[data-cy="remove-customer"]').click();
                cy.wait(5000)
                cy.url().should("include", `/service/customer`);                      
            }
        });
    });
    }

});
