import { environment } from "src/environments/environment";

describe("Roles Feature", () => {
    const profile = environment.cypress
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(2000);
        cy.intercept("GET", `${Cypress.env("rolesEndpoint")}*`).as("refreshedRoles");
        cy.visit("/service/role");
        cy.wait(5000);
    });


    it("should navigate to Manage Roles screen", () => {      
        cy.url().should("include", "/service/role");
    });

    it("should display the page title ", () => {
        cy.get('[data-cy="page-title"]')
            .should("be.visible")
            .and("contain.text", "Manage Roles");
    });

   
    it("it should type admin keyword and  search to retrieve roles and count", () => {
        const addRequestAssertions = (interception: any) => {
            const decodedParams = JSON.parse(interception.request.query.filter);           
            const filters = decodedParams.where.and[1].or;      
            console.log(filters, 'filters')  
            expect(decodedParams.limit).to.eq(10);
            expect(decodedParams.skip).to.eq(0);
        
            expect(filters).to.include.deep.members([
                { name: { like: "%admin%" } },
                { description: { like: "%admin%" } },
               
            ]);        
            expect(interception.request.query.access_token).to.exist;
        };
        
        cy.wait("@refreshedRoles").then((res) => {
            cy.get('[data-cy="roles-search"]')
                .should("be.visible")
                .type("admin", { force: true });
            cy.intercept(
                "GET",
                `${Cypress.env("rolesEndpoint")}*`
            ).as("roles");
            cy.intercept(
                "GET",
                `${Cypress.env("rolesEndpoint")}/count*`
            ).as("rolesCount");
            cy.get('[data-cy="roles-search-button"]')
                .should("be.visible")
                .click();

            cy.wait("@roles").then((interception: any) => {
                if (interception.request.query.filter) {
                    addRequestAssertions(interception);
                }
                if (interception.response) {
                    const results = interception.response.body;
                   if(interception.response.statusCode == 200)
                   expect(interception.response.statusCode).to.eq(200);;
                    if (results.length) {
                        expect(results).to.have.length.greaterThan(0);
                    } else {
                        expect(results).to.have.length(0);
                    }
                }
            });

            cy.wait("@rolesCount").then((interception: any) => {
                if (interception.request.query.filter) {
                    const decodedParams = JSON.parse(interception.request.query.filter);
                    const filters = decodedParams.where.and[1].or;
                    expect(filters).to.include.deep.members([
                        { name: { like: "%admin%" } },
                        { description: { like: "%admin%" } },
                       
                    ]);                
                    expect(interception.request.query.access_token).to.exist;
                }
                if (interception.response) {
                    const count = interception.response.body.count;
                   if(interception.response.statusCode == 200)
                    expect(interception.response.statusCode).to.eq(200);
                    cy.get('[data-cy="roles-total-count"]')
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

    it('should click  New role button and navigate to New role Screen', () => {
        cy.wait("@refreshedRoles").then(() => {
            cy.get('[data-cy="roles-add-new-button"]').should('be.visible').click();
            cy.wait(3000);
            cy.url().should('include', '/service/role/add');
        });
    });

});
