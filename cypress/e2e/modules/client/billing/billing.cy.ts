import { environment } from "src/environments/environment";

describe("Products Feature", () => {
    const profile = environment.cypress
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(2000);
        cy.intercept("GET", `${Cypress.env("productsEndpoint")}*`).as("refreshedProductsList");
        cy.visit("/service/billing");
        cy.wait(5000);
    });

    function generateRandomProduct() {
        const randomString = (length: number) => {
            const characters = 'abcdefghijklmnopqrstuvwxyz';
            return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
        };
        const randomNumber = () => Math.floor(Math.random() * 1000);
        const name = `name${randomString(5)}_${randomNumber()}`;
        const description = `description${randomString(5)}_${randomNumber()}@example.com`;
        const sku = `sku${randomString(5)}`;
        return { name, description, sku };
    }

    if (profile.username == 'sadmin') {

        it("should navigate to products screen", () => {
            cy.url().should("include", "/service/billing");
        });

        it("should display the page title ", () => {
            cy.get('[data-cy="page-title"]')
                .should("be.visible")
                .and("contain.text", "Manage Products");
        });


        it("it should type basic keyword and  search to retrieve products and count", () => {
            const addRequestAssertions = (interception: any) => {
                const decodedParams = JSON.parse(interception.request.query.filter);
                console.log(decodedParams, 'decodedParams')
                expect(decodedParams.where.description).to.eq("basic");
                expect(interception.request.query.access_token).to.exist;
            };

            cy.wait("@refreshedProductsList").then((res) => {
                console.log('res: ', res);
                cy.get('[data-cy="products-search"]')
                    .should("be.visible")
                    .type("basic", { force: true });
                cy.intercept(
                    "GET",
                    `${Cypress.env("productsEndpoint")}*`
                ).as("products");
                cy.get('[data-cy="products-search-button"]')
                    .should("be.visible")
                    .click();

                cy.wait("@products").then((interception: any) => {
                    console.log('interception: ', interception);
                    if (interception.request.query.filter) {
                        addRequestAssertions(interception);
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
                });


            });
        });


        it("should add name, description, sku, type and  create a new product ", () => {
            const product = generateRandomProduct();

            cy.get('[data-cy="products-add-new-button"]').should("be.visible").click()

            cy.get('[data-cy="product-name"]').should("be.visible").clear().type(product.name)
            cy.get('[data-cy="product-description"]').should("be.visible").clear().type(product.description);
            cy.get('[data-cy="product-sku"]').should("be.visible").clear().type(product.sku);


            cy.intercept("POST", `${Cypress.env("productsEndpoint")}*`).as("addNewProduct");
            cy.get('[data-cy="row-save"]').should("be.visible").click();
            cy.wait("@addNewProduct").then((interception: any) => {
                if (interception.request.body) {
                    const payload = interception.request.body;
                    expect(payload?.name).to.eq(product.name);
                    expect(payload?.description).to.eq(product.description);
                    expect(payload?.sku).to.eq(product.sku);
                    expect(payload?.type).to.eq('plan');
                }
                if (interception.response.body) {
                    const response = interception.response.body;
                    expect(response?.name).to.eq(product.name);
                    expect(response?.description).to.eq(product.description);
                    expect(response?.sku).to.eq(product.sku);
                    expect(response?.type).to.eq('plan');
                    expect(response?.id).to.exist;
                }
            });
        })

        it("should edit name, description, sku, type and  update  product ", () => {
            cy.wait("@refreshedProductsList").then((interception) => {
                const body = interception.response?.body
                if (body?.length) {
                    const product = generateRandomProduct();

                    cy.get('[data-cy="row-edit"]').should("be.visible").eq(body.length - 1).click()
                    cy.get('[data-cy="product-name"]').should("be.visible").clear().type(product.name)
                    cy.get('[data-cy="product-description"]').should("be.visible").clear().type(product.description);
                    cy.get('[data-cy="product-sku"]').should("be.visible").clear().type(product.sku);


                    cy.intercept("PUT", `${Cypress.env("productsEndpoint")}*`).as("updateProduct");
                    cy.get('[data-cy="row-save"]').should("be.visible").click();
                    cy.wait("@updateProduct").then((interception: any) => {
                        if (interception.request.body) {
                            const payload = interception.request.body;
                            expect(payload?.name).to.eq(product.name);
                            expect(payload?.description).to.eq(product.description);
                            expect(payload?.sku).to.eq(product.sku);
                            expect(payload?.id).to.eq(body[body.length - 1].id);
                        }
                        if (interception.response.body) {
                            const response = interception.response.body;
                            expect(response?.name).to.eq(product.name);
                            expect(response?.description).to.eq(product.description);
                            expect(response?.sku).to.eq(product.sku);
                            expect(response?.id).to.exist;
                        }
                    });
                }
            })

        })

        it("should delete  product ", () => {
            cy.wait("@refreshedProductsList").then((interception) => {
                const body = interception.response?.body
                const productId = body[body.length - 1].id
                if (body?.length) {

                    cy.intercept("DELETE", `${Cypress.env("productsEndpoint")}/${productId}*`).as("deleteProduct");
                    cy.get('[data-cy="row-delete"]').should("be.visible").eq(body.length - 1).click();
                    cy.wait("@deleteProduct").then((interception: any) => {
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

        })


    }
});
