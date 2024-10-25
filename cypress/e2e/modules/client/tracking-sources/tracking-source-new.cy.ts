import { environment } from "src/environments/environment";

describe("New Tracking Source Feature", () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.visit("/service/tracking-source/add");
        cy.wait(5000);
    });

    function generateRandomTrackingSource() {
        const prefixes = ['Track', 'Source', 'Stream', 'Log', 'Trace', 'Monitor', 'Flow', 'Signal', 'Path'];
        const suffixes = ['Data', 'Point', 'Tracker', 'ID', 'Log', 'Source', 'Key', 'Node', 'Flow'];
        
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        return randomPrefix + randomSuffix;
    }       
    
    it("should display the page title ", () => {
        cy.get('[data-cy="page_title"]')
            .should("be.visible")
            .and("contain.text", "New Tracking Source");
    });

    it("should add name & description, select customer, and create a new tracking source and navigate to tracking sources list screen", () => {
        const sourceName = generateRandomTrackingSource();
        const sourceDescription = 'new ts description';
        cy.wait(3000)    
        cy.get('[data-cy="add-tracking-source-name"]').should("be.visible").type(sourceName)
        cy.get('[data-cy="add-tracking-source-description"]').should("be.visible").type(sourceDescription);
       
        if (profile.username == 'sadmin') {
            cy.get('[data-cy="add-tracking-source-customer-dropdown"]')
                .should("be.visible")
                .click();
            cy.get(".p-dropdown-item").should("be.visible", { force: true });
            cy.get(".p-dropdown-item").eq(0).click({ force: true });
            cy.get(".p-dropdown-label").should("contain", "Tech Fusion ITc");
        }
       
        cy.intercept("PUT", `${Cypress.env("trackingSourcesEndpoint")}*`).as(
            "addNewTrackingSource"
        );
        cy.intercept("GET", `${Cypress.env("trackingSourcesEndpoint")}*`).as(
            "trackingSources"
        );
        cy.get('[data-cy="create-new-tracking-source-button"]').should("be.visible").click();

        cy.wait('@trackingSources').then((intercep) => {
            console.log(intercep, 'intercep')
        if(!intercep.response?.body?.length) {           
        cy.wait("@addNewTrackingSource").then((interception: any) => {
            if (interception.request.body) {
                const payload = interception.request.body;
                expect(payload.customerId).to.exist;
                expect(payload.name).to.eq(sourceName);
                expect(payload.type).to.exist;
                expect(payload.description).to.eq(sourceDescription);
            }
            if (interception.response.body) {
                const response = interception.response.body;
                if (response.error) {
                    expect(response.error.statusCode).to.eq("422");
                    expect(response.error.name).to.eq("Error");
                    expect(response.error.code).to.eq("ER_DUP_ENTRY");
                } else {
                    expect(response.customerId).to.eq(interception.request.body.customerId);
                    expect(response.id).to.exist;
                    expect(response.name).to.eq(sourceName);
                    expect(response.type).to.exist;
                    expect(response.description).to.eq(sourceDescription);
                    cy.url().should("include", `/service/tracking-source`);
                }
            }
        });
    }
    })
    });
});
