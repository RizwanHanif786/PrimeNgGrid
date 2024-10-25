import { environment } from "src/environments/environment";

describe("Edit Role Feature", () => {
    beforeEach(() => {
        const profile = environment.cypress;
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.intercept( "GET", `${Cypress.env("rolesEndpoint")}*`).as("roles");
        cy.visit("/service/role");
        cy.wait(5000);
    });


    it("should Edit the role by fill out the role detail form, assign permission and save changes", () => {
        cy.wait("@roles").then((interception) => {
            const body = interception.response?.body;
            if (body?.length) {
                const editRoleId = body[0].id;
                cy.get('[data-cy="edit-roles-button"]')
                    .should("be.visible")
                    .eq(0)
                    .click();
                cy.wait(1000);
                cy.url().should(
                    "include",
                    `/service/role/edit/${editRoleId}`
                );
                cy.intercept("GET", `${Cypress.env("rolesMappingEndpoint")}*`).as("rolesMapping");
                cy.wait(5000);  
                const roleName = 'Modified user'
                const description = 'modified description'
                cy.wait(3000)
                cy.get('[data-cy="edit-role-name"]').should("be.visible").clear().type(roleName, { force: true })
                cy.get('[data-cy="edit-role-description"]').should("be.visible").clear().type(description, { force: true });  
        
                cy.intercept("PATCH", `${Cypress.env("rolesEndpoint")}/${editRoleId}*`).as("updateRole");
                cy.get('[data-cy="edit-role-save-button"]').click();
                cy.wait("@updateRole").then((interception: any) => {
                    if (interception.request.body) {
                        const payload = interception.request.body;
                        expect(payload?.customerId).to.exist;
                        expect(payload?.modified).to.exist;
                        expect(payload?.id).to.exist;
                        expect(payload?.name).to.eq(roleName);
                        expect(payload?.description).to.eq(description);
                        expect(payload?.GuiVisibilities).to.have.length;
                    }
                    if (interception.response.body) {
                        const response = interception.response.body;
                        expect(response?.customerId).to.exist;
                        expect(response?.created).to.exist;
                        expect(response?.modified).to.exist;
                        expect(response?.name).to.eq(roleName);
                        expect(response?.description).to.eq(description);
                        expect(response?.id).to.exist;
                        expect(response?.GuiVisibilities).to.have.length;
                    }
                });
               
            }
        });
    });


});
