import { environment } from "src/environments/environment";

describe("Tracking Sources Feature", () => {
    const profile = environment.cypress
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.intercept("GET", `${Cypress.env("trackingSourcesEndpoint")}/tracking_sources*`).as("refreshedTrackingSources");
        cy.visit("/service/tracking-source");
        cy.wait(5000);
    });

    it("should navigate to tracking sources screen", () => {
        cy.url().should("include", "/service/tracking-source");
    });

    it("should display the page title ", () => {
        cy.get('[data-cy="page-title"]')
            .should("be.visible")
            .and("contain.text", "Tracking Sources");
    });

    if (profile.username == 'sadmin') {
        it("should select a customer from the customers dropdown and search to retrieve tracking sources and count", () => {
            cy.wait("@refreshedTrackingSources").then(() => {
                cy.wait(3000);
                const addRequestAssertions = (interception: any) => {
                    const decodedParams = JSON.parse(interception.request.query.filter);
                    const customerIdConditon = decodedParams.where.customerId;
                    expect(decodedParams.limit).to.eq(10);
                    expect(decodedParams.skip).to.eq(0);
                    expect(customerIdConditon).to.eq(2);
                };
                cy.get('[data-cy="tracking-sources-customer-label"]').should("be.visible").should("have.text", "Customer");
                cy.get('[data-cy="tracking-sources-customer-dropdown"]').should("be.visible").click();
                cy.get(".p-dropdown-item").should("be.visible", { force: true });
                cy.get(".p-dropdown-item").eq(2).click({ force: true });
                cy.wait(1000);
                cy.get('[data-cy="tracking-sources-customer-dropdown"] .p-dropdown-label').should("contain", "American Tax Solutions");
                cy.wait(1000);
                cy.intercept("GET",`${Cypress.env("trackingSourcesEndpoint")}/tracking_sources*`).as("trackingSources");
                cy.intercept("GET",`${Cypress.env("trackingSourcesEndpoint")}/tracking_sources/count*`).as("trackingSourcesCount");
                cy.get('[data-cy="tracking-sources-search-button"]').should("be.visible").click();
                cy.wait("@trackingSources").then((interception: any) => {
                    if (interception.request.query.filter) {
                        addRequestAssertions(interception);
                    }
                    if (interception.response) {
                        const results = interception.response.body.data;
                        expect(interception.response.statusCode).to.eq(200);
                        if (results.length) {
                            expect(results).to.have.length.greaterThan(0);
                        } else {
                            expect(results).to.have.length(0);
                        }
                    }
                });

                cy.wait("@trackingSourcesCount").then((interception: any) => {
                    if (interception.request.query.filter) {
                        const decodedParams = JSON.parse(interception.request.query.filter);
                        expect(decodedParams.where.customerId).to.eq(2);
                        expect(decodedParams.access_token).to.exist;
                    }
                    if (interception.response) {
                        const count = interception.response.body;
                        expect(interception.response.statusCode).to.eq(200);
                        cy.get('[data-cy="tracking-sources-total-count"]')
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
    }


    it("it should type test keyword and  search to retrieve tracking sources and count", () => {

        const addRequestAssertions = (interception: any) => {
            const decodedParams = JSON.parse(interception.request.query.filter);
            const filters = decodedParams.where.and[1].or;

            expect(decodedParams.limit).to.eq(10);
            expect(decodedParams.skip).to.eq(0);
            expect(filters).to.include.deep.members([
                { name: { like: "%test%" } },
                { description: { like: "%test%" } },
                { type: { like: "%test%" } },
                { "Customer.companyId": { like: "%test%" } },
            ]);
            expect(interception.request.query.access_token).to.exist;
        };

        cy.wait("@refreshedTrackingSources").then((res) => {
            cy.get('[data-cy="tracking-sources-search"]')
                .should("be.visible")
                .type("test", { force: true });
            cy.intercept(
                "GET",
                `${Cypress.env("trackingSourcesEndpoint")}/tracking_sources*`
            ).as("trackingSources");
            cy.intercept(
                "GET",
                `${Cypress.env("trackingSourcesEndpoint")}/tracking_sources/count*`
            ).as("trackingSourcesCount");
            cy.get('[data-cy="tracking-sources-search-button"]')
                .should("be.visible")
                .click();

            cy.wait("@trackingSources").then((interception: any) => {
                if (interception.request.query.filter) {
                    addRequestAssertions(interception);
                }
                if (interception.response) {
                    const results = interception.response.body.data;
                    // Response Assertions
                    expect(interception.response.statusCode).to.eq(200);
                    if (results.length) {
                        expect(results).to.have.length.greaterThan(0);
                    } else {
                        expect(results).to.have.length(0);
                    }
                }
            });

            cy.wait("@trackingSourcesCount").then((interception: any) => {
                if (interception.request.query.filter) {
                    const decodedParams = JSON.parse(interception.request.query.filter);
                    const filters = decodedParams.where.and[1].or;

                    expect(filters).to.include.deep.members([
                        { name: { like: "%test%" } },
                        { description: { like: "%test%" } },
                        { type: { like: "%test%" } },
                        { "Customer.companyId": { like: "%test%" } }
                    ]);
                    expect(interception?.request?.query?.access_token).to.exist;
                }
                if (interception.response) {
                    const count = interception.response.body;
                    expect(interception.response.statusCode).to.eq(200);
                    cy.get('[data-cy="tracking-sources-total-count"]')
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


    it('should export tracking sources', () => {
        cy.wait("@refreshedTrackingSources").then(() => {
            cy.wait(2000);
            cy.intercept('GET', `${Cypress.env('trackingSourcesEndpoint')}/bulk_download*`).as('bulkDownloads');
            cy.get('[data-cy="tracking-sources-export-button"]').should('be.visible').click({ force: true });
            cy.wait('@bulkDownloads').then((interception: any) => {
                if (interception.request.query) {
                    const queryparams = interception.request.query;
                    expect(queryparams?.access_token).to.exist;
                }
                if (interception.response) {
                    const results = JSON.parse(interception.response.body);
                    expect(interception.response.statusCode).to.eq(200);
                    expect(results.status).to.eq("OK")
                    expect(results.csv_data).not.null
                }

            });
        })
    });

    it('should click New Tracking Source button and navigate to   New Tracking Source screen', () => {
        cy.wait("@refreshedTrackingSources").then(() => {
            cy.get('[data-cy="tracking-sources-add-new-button"]').should('be.visible').click();
            cy.wait(3000);
            cy.url().should('include', '/service/tracking-source/add');
        });
    });
});
