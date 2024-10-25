import { environment } from "src/environments/environment";

describe("New Whitelist Feature", () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.visit("/service/routing/whitelist/add");
        cy.wait(5000);
    });

    function generateRandomFormValues() {
        const generateRandomIP = () => {
            return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
        };
        const generateRandomPort = () => {
            return (Math.floor(Math.random() * (65536 - 5060 + 1)) + 5060).toString()
        };
        const generateRandomMask = () => {
            return Math.floor(Math.random() * 120).toString()
        };
        const generateRandomProto = () => {
            const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'ICMP'];
            return protocols[Math.floor(Math.random() * protocols.length)];
        };
        const generateRandomPattern = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let pattern = '';
            for (let i = 0; i < 8; i++) {
                pattern += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return pattern;
        };

        return {
            ipAddress: generateRandomIP(),
            port: generateRandomPort(),
            mask: generateRandomMask(),
            proto: generateRandomProto(),
            pattern: generateRandomPattern(),
        };
    }

    if (profile.username == 'sadmin') {

        it("should display the page title ", () => {
            cy.get('[data-cy="page_title"]')
                .should("be.visible")
                .and("contain.text", "New White List");
        });

        it("should add ipAddress, port, mask, proto, pattern and  create a new whitelist and navigate to whitelists list screen", () => {
            const ipAddress = generateRandomFormValues().ipAddress;
            const port = generateRandomFormValues().port;
            const mask = generateRandomFormValues().mask;
            const proto = generateRandomFormValues().proto;
            const pattern = generateRandomFormValues().pattern;

            cy.wait(3000)
            cy.get('[data-cy="add-whitelist-ip"]').should("be.visible").type(ipAddress)
            cy.get('[data-cy="add-whitelist-port"]').should("be.visible").type(port);
            cy.get('[data-cy="add-whitelist-mask"]').should("be.visible").type(mask);
            cy.get('[data-cy="add-whitelist-proto"]').should("be.visible").type(proto);
            cy.get('[data-cy="add-whitelist-pattern"]').should("be.visible").type(pattern);


            cy.intercept("POST", `${Cypress.env("whitelistsEndpoint")}*`).as("addNewWhitelist");
            cy.get('[data-cy="create-new-whitelist-button"]').should("be.visible").click();
            cy.wait("@addNewWhitelist").then((interception: any) => {
                if (interception.request.body) {
                    const payload = interception.request.body;
                    expect(payload?.ip).to.eq(ipAddress);
                    expect(payload?.mask).to.eq(Number(mask));
                    expect(payload?.pattern).to.eq(pattern);
                    expect(payload?.port).to.eq(Number(port));
                    expect(payload?.proto).to.eq(proto);
                }
                if (interception.response.body) {
                    const response = interception.response.body;
                    expect(response?.ip).to.eq(ipAddress);
                    expect(response?.mask).to.eq(Number(mask));
                    expect(response?.pattern).to.eq(pattern);
                    expect(response?.port).to.eq(Number(port));
                    expect(response?.proto).to.eq(proto);
                    expect(response?.id).to.exist;
                    cy.url().should("include", `/service/routing/whitelist`);
                }
            });
        })

    }
});
