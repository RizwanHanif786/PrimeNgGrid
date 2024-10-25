import { environment } from "src/environments/environment";

describe("Delete Tracking Source Feature", () => {
    const profile = environment.cypress;

    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.intercept("GET", `${Cypress.env("trackingSourcesEndpoint")}/tracking_sources*`).as("refreshedTrackingSources");
        cy.visit("/service/tracking-source");
        cy.wait(5000);
    });

    it("should delete the selected tracking source", () => {
        cy.wait("@refreshedTrackingSources").then((interception:any) => {
            const body = interception.response.body.data;
            if (body?.length) {
            const editTrackingSourceId = body[body.length - 1].id;
            cy.get('[data-cy="edit-tracking-source-button"]').eq(body.length - 1).click({ force: true });
            cy.wait(1000);
            cy.url().should(
                "include",
                `/service/tracking-source/edit/${editTrackingSourceId}`
            );
            cy.wait(5000);
            cy.get('[data-cy="page_title"]')
                .should("be.visible")
                .and("contain.text", "Edit Tracking Source");

            cy.get('[data-cy="edit-tracking-source-release-button"]').click({ force: true, });

            cy.url().should(
                "include",
                `/service/tracking-source/delete/${editTrackingSourceId}`
            );


            cy.intercept("POST", `${Cypress.env("trackingSourcesEndpoint")}/deleteSourceWithOption*`).as("deleteTrackingSource");
            cy.get('[data-cy="release-tracking-source-button"]').click();

            cy.wait("@deleteTrackingSource").then((interception: any) => {
                if (interception.request.body) {
                    const payload = interception.request.body;
                    expect(payload.id).to.eq(editTrackingSourceId)
                    expect(payload.actionType).to.exist
                }
                if (interception.response.body) {
                    const response = interception.response.body.result;
                    expect(response.success).to.eq(true);
                    cy.url().should("include", `/service/tracking-source`);
                }
            });
        };
        });
        
    });


});
