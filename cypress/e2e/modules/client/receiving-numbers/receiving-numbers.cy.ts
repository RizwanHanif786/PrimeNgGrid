import { environment } from "src/environments/environment";

describe("Receiving Numbers Feature", () => {
  const profile = environment.cypress
  beforeEach(() => {
    cy.login(profile.username, profile.password);
    cy.intercept("GET", `${Cypress.env("receivingNumbersEndpoint")}/receiving_numbers*`).as("refreshedReceivingNumbers");
    cy.visit("/service/routing/receiving");
    cy.wait(5000);
  });

  it("should navigate to receiving numbers screen", () => {
    cy.url().should("include", "/service/routing/receiving");
  });

  it("should display the page title ", () => {
    cy.get('[data-cy="page-title"]')
      .should("be.visible")
      .and("contain.text", "Receiving Numbers");
  });

  if (profile.username == 'sadmin') {
    it("should select a customer from the customers dropdown and search to retrieve receiving numbers and count", () => {
      cy.wait("@refreshedReceivingNumbers").then(() => {
        const addRequestAssertions = (interception: any) => {
          const decodedParams = JSON.parse(interception.request.query.filter);
          const customerIdConditon = decodedParams.where.customerId;

          expect(decodedParams.limit).to.eq(10);
          expect(decodedParams.skip).to.eq(0);
          expect(decodedParams.order).to.eq("number asc");
          expect(customerIdConditon).to.eq(1);
        };
        cy.get('[data-cy="receiving-numbers-customer-label"]')
          .should("be.visible")
          .should("have.text", "Customer");
        cy.get('[data-cy="receiving-numbers-customer-dropdown"]')
          .should("be.visible")
          .click();
        cy.wait(2000);
        cy.get(".p-dropdown-item").should("be.visible", { force: true });
        cy.get(".p-dropdown-item").eq(1).click({ force: true });
        cy.wait(1000);
        cy.get(
          '[data-cy="receiving-numbers-customer-dropdown"] .p-dropdown-label'
        ).should("contain", "Tech Fusion ITc");
        cy.wait(1000);
        cy.intercept(
          "GET",
          `${Cypress.env("receivingNumbersEndpoint")}/receiving_numbers*`
        ).as("receivingNumbers");
        cy.intercept(
          "GET",
          `${Cypress.env("receivingNumbersEndpoint")}/count*`
        ).as("receivingNumbersCount");
        cy.get('[data-cy="receiving-numbers-search-button"]')
          .should("be.visible")
          .click();

        cy.wait("@receivingNumbers").then((interception: any) => {
          if (interception.request.query.filter) {
            addRequestAssertions(interception);
          }
          if (interception.response) {
            const results = interception.response.body;
            if (interception.response.statusCode == 200)
              if (interception.response.statusCode == 200)
                expect(interception.response.statusCode).to.eq(200);;
            if (results.length) {
              expect(results).to.have.length.greaterThan(0);
            } else {
              expect(results).to.have.length(0);
            }
          }
        });

        cy.wait("@receivingNumbersCount").then((interception: any) => {
          if (interception.request.query.filter) {
            const decodedParams = JSON.parse(interception.request.query.filter);
            expect(decodedParams.where.customerId).to.eq(1);
            expect(decodedParams.access_token).to.exist;
          }
          if (interception.response) {
            const count = interception.response.body;
            if (interception.response.statusCode == 200)
              expect(interception.response.statusCode).to.eq(200);;
            cy.get('[data-cy="receiving-numbers-total-count"]')
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


  it("it should type test keyword and  search to retrieve receiving numbers and count", () => {

    const addRequestAssertions = (interception: any) => {
      const decodedParams = JSON.parse(interception.request.query.filter);
      const filters = decodedParams.where.and[1].or;

      expect(decodedParams.limit).to.eq(10);
      expect(decodedParams.skip).to.eq(0);
      expect(decodedParams.order).to.eq("number asc");
      expect(filters).to.include.deep.members([
        { description: { like: "%test%" } },
        { totalCalls: { like: "%test%" } },
        { "Customer.companyId": { like: "%test%" } },
      ]);
      expect(interception.request.query.access_token).to.exist;
    };

    cy.wait("@refreshedReceivingNumbers").then((res) => {
      cy.get('[data-cy="receiving-numbers-search"]')
        .should("be.visible")
        .type("test");
      cy.intercept(
        "GET",
        `${Cypress.env("receivingNumbersEndpoint")}/receiving_numbers*`
      ).as("receivingNumbers");
      cy.intercept(
        "GET",
        `${Cypress.env("receivingNumbersEndpoint")}/count*`
      ).as("receivingNumbersCount");
      cy.get('[data-cy="receiving-numbers-search-button"]')
        .should("be.visible")
        .click();

      cy.wait("@receivingNumbers").then((interception: any) => {
        if (interception.request.query.filter) {
          addRequestAssertions(interception);
        }
        if (interception.response) {
          const results = interception.response.body;
          // Response Assertions
          if (interception.response.statusCode == 200)
            expect(interception.response.statusCode).to.eq(200);;
          if (results.length) {
            expect(results).to.have.length.greaterThan(0);
          } else {
            expect(results).to.have.length(0);
          }
        }
      });

      cy.wait("@receivingNumbersCount").then((interception: any) => {
        if (interception.request.query.filter) {
          const decodedParams = JSON.parse(interception.request.query.filter);
          const filters = decodedParams.where.and[1].or;

          expect(filters).to.include.deep.members([
            { description: { like: "%test%" } },
            { totalCalls: { like: "%test%" } },
            { "Customer.companyId": { like: "%test%" } },
          ]);
          expect(interception?.request?.query?.access_token).to.exist;
        }
        if (interception.response) {
          const count = interception.response.body;
          if (interception.response.statusCode == 200)
            expect(interception.response.statusCode).to.eq(200);;
          cy.get('[data-cy="receiving-numbers-total-count"]')
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


  it('should export receiving Numbers', () => {
    cy.wait("@refreshedReceivingNumbers").then(() => {
      cy.wait(2000);
      cy.intercept('GET', `${Cypress.env('receivingNumbersEndpoint')}/bulk_download*`).as('bulkDownloads');
      cy.get('[data-cy="receiving-numbers-export"]').should('be.visible').click({ force: true });
      cy.wait(1000);
      cy.wait('@bulkDownloads').then((interception: any) => {
        if (interception.request.query) {
          const queryparams = interception.request.query;
          expect(queryparams?.access_token).to.exist;
        }
        if (interception.response) {
          const results = JSON.parse(interception.response.body);
          if (interception.response.statusCode == 200)
            expect(interception.response.statusCode).to.eq(200);;
          expect(results.status).to.eq("OK")
          expect(results.csv_data).not.null
        }

      });
    })
  });

  it('should click New Receiving Number button and navigate to  add Receiving Number screen', () => {
    cy.wait("@refreshedReceivingNumbers").then(() => {
      cy.get('[data-cy="receiving-numbers-add-new-button"]').should('be.visible').click();
      cy.wait(3000);
      cy.url().should('include', '/service/routing/receiving/add');
    });
  });
});
