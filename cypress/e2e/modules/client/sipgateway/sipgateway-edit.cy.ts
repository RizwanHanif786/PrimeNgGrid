import { environment } from "src/environments/environment";

describe("Edit SIP Gateway Feature", () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.intercept("GET", `${Cypress.env("sipGatewaysEndpoint")}*`).as("refreshedSipGateways");
        cy.visit("/service/routing/sipgateway");
        cy.wait(5000);
    });

    function generateRandomFormValues() {
        const generateRandomIP = () => {
            return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
        };
        const generateRandomPort = () => {
            return (Math.floor(Math.random() * (65536 - 5060 + 1)) + 5060).toString()
        };
        const generateRandomSipGatewayName = () => {
            return `SIPGateway-${Math.random().toString(36).substring(2, 7)}`;
        };
        return {
            ipAddress: generateRandomIP(),
            port: generateRandomPort(),
            name: generateRandomSipGatewayName()
        };
    }

    if (profile.username == 'sadmin') {

        it("should edit name, port, address, description, outboundlimit, digiStrip and update sipgateway and navigate to sipgateway list screen", () => {
         
            cy.wait("@refreshedSipGateways").then((interception) => {
                const body = interception.response?.body;
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
                    const name = generateRandomFormValues().name;
                    const address = generateRandomFormValues().ipAddress;
                    const port = generateRandomFormValues().port;
                    const description = "edit sip gateway";
                    const outboundlimit = "4";
                    const digiStrip = "6";  
        
                    cy.wait(3000)
                    cy.get('[data-cy="edit-sipgateway-name"]').should("be.visible").clear().type(name)
                    cy.get('[data-cy="edit-sipgateway-address"]').should("be.visible").clear().type(address);
                    cy.get('[data-cy="edit-sipgateway-port"]').should("be.visible").clear().type(port);
                    cy.get('[data-cy="edit-sipgateway-digit-strip"]').should("be.visible").clear().type(digiStrip);
                    cy.get('[data-cy="edit-sipgateway-description"]').should("be.visible").clear().type(description);
                    cy.get('[data-cy="edit-sipgateway-outbound-limit"]').should("be.visible").clear().type(outboundlimit);
        
                    cy.get('[data-cy="edit-sipgateway-customer-dropdown"]')
                        .should("be.visible")
                        .click();
                    cy.get(".p-dropdown-item").should("be.visible", { force: true });
                    cy.get(".p-dropdown-item").eq(1).click({ force: true });
                    cy.get(".p-dropdown-label").should("contain", "Tech Fusion ITc");


                cy.intercept("PUT", `${Cypress.env("sipGatewaysEndpoint")}*`).as("updateSipGateway");
                cy.get('[data-cy="edit-sipgateway-save-button"]').should("be.visible").click();
                cy.wait("@updateSipGateway").then((interception: any) => {
                    if (interception.request.body) {
                    const payload = interception.request.body;
                    expect(payload?.address).to.eq(address);
                    expect(payload?.digitsStrip).to.eq(Number(digiStrip));
                    expect(payload?.name).to.eq(name);
                    expect(payload?.id).to.eq(editSipGatewayId);
                    expect(payload?.isWhitelisted).to.eq(true);
                    expect(payload?.port).to.eq(Number(port));
                    expect(payload?.customerId).to.eq(1);
                    expect(payload?.description).to.eq(description);
                    expect(payload?.out_channels).to.eq(Number(outboundlimit));
                    }
                    if (interception.response.body) {
                        const response = interception.response.body;
                        expect(response?.address).to.eq(address);
                        expect(response?.digitsStrip).to.eq(Number(digiStrip));
                        expect(response?.name).to.eq(name);
                        expect(response?.isWhitelisted).to.eq(true);
                        expect(response?.port).to.eq(Number(port));
                        expect(response?.customerId).to.eq(1);
                        expect(response?.description).to.eq(description);
                        expect(response?.out_channels).to.eq(Number(outboundlimit));
                        expect(response?.id).to.eq(editSipGatewayId);
                        cy.url().should("include", `/service/routing/sipgateway`);
                    }
                });
            }
            });
        });
    }


  
});
