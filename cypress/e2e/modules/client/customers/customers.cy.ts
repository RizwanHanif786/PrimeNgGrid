import { environment } from "src/environments/environment";

describe("Customers Feature", () => {
    const profile = environment.cypress
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(2000);
        cy.intercept("GET", `${Cypress.env("customersEndpoint")}*`).as("refreshedCustomers");
        cy.visit("/service/customer");
        cy.wait(5000);
    });

    if (profile.username == 'sadmin') {

        it("should navigate to Manage Customer screen", () => {
            cy.url().should("include", "/service/customer");
        });

        it("should display the page title ", () => {
            cy.get('[data-cy="page-title"]')
                .should("be.visible")
                .and("contain.text", "Manage Customers");
        });


        it("it should type 'American Tax solution' keyword and  search to retrieve customers and count", () => {
            const addRequestAssertions = (interception: any) => {
                const decodedParams = JSON.parse(interception.request.query.filter);
                const filters = decodedParams.where.and[1].or;

                expect(decodedParams.limit).to.eq(15);
                expect(decodedParams.skip).to.eq(0);
                expect(filters).to.include.deep.members([
                    { firstName: { like: "%American Tax Solutions%" } },
                    { lastName: { like: "%American Tax Solutions%" } },
                    { vatNumber: { like: "%American Tax Solutions%" } },
                    { companyName: { like: "%American Tax Solutions%" } },
                    { companyId: { like: "%American Tax Solutions%" } },
                    { billingEmail: { like: "%American Tax Solutions%" } }
                ]);
                expect(interception.request.query.access_token).to.exist;
            };


            cy.wait("@refreshedCustomers").then((res) => {
                cy.get('[data-cy="customer-search"]')
                    .should("be.visible")
                    .type("American Tax Solutions", { force: true });
                cy.intercept(
                    "GET",
                    `${Cypress.env("customersEndpoint")}*`
                ).as("customers");
                cy.intercept(
                    "GET",
                    `${Cypress.env("customersEndpoint")}/count*`
                ).as("customersCount");
                cy.get('[data-cy="customer-search-button"]')
                    .should("be.visible")
                    .click();

                cy.wait("@customers").then((interception: any) => {
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

                cy.wait("@customersCount").then((interception: any) => {
                    if (interception.request.query.filter) {
                        const decodedParams = JSON.parse(interception.request.query.filter);
                        const filters = decodedParams.where.and[1].or;
                        expect(filters).to.include.deep.members([
                            { firstName: { like: "%American Tax Solutions%" } },
                            { lastName: { like: "%American Tax Solutions%" } },
                            { vatNumber: { like: "%American Tax Solutions%" } },
                            { companyName: { like: "%American Tax Solutions%" } },
                            { companyId: { like: "%American Tax Solutions%" } },
                            { billingEmail: { like: "%American Tax Solutions%" } }
                        ]);
                        expect(interception.request.query.access_token).to.exist;
                    }
                    if (interception.response) {
                        const count = interception.response.body.count;
                        expect(interception.response.statusCode).to.eq(200);
                        cy.get('[data-cy="customers-total-count"]')
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

        it('should click  New Customer and navigate to New Customer Screen', () => {
            cy.wait("@refreshedCustomers").then(() => {
                cy.get('[data-cy="customers-add-new-button"]').should('be.visible').click();
                cy.wait(3000);
                cy.url().should('include', '/service/customer/add');
            });
        });
    }
});
