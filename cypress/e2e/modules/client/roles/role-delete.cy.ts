import { environment } from "src/environments/environment";

describe("Delete Role Feature", () => {
    beforeEach(() => {
        const profile = environment.cypress;
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.intercept( "GET", `${Cypress.env("rolesEndpoint")}*`).as("roles");
        cy.visit("/service/role");
        cy.wait(5000);
    });


    it("should delete the existing role", () => {
        cy.wait("@roles").then((interception) => {
            const body = interception.response?.body;
            if (body?.length) {
                const roleId = body[body.length-1].id;
                cy.get('[data-cy="delete-roles-button"]')
                    .should("be.visible")
                    .eq(body.length-1)
                    .click();
                cy.wait(1000);
                cy.url().should(
                    "include",
                    `/service/role/delete/${roleId}`
                );
                cy.wait(1000)
                cy.get('[data-cy="page_title"]')
                .should("be.visible")
                .and("contain.text", "Remove Role");
        
                cy.intercept("DELETE", `${Cypress.env("rolesEndpoint")}/${roleId}*`).as("deleteRole");
                cy.get('[data-cy="remove-role-button"]').click();
                cy.wait("@deleteRole").then((interception: any) => {
                    if (interception.request.body) {
                        const decodedParams = JSON.parse(interception.request.query.filter);
                        expect(decodedParams.access_token).to.exist;
                    }
                    if (interception.response.body) {
                        const response = interception.response.body;
                        expect(response.count).to.eq(1);
                        cy.url().should("include", `/service/role`);                      
                    }
                });
               
            }
        });
    });


});
