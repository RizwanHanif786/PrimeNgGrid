import { environment } from "src/environments/environment";

describe("Delete User Feature", () => {
    beforeEach(() => {
        const profile = environment.cypress;
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.intercept("GET", `${Cypress.env("usersEndpoint")}*`).as("refreshedUsers");
        cy.visit("/service/user");
        cy.wait(5000);
    });

    it("should delete the existing user", () => {
        cy.wait("@refreshedUsers").then((interception) => {
            const body = interception.response?.body;
            if (body?.length) {
                const userId = body[body.length - 1].id;
                cy.get('[data-cy="delete-users-button"]')
                    .eq(body.length - 2)
                    .click();
                cy.wait(1000);
                cy.url().should(
                    "include",
                    `/service/user/delete/${userId}`
                );
                cy.wait(1000)
                cy.get('[data-cy="page_title"]')
                    .should("be.visible")
                    .and("contain.text", "Remove User");

                cy.intercept("DELETE", `${Cypress.env("usersEndpoint")}/${userId}*`).as("deleteUser");
                cy.get('[data-cy="remove-user-button"]').click();
                cy.wait("@deleteUser").then((interception: any) => {
                    if (interception.request.body) {
                        const decodedParams = JSON.parse(interception.request.query.filter);
                        expect(decodedParams.access_token).to.exist;
                    }
                    if (interception.response.body) {
                        const response = interception.response.body;
                        expect(response.count).to.eq(1);
                        cy.url().should("include", `/service/user`);
                    }
                });

            }
        });
    });


});
