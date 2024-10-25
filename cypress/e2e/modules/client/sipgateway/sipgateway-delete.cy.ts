import { environment } from "src/environments/environment";

describe("Delete SIP Gateway Feature", () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.intercept("GET", `${Cypress.env("sipGatewaysEndpoint")}*`).as("refreshedSipGateways");
        cy.visit("/service/routing/sipgateway");
        cy.wait(5000);
    });

    if (profile.username == 'sadmin') {

        it("should delete an selected sipgateway  and navigate to sipgateway list screen", () => {
            cy.wait("@refreshedSipGateways").then((interception:any) => {
                const body = interception.response.body;
                if (body?.length) {
                    const editSipGatewayId = body[body.length - 1].id;
                    cy.get('[data-cy="edit-sipgateway-button"]').eq(body.length - 1).click({ force: true });
                    cy.wait(1000);
                    cy.url().should(
                        "include",
                        `/service/routing/sipgateway/edit/${editSipGatewayId}`
                    );
                    cy.wait(5000);
                    cy.get('[data-cy="page_title"]')
                        .should("be.visible")
                        .and("contain.text", "Edit SIP Gateway");

                    cy.get('[data-cy="edit-sipgateway-release-button"]').click({ force: true });
                    cy.url().should(
                        "include",
                        `/service/routing/sipgateway/delete/${editSipGatewayId}`
                    );
                    cy.intercept("POST", `${Cypress.env("sipGatewaysEndpoint")}/deleteSipGatewayWithOption*`).as("deleteSipGateway");
                    cy.get('[data-cy="release-sipgateway-button"]').should("be.visible").click();
                    cy.wait("@deleteSipGateway").then((interception: any) => {
                        if (interception.request.body) {
                            const payload = interception.request.body;
                            expect(payload?.id).to.eq(editSipGatewayId)
                        }
                        if (interception.response.body) {
                            const response = interception.response.body.result;
                            expect(response.success).to.eq(true);
                            cy.url().should("include", `/service/routing/sipgateway`);
                        }
                    });
                }
            });
        });
    }

});
