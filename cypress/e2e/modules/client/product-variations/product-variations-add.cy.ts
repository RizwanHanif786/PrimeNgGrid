import { environment } from "src/environments/environment";

describe("New Product Variations  Feature", () => {
    const profile = environment.cypress
    let productId = 0;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(2000);
        cy.intercept("GET", `${Cypress.env("productsEndpoint")}*`).as("refreshedProductsList");
        cy.visit("/service/billing");
        cy.wait(5000);
        cy.wait("@refreshedProductsList").then((interception) => {
            cy.intercept("GET", `${Cypress.env("productVariationsEndpoint")}*`).as("productVariations");
            const body = interception.response?.body
            if (body?.length) {
                productId = body[body.length - 1].id
                console.log(productId, 'productId')
                cy.get('[data-cy="view-product-variation"]').should("be.visible").eq(body.length - 1).click()
                cy.wait(3000)
                cy.url().should("include", `/service/billing/product/${productId}`);

                cy.get('[data-cy="page-title"]')
                    .should("be.visible")
                    .and("contain.text", "Product Variations");

            }
        });
    });

    if (profile.username == 'sadmin') {


        it("it should add new product variation and navigates to product varitaions list screen", () => {

            const price = '1500'
            const currency = 'USD'
            const description = 'New Product variation'
            const minqty = '100'
            const maxqty = '2000'

            cy.get('[data-cy="product-variation-add-new-button"]').should('be.visible').click();
            cy.wait(1000);
            cy.url().should('include', `service/billing/product/${productId}/product-variation/add`);
            cy.get('[data-cy="pv-price"]').should("be.visible").type(price)
            cy.get('[data-cy="pv-currency"]').should("be.visible").clear().type(currency);
            cy.get('[data-cy="pv-description"]').should("be.visible").type(description);
            cy.get('[data-cy="pv-minqty"]').should("be.visible").clear().type(minqty);
            cy.get('[data-cy="pv-maxqty"]').should("be.visible").clear().type(maxqty);
            cy.get('[data-cy="pv-recurr-type-dropdown"]').should("be.visible").click();
            cy.get(".p-dropdown-item").should("be.visible", { force: true });
            cy.get(".p-dropdown-item").eq(0).click({ force: true });
            cy.get('[data-cy="pv-recurr-type-dropdown"] .p-dropdown-label').should('contain', 'Monthly'); cy.wait(1000);

            cy.intercept("POST", `${Cypress.env("productVariationsEndpoint")}*`).as("addNewProductVariation");
            cy.get('[data-cy="pv-save-button"]').should("be.visible").click();
            cy.wait("@addNewProductVariation").then((interception: any) => {
                if (interception.request.body) {
                    const payload = interception.request.body;
                    expect(payload?.currency).to.eq(currency);
                    expect(payload?.description).to.eq(description);
                    expect(payload?.maxQuantity).to.eq(Number(maxqty));
                    expect(payload?.minQuantity).to.eq(Number(minqty));
                    expect(payload?.price).to.eq(Number(price));
                    expect(payload?.productId).to.eq(productId.toString());
                    expect(payload?.recur).to.eq('month');
                }
                if (interception.response.body) {
                    const response = interception.response.body;
                    expect(response?.currency).to.eq(currency);
                    expect(response?.description).to.eq(description);
                    expect(response?.maxQuantity).to.eq(Number(maxqty));
                    expect(response?.minQuantity).to.eq(Number(minqty));
                    expect(response?.price).to.eq(Number(price));
                    expect(response?.productId).to.eq(productId);
                    expect(response?.recur).to.eq('month');
                    expect(response?.id).to.exist;
                    cy.url().should("include", `/service/billing/product/${productId}`);
                }
            });

        });

        it("it should  edit  product variation and navigates to product varitaions list screen", () => {

            cy.wait('@productVariations').then((interception) => {
                const body = interception.response?.body?.filter((x: any) => x.productId == productId)
                console.log(body, 'body')
                if (body?.length) {
                    const productVariationId = body[body.length - 1].id
                    const price = '15000'
                    const currency = 'USD'
                    const description = 'Edit Product variation'
                    const minqty = '1000'
                    const maxqty = '12000'
                    cy.get('[data-cy="product-variation-edit-button"]').should('be.visible').eq(body.length - 1).click();
                    cy.wait(1000);
                    cy.url().should('include', `service/billing/product/${productId}/product-variation/edit/${productVariationId}`);
                    cy.get('[data-cy="pv-price"]').should("be.visible").clear().type(price)
                    cy.get('[data-cy="pv-currency"]').should("be.visible").clear().type(currency);
                    cy.get('[data-cy="pv-description"]').should("be.visible").clear().type(description);
                    cy.get('[data-cy="pv-minqty"]').should("be.visible").clear().type(minqty);
                    cy.get('[data-cy="pv-maxqty"]').should("be.visible").clear().type(maxqty);

                    cy.get('[data-cy="pv-recurr-type-dropdown"]').should("be.visible").click();
                    cy.get(".p-dropdown-item").should("be.visible", { force: true });
                    cy.get(".p-dropdown-item").eq(0).click({ force: true });
                    cy.get('[data-cy="pv-recurr-type-dropdown"] .p-dropdown-label').should('contain', 'Monthly');
                    cy.wait(1000);
                    cy.intercept("PUT", `${Cypress.env("productVariationsEndpoint")}/${productVariationId}*`).as("updateProductVariation");
                    cy.get('[data-cy="pv-save-button"]').should("be.visible").click();
                    cy.wait("@updateProductVariation").then((interception: any) => {
                        if (interception.request.body) {
                            const payload = interception.request.body;
                            expect(payload?.currency).to.eq(currency);
                            expect(payload?.description).to.eq(description);
                            expect(payload?.maxQuantity).to.eq(Number(maxqty));
                            expect(payload?.minQuantity).to.eq(Number(minqty));
                            expect(payload?.price).to.eq(Number(price));
                            expect(payload?.productId).to.eq(productId);
                            expect(payload?.recur).to.eq('month');
                        }
                        if (interception.response.body) {
                            const response = interception.response.body;
                            expect(response?.currency).to.eq(currency);
                            expect(response?.description).to.eq(description);
                            expect(response?.maxQuantity).to.eq(Number(maxqty));
                            expect(response?.minQuantity).to.eq(Number(minqty));
                            expect(response?.price).to.eq(Number(price));
                            expect(response?.productId).to.eq(productId);
                            expect(response?.recur).to.eq('month');
                            expect(response?.id).to.eq(productVariationId);
                            cy.url().should("include", `/service/billing/product/${productId}`);
                        }
                    });
                }

            })


        });

        it("it should  delete  product variation ", () => {

            cy.wait('@productVariations').then((interception) => {
                const body = interception.response?.body?.filter((x: any) => x.productId == productId)
                console.log(body, 'body')
                if (body?.length) {
                    const productVariationId = body[body.length - 1].id
                    cy.get('[data-cy="product-variation-delete-button"]').should('be.visible').eq(body.length - 1).click();
                    cy.intercept("DELETE", `${Cypress.env("productVariationsEndpoint")}/${productVariationId}*`).as("deleteProductVariation");
                    cy.contains('Yes').click();
                    cy.wait("@deleteProductVariation").then((interception: any) => {
                        if (interception.request.body) {
                            const decodedParams = JSON.parse(interception.request.query.filter);
                            expect(decodedParams.access_token).to.exist;
                        }
                        if (interception.response.body) {
                            const response = interception.response.body;
                            expect(response.count).to.eq(1);
                        }
                    });
                }

            })


        });

    }
});
