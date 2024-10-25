import { environment } from "src/environments/environment";

describe("Edit Tracking Source Feature", () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.intercept("GET", `${Cypress.env("trackingSourcesEndpoint")}/tracking_sources*`).as("refreshedTrackingSources");
        cy.visit("/service/tracking-source");
        cy.wait(5000);
    });

    function generateRandomTrackingSource() {
        const prefixes = ['Track', 'Source', 'Stream', 'Log', 'Trace', 'Monitor', 'Flow', 'Signal', 'Path'];
        const suffixes = ['Data', 'Point', 'Tracker', 'ID', 'Log', 'Source', 'Key', 'Node', 'Flow'];

        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        return randomPrefix + randomSuffix;
    }

    it("should edit name & description, select customer, and update tracking source and navigate to tracking sources list screen", () => {
        cy.wait("@refreshedTrackingSources").then((interception:any) => {
            const body = interception.response.body.data;
            if(body?.length) {
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

            const sourceName = generateRandomTrackingSource();
            const sourceDescription = 'new ts description';
            cy.wait(3000)
            cy.get('[data-cy="edit-tracking-source-name"]').should("be.visible").clear().type(sourceName)
            cy.get('[data-cy="edit-tracking-source-description"]').should("be.visible").clear().type(sourceDescription);

            if (profile.username == 'sadmin') {
                cy.get('[data-cy="edit-tracking-source-customer-dropdown"]')
                    .should("be.visible")
                    .click();
                cy.get(".p-dropdown-item").should("be.visible", { force: true });
                cy.get(".p-dropdown-item").eq(0).click({ force: true });
                cy.get(".p-dropdown-label").should("contain", "Tech Fusion ITc");
            }

            cy.intercept("PUT", `${Cypress.env("trackingSourcesEndpoint")}*`).as(
                "updateTrackingSource"
            );
            cy.intercept("GET", `${Cypress.env("trackingSourcesEndpoint")}*`).as(
                "trackingSources"
            );
            cy.get('[data-cy="edit-tracking-source-save-button"]').should("be.visible").click();

            cy.wait('@trackingSources').then((intercep) => {
                console.log(intercep, 'intercep')
                if (!intercep.response?.body?.length) {
                    cy.wait("@updateTrackingSource").then((interception: any) => {
                        if (interception.request.body) {
                            const payload = interception.request.body;
                            expect(payload.customerId).to.exist;
                            expect(payload.name).to.eq(sourceName);
                            expect(payload.type).to.exist;
                            expect(payload.description).to.eq(sourceDescription);
                        }
                        if (interception.response.body) {
                            const response = interception.response.body;
                            expect(response.customerId).to.exist;
                            expect(response.id).to.exist;
                            expect(response.name).to.eq(sourceName);
                            expect(response.type).to.exist;
                            expect(response.description).to.eq(sourceDescription);
                            cy.url().should("include", `/service/tracking-source`);
                        }
                    });
                }
            })
        }
        });
    });
});
