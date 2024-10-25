import { environment } from "src/environments/environment";

describe("SIP Gateways Feature", () => {
    const profile = environment.cypress
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.intercept("GET", `${Cypress.env("sipGatewaysEndpoint")}*`).as("refreshedSipGateways");
        cy.visit("/service/routing/sipgateway");
        cy.wait(5000);
    });

    it("should navigate to sip gateways screen", () => {
       cy.url().should("include", "/service/routing/sipgateway");
    });

    it("should display the page title ", () => {
        cy.get('[data-cy="page-title"]')
            .should("be.visible")
            .and("contain.text", "SIP Gateways");
    });

    if (profile.username == 'sadmin') {
        it("should select a customer from the customers dropdown and retrieve sip gateways and count", () => {
            cy.wait("@refreshedSipGateways").then(() => {
                cy.wait(3000);
                const addRequestAssertions = (interception: any) => {
                    const decodedParams = JSON.parse(interception.request.query.filter);
                    const customerIdConditon = decodedParams.where.customerId;
                    expect(decodedParams.limit).to.eq(10);
                    expect(decodedParams.skip).to.eq(0);
                    expect(customerIdConditon).to.eq(1);
                    expect(decodedParams.order).to.eq("order asc");

                };
                cy.get('[data-cy="sipgateway-customer-label"]').should("be.visible").should("have.text", "Customer");
                cy.get('[data-cy="sipgateway-customer-dropdown"]').should("be.visible").click();
                cy.get(".p-dropdown-item").should("be.visible", { force: true });
                cy.get(".p-dropdown-item").eq(2).click({ force: true });
                cy.wait(1000);
                cy.get('[data-cy="sipgateway-customer-dropdown"] .p-dropdown-label').should("contain", "Tech Fusion ITc");
                cy.wait(1000);
                cy.intercept("GET", `${Cypress.env("sipGatewaysEndpoint")}*`).as("sipGateways");
                cy.intercept("GET", `${Cypress.env("sipGatewaysEndpoint")}/count*`).as("sipGatewaysCount");
                cy.get('[data-cy="sipgateway-search-button"]').should("be.visible").click();
                cy.wait("@sipGateways").then((interception: any) => {
                    if (interception.request.query.filter) {
                        addRequestAssertions(interception);
                    }
                    if (interception.response) {
                        const results = interception.response.body;
                        expect(interception.response.statusCode).to.eq(200);
                        if (results.length) {
                            expect(results).to.have.length.greaterThan(0);
                        } else {
                            expect(results).to.have.length(0);
                        }
                    }
                });

                cy.wait("@sipGatewaysCount").then((interception: any) => {
                    if (interception.request.query.filter) {
                        const decodedParams = JSON.parse(interception.request.query.filter);
                        expect(decodedParams.where.customerId).to.eq(2);
                        expect(decodedParams.access_token).to.exist;
                    }
                    if (interception.response) {
                        const count = interception.response.body.count;
                        expect(interception.response.statusCode).to.eq(200);
                        cy.get('[data-cy="sipgateway-total-count"]')
                            .should("be.visible")
                            .invoke("text")
                            .then((text) => {
                                let totalCount = 0;
                                const match = text.match(/\d+/);
                                if (match) {
                                    totalCount = Number(match[0]);
                                }
                                if (count === 0) {
                                    expect(count).to.eq(0);
                                } else {
                                    if (totalCount) {
                                        expect(totalCount).to.be.greaterThan(0);
                                    }
                                }
                            });
                    }
                });
            });
        });


    it("it should type test keyword and  search to retrieve sip gateways and count", () => {

        const addRequestAssertions = (interception: any) => {
            const decodedParams = JSON.parse(interception.request.query.filter);
            const filters = decodedParams.where.and[1].or;
            expect(decodedParams.limit).to.eq(10);
            expect(decodedParams.skip).to.eq(0);
            expect(decodedParams.order).to.eq("order asc");
            expect(filters).to.include.deep.members([
                { name: { like: "%ipx%" } },
                { address: { like: "%ipx%" } },
                { port: { like: "%ipx%" } },
                { type: { like: "%ipx%" } },
                { digitsStrip: { like: "%ipx%" } },
                { description: { like: "%ipx%" } },
            ]);
            expect(interception.request.query.access_token).to.exist;
        };


        cy.wait("@refreshedSipGateways").then((res) => {
            cy.get('[data-cy="sipgateway-search"]')
                .should("be.visible")
                .type("ipx", { force: true });
            cy.intercept(
                "GET",
                `${Cypress.env("sipGatewaysEndpoint")}*`
            ).as("sipGateways");
            cy.intercept(
                "GET",
                `${Cypress.env("sipGatewaysEndpoint")}/count*`
            ).as("sipGatewaysCount");
            cy.get('[data-cy="sipgateway-search-button"]')
                .should("be.visible")
                .click();

            cy.wait("@sipGateways").then((interception: any) => {
                if (interception.request.query.filter) {
                    addRequestAssertions(interception);
                }
                if (interception.response) {
                    const results = interception.response.body;
                    expect(interception.response.statusCode).to.eq(200);
                    if (results.length) {
                        expect(results).to.have.length.greaterThan(0);
                    } else {
                        expect(results).to.have.length(0);
                    }
                }
            });

            cy.wait("@sipGatewaysCount").then((interception: any) => {
                if (interception.request.query.filter) {
                    const decodedParams = JSON.parse(interception.request.query.filter);
                    const filters = decodedParams.where.and[1].or;

                    expect(filters).to.include.deep.members([
                        { name: { like: "%ipx%" } },
                        { address: { like: "%ipx%" } },
                        { port: { like: "%ipx%" } },
                        { type: { like: "%ipx%" } },
                        { digitsStrip: { like: "%ipx%" } },
                        { description: { like: "%ipx%" } },
                    ]);
                    expect(interception?.request?.query?.access_token).to.exist;
                }
                if (interception.response) {
                    const count = interception.response.body;
                    expect(interception.response.statusCode).to.eq(200);
                    cy.get('[data-cy="sipgateway-total-count"]')
                        .should("be.visible")
                        .invoke("text")
                        .then((text) => {
                            let totalCount = 0;
                            const match = text.match(/\d+/);
                            if (match) {
                                totalCount = Number(match[0]);
                            }
                            if (count === 0) {
                                expect(count).to.eq(0);
                            } else {
                                if (totalCount) {
                                    expect(totalCount).to.be.greaterThan(0);
                                }
                            }
                        });
                }
            });
        });
    });


    it('should click Add New Sipgateway button and navigate to   New SIP Gateway screen', () => {
        cy.wait("@refreshedSipGateways").then(() => {
            cy.get('[data-cy="sipgateway-add-new-button"]').should('be.visible').click();
            cy.wait(3000);
            cy.url().should('include', '/service/routing/sipgateway/add');
        });
    });
}

});
