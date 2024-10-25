import { environment } from "src/environments/environment";

describe("Delete Whitelist Feature", () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(2000);
        cy.intercept("GET", `${Cypress.env("whitelistsEndpoint")}*`).as("refreshedWhitelists");
        cy.visit("/service/routing/whitelist");
        cy.wait(5000);
    });


    if (profile.username == 'sadmin') {

        it("should delete an existing whitelist and navigate to whitelist screen", () => {
            cy.wait("@refreshedWhitelists").then((interception:any) => {
                console.log(interception, 'interception')
                const body = interception.response.body;
                console.log(body, 'body')
                if (body?.length) {
                const editWhitelistId = body[body.length - 1].id;
                cy.get('[data-cy="edit-whitelist-button"]').eq(body.length - 1).click({ force: true });
                cy.wait(1000);
                cy.url().should(
                    "include",
                    `/service/routing/whitelist/edit/${editWhitelistId}`
                );
                cy.wait(5000);
                cy.get('[data-cy="page_title"]')
                    .should("be.visible")
                    .and("contain.text", "Edit WhiteList");

                cy.get('[data-cy="edit-whitelist-release-button"]').click({ force: true, });
                cy.url().should(
                    "include",
                    `/service/routing/whitelist/delete/${editWhitelistId}`
                );

                cy.get('[data-cy="page-title"]')
                    .should("be.visible")
                    .and("contain.text", "Delete Whitelist");

                cy.intercept("DELETE", `${Cypress.env("whitelistsEndpoint")}/${editWhitelistId}*`).as("deleteWhitelist");
                cy.get('[data-cy="remove-whitelist-button"]').should("be.visible").click();
                cy.wait("@deleteWhitelist").then((interception: any) => {
                    if (interception.request.query.filter) {
                        const decodedParams = JSON.parse(interception.request.query.filter);
                        expect(decodedParams.access_token).to.exist;
                    }
                    if (interception.response.body) {
                        const response = interception.response.body;
                        expect(response.count).to.eq(1);
                        cy.url().should("include", `/service/routing/whitelist`);
                    }
                });
            }   
            });
        });
    }

});
