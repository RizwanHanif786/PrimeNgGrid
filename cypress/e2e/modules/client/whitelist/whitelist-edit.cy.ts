import { environment } from "src/environments/environment";

describe("Edit Whitelist Feature", () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(2000);
        cy.intercept("GET", `${Cypress.env("whitelistsEndpoint")}*`).as("refreshedWhitelists");
        cy.visit("/service/routing/whitelist");
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

        it("should edit ip, port, mask, proto, pattern and update whitelist and navigate to whitelist screen", () => {
            const ipAddress = generateRandomFormValues().ipAddress;
            const port = generateRandomFormValues().port;
            const mask = generateRandomFormValues().mask;
            const proto = generateRandomFormValues().proto;
            const pattern = generateRandomFormValues().pattern;
            cy.wait("@refreshedWhitelists").then((interception) => {
                const body = interception.response?.body;
                if (body?.length) {
                const editWhitelistId = body[body.length - 1].id;
                cy.get('[data-cy="edit-whitelist-button"]').eq(body.length - 1).click({ force: true });
                cy.wait(1000);
                cy.url().should(
                    "include",
                    `/service/routing/whitelist/edit/${editWhitelistId}`
                );
                cy.wait(5000);
                cy.get('[data-cy="page_title"]')
                    .should("be.visible")
                    .and("contain.text", "Edit WhiteList");

                cy.wait(3000)
                cy.get('[data-cy="edit-whitelist-ip"]').should("be.visible").clear().type(ipAddress)
                cy.get('[data-cy="edit-whitelist-port"]').should("be.visible").clear().type(port);
                cy.get('[data-cy="edit-whitelist-mask"]').should("be.visible").clear().type(mask);
                cy.get('[data-cy="edit-whitelist-proto"]').should("be.visible").clear().type(proto);
                cy.get('[data-cy="edit-whitelist-pattern"]').should("be.visible").clear().type(pattern);


                cy.intercept("PUT", `${Cypress.env("whitelistsEndpoint")}*`).as("updateWhitelist");
                cy.get('[data-cy="edit-whitelist-save-button"]').should("be.visible").click();
                cy.wait("@updateWhitelist").then((interception: any) => {
                    if (interception.request.body) {
                        const payload = interception.request.body;
                        expect(payload?.ip).to.eq(ipAddress);
                        expect(payload?.mask).to.eq(Number(mask));
                        expect(payload?.pattern).to.eq(pattern);
                        expect(payload?.port).to.eq(Number(port));
                        expect(payload?.proto).to.eq(proto);
                        expect(payload?.id).to.exist;
                    }
                    if (interception.response.body) {
                        const response = interception.response.body;
                        expect(response?.ip).to.eq(ipAddress);
                        expect(response?.mask).to.eq(Number(mask));
                        expect(response?.pattern).to.eq(pattern);
                        expect(response?.port).to.eq(Number(port));
                        expect(response?.proto).to.eq(proto);
                        expect(response?.id).to.eq(interception.request.body.id);
                        cy.url().should("include", `/service/routing/whitelist`);
                    }
                });
            }
            });
        });
    }

});
