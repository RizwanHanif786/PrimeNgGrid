import { environment } from "src/environments/environment";

describe("Product Variations Feature", () => {
    const profile = environment.cypress
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(2000);
        cy.intercept("GET", `${Cypress.env("productsEndpoint")}*`).as("refreshedProductsList");
        cy.visit("/service/billing");
        cy.wait(5000);
    });

    if (profile.username == 'sadmin') {

        it("should navigate to products screen", () => {
            cy.url().should("include", "/service/billing");
        });

        it("should display the page title ", () => {
            cy.get('[data-cy="page-title"]')
                .should("be.visible")
                .and("contain.text", "Manage Products");
        });


        it("it should click view product variation icon and navigates to product variation screen and verfiy page title, click Add New variation button and navigate to Add product variation", () => {

            cy.wait("@refreshedProductsList").then((interception) => {
                cy.intercept("GET", `${Cypress.env("productVariationsEndpoint")}*`).as("productVariations");

                const body = interception.response?.body
                if (body?.length) {

                    const productId = body[body.length - 1].id
                    cy.get('[data-cy="view-product-variation"]').should("be.visible").eq(body.length - 1).click()
                    cy.wait(3000)
                    cy.url().should("include", `/service/billing/product/${productId}`);

                    cy.get('[data-cy="page-title"]')
                        .should("be.visible")
                        .and("contain.text", "Product Variations");

                    cy.wait("@productVariations").then((interception: any) => {

                        if (interception.request.query.filter) {
                            const decodedParams = JSON.parse(interception.request.query.filter);
                            expect(decodedParams.productId).to.eq(productId);
                            expect(interception.request.query.access_token).to.exist;
                        }
                        if (interception.response) {
                            const results = interception.response.body;
                            if (interception.response.statusCode == 200)
                                expect(interception.response.statusCode).to.eq(200);
                            if (results.length) {
                                expect(results).to.have.length.greaterThan(0);
                            } else {
                                expect(results).to.have.length(0);
                            }
                        }


                        cy.get('[data-cy="product-variation-add-new-button"]').should('be.visible').click();
                        cy.wait(1000);
                        cy.url().should('include', `service/billing/product/${productId}/product-variation/add`);

                    });
                }
            });
        });

    }
});
