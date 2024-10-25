import { environment } from "src/environments/environment";

describe("Delete IVR Feature", () => {
    beforeEach(() => {
        const profile = environment.cypress;
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.intercept('GET', `${Cypress.env('ivrsEndpoint')}*`).as('refreshedIvrs');
        cy.visit('/service/ivr');
        cy.wait(5000);
    });

    

    it("should delete the existing ivrs", () => {
        cy.wait("@refreshedIvrs").then((interception) => {
            const body = interception.response?.body;
            if (body?.length) {
                const ivrId = body[body.length - 1].id;
                cy.get('[data-cy="delete-ivr-button"]')
                    .should("be.visible")
                    .eq(body.length - 1)
                    .click();
                cy.wait(1000);
                cy.url().should(
                    "include",
                    `/service/ivr/delete/${ivrId}`
                ); 
                cy.wait(1000)
                cy.get('[data-cy="page_title"]')
                .should("be.visible")
                .and("contain.text", "Delete Voice Menu");
        
                cy.intercept("DELETE", `${Cypress.env("ivrsEndpoint")}/${ivrId}*`).as("deleteIVR");
                cy.get('[data-cy="remove-ivr-button"]').click();
                cy.wait("@deleteIVR").then((interception: any) => {
                    if (interception.request.body) {
                        const decodedParams = JSON.parse(interception.request.query.filter);
                        expect(decodedParams.access_token).to.exist;
                    }
                    if (interception.response.body) {
                        const response = interception.response.body;
                        expect(response.count).to.eq(1);
                        cy.url().should("include", `/service/ivr`);                      
                    }
                });

            }
        });
    });


});
