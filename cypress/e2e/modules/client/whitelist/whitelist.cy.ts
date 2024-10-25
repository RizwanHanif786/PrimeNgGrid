import { environment } from "src/environments/environment";

describe("Whitelist Feature", () => {
    const profile = environment.cypress
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(2000);
        cy.intercept("GET", `${Cypress.env("whitelistsEndpoint")}*`).as("refreshedWhitelists");
        cy.visit("/service/routing/whitelist");
        cy.wait(5000);
    });

    if(profile.username == 'sadmin') {

    it("should navigate to whitelist screen", () => {
        cy.url().should("include", "/service/routing/whitelist");
    });

    it("should display the page title ", () => {
        cy.get('[data-cy="page-title"]')
            .should("be.visible")
            .and("contain.text", "Whitelist");
    });

   
    it("it should type test keyword and  search to retrieve whitelists and count", () => {
        const addRequestAssertions = (interception: any) => {
            const decodedParams = JSON.parse(interception.request.query.filter);           
            const filters = decodedParams.where.and[1].or;        
            expect(decodedParams.limit).to.eq(10);
            expect(decodedParams.skip).to.eq(0);
            expect(decodedParams.order).to.eq("ip asc");
        
            expect(filters).to.include.deep.members([
                { id: { like: "%5065%" } },
                { ip: { like: "%5065%" } },
                { mask: { like: "%5065%" } },
                { port: { like: "%5065%" } },
                { proto: { like: "%5065%" } },
                { pattern: { like: "%5065%" } },
            ]);        
            expect(interception.request.query.access_token).to.exist;
        };
        
        cy.wait("@refreshedWhitelists").then((res) => {
            cy.get('[data-cy="whitelist-search"]')
                .should("be.visible")
                .type("5065", { force: true });
            cy.intercept(
                "GET",
                `${Cypress.env("whitelistsEndpoint")}*`
            ).as("whitelists");
            cy.intercept(
                "GET",
                `${Cypress.env("whitelistsEndpoint")}/count*`
            ).as("whitelistsCount");
            cy.get('[data-cy="whitelist-search-button"]')
                .should("be.visible")
                .click();

            cy.wait("@whitelists").then((interception: any) => {
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

            cy.wait("@whitelistsCount").then((interception: any) => {
                if (interception.request.query.filter) {
                    const decodedParams = JSON.parse(interception.request.query.filter);
                    const filters = decodedParams.where.and[1].or;
                    expect(filters).to.include.deep.members([
                        { id: { like: "%5065%" } },
                        { ip: { like: "%5065%" } },
                        { mask: { like: "%5065%" } },
                        { port: { like: "%5065%" } },
                        { proto: { like: "%5065%" } },
                        { pattern: { like: "%5065%" } },
                    ]);                
                    expect(interception.request.query.access_token).to.exist;
                }
                if (interception.response) {
                    const count = interception.response.body.count;
                    expect(interception.response.statusCode).to.eq(200);
                    cy.get('[data-cy="whitelist-total-count"]')
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

    it('should click Add New Whitelist button and navigate to New Whitelist Screen', () => {
        cy.wait("@refreshedWhitelists").then(() => {
            cy.get('[data-cy="whitelist-add-new-button"]').should('be.visible').click();
            cy.wait(3000);
            cy.url().should('include', 'service/routing/whitelist/add');
        });
    });

}   
});
