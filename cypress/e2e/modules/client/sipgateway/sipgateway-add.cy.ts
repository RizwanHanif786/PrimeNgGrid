import { environment } from "src/environments/environment";

describe("New SIP Gateway Feature", () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.visit("/service/routing/sipgateway/add");
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

        it("should display the page title ", () => {
            cy.get('[data-cy="page_title"]')
                .should("be.visible")
                .and("contain.text", "New SIP Gateway");
        });

        it("should add name, port, address, description, outboundlimit, digiStrip and  create a new sipgateway and navigate to sipgateway list screen", () => {
            const name = generateRandomFormValues().name;
            const address = generateRandomFormValues().ipAddress;
            const port = generateRandomFormValues().port;
            const description = "new sip gateway";
            const outboundlimit = "2";
            const digiStrip = "8";

            cy.wait(3000)
            cy.get('[data-cy="add-sipgateway-name"]').should("be.visible").type(name)
            cy.get('[data-cy="add-sipgateway-address"]').should("be.visible").type(address);
            cy.get('[data-cy="add-sipgateway-port"]').should("be.visible").type(port);
            cy.get('[data-cy="add-sipgateway-digit-strip"]').should("be.visible").type(digiStrip);
            cy.get('[data-cy="add-sipgateway-description"]').should("be.visible").type(description);
            cy.get('[data-cy="add-sipgateway-outbound-limit"]').should("be.visible").type(outboundlimit);

            cy.get('[data-cy="add-sipgateway-customer-dropdown"]')
                .should("be.visible")
                .click();
            cy.get(".p-dropdown-item").should("be.visible", { force: true });
            cy.get(".p-dropdown-item").eq(1).click({ force: true });
            cy.get(".p-dropdown-label").should("contain", "Tech Fusion ITc");


            cy.intercept("POST", `${Cypress.env("sipGatewaysEndpoint")}*`).as("addNewSipgateway");
            cy.get('[data-cy="add-sipgateway-create-button"]').should("be.visible").click();
            cy.wait("@addNewSipgateway").then((interception: any) => {
                if (interception.request.body) {
                    const payload = interception.request.body;
                    expect(payload?.address).to.eq(address);
                    expect(payload?.digitsStrip).to.eq(Number(digiStrip));
                    expect(payload?.name).to.eq(name);
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
                    expect(response?.id).to.exist;
                    cy.url().should("include", `/service/routing/sipgateway`);
                }
            });
        })

    }
});
