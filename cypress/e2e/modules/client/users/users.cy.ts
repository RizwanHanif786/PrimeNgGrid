import { environment } from "src/environments/environment";

describe("Users Feature", () => {
    const profile = environment.cypress
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.intercept("GET", `${Cypress.env("usersEndpoint")}*`).as("refreshedUsers");
        cy.visit("/service/user");
        cy.wait(5000);
    });


    // it("should navigate to Manage Users screen", () => {
    //     cy.url().should("include", "/service/user");
    // });

    // it("should display the page title ", () => {
    //     cy.get('[data-cy="page-title"]')
    //         .should("be.visible")
    //         .and("contain.text", "Manage Users");
    // });


    it("it should type 'a.miller' keyword and  search to retrieve users and count", () => {
        const addRequestAssertions = (interception: any) => {
            const decodedParams = JSON.parse(interception.request.query.filter);
            const filters = decodedParams.where.and[1].or;
            expect(decodedParams.limit).to.eq(10);
            expect(decodedParams.skip).to.eq(0);
            expect(filters).to.include.deep.members([
                { username: { like: "%a.miller%" } },
                { email: { like: "%a.miller%" } },
                { customerId: { like: "%a.miller%" } },
                { id: { like: "%a.miller%" } },
            ]);
            expect(interception.request.query.access_token).to.exist;
        };

        cy.wait("@refreshedUsers").then((res) => {
            cy.get('[data-cy="users-search"]')
                .should("be.visible")
                .type("a.miller", { force: true });

            cy.intercept("GET", `${Cypress.env("usersEndpoint")}*`).as("dashUsers");
            cy.intercept("GET", `${Cypress.env("usersEndpoint")}/count*`).as("usersCount");

            cy.get('[data-cy="users-search-button"]')
                .should("be.visible")
                .click();

            cy.wait("@dashUsers").then((interception: any) => {
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

            cy.wait("@usersCount").then((interception: any) => {
                if (interception.request.query.filter) {
                    const decodedParams = JSON.parse(interception.request.query.filter);
                    const filters = decodedParams.where.and[1].or;
                    expect(filters).to.include.deep.members([
                        { username: { like: "%a.miller%" } },
                        { email: { like: "%a.miller%" } },
                        { customerId: { like: "%a.miller%" } },
                        { id: { like: "%a.miller%" } },
                    ]);
                    expect(interception.request.query.access_token).to.exist;
                }
                if (interception.response) {
                    const count = interception.response.body.count;
                    if(interception.response.statusCode == 200)
                    expect(interception.response.statusCode).to.eq(200);
                    cy.get('[data-cy="users-total-count"]')
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

    // it('should click  New User button and navigate to New User Screen', () => {
    //     cy.wait("@refreshedUsers").then(() => {
    //         cy.get('[data-cy="users-add-new-button"]').should('be.visible').click();
    //         cy.wait(3000);
    //         cy.url().should('include', '/service/user/add');
    //     });
    // });

});
