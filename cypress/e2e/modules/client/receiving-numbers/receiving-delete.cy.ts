import { environment } from "src/environments/environment";

describe("Delete Receiving Number Feature", () => {
    const profile = environment.cypress;

    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.intercept("GET", `${Cypress.env("receivingNumbersEndpoint")}/receiving_numbers*`).as("receivingNumbers");
        cy.visit("/service/routing/receiving");
        cy.wait(5000);
    });


    it("should delete the selected receiving number", () => {
        cy.wait("@receivingNumbers").then((interception) => {
            const body = interception.response?.body;
            if(body?.length){
            const editReceivingId = body[0].id;
            cy.get('[data-cy="edit-receiving-number-button"]')
                .should("be.visible")
                .eq(0)
                .click();
            cy.wait(1000);
            cy.url().should(
                "include",
                `/service/routing/receiving/edit/${editReceivingId}`
            );
            cy.wait(5000);

            cy.get('[data-cy="page-title"]')
                .should("be.visible")
                .and("contain.text", "Edit Receiving Number");
            cy.get('[data-cy="edit-receiving-number-release-button"]').click({ force: true, });

            cy.url().should(
                "include",
                `/service/routing/receiving/delete/${editReceivingId}`
            );

            cy.get('[data-cy="page-title"]')
                .should("be.visible")
                .and("contain.text", "Release Receiving Number");


            cy.intercept("DELETE", `${Cypress.env("receivingNumbersEndpoint")}/${editReceivingId}*`).as("deleteReceiving");
            cy.get('[data-cy="release-receiving-number-button"]').click();

            cy.wait("@deleteReceiving").then((interception: any) => {
                if (interception.request.body) {
                    const payload = interception.request.body;
                }
                if (interception.response.body) {
                    const response = interception.response.body;
                    if (response.error) {
                        if (response.error.statusCode == 500) {
                            expect(response.error.statusCode).to.eq(500);
                            expect(response.error.code).to.eq("ER_ROW_IS_REFERENCED_2");
                        }
                    } else {
                        expect(response.count).to.eq(1);
                        cy.url().should("include", `/service/routing/receiving`);
                    }
                }
            });
        };
        });
    });


});
