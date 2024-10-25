import { environment } from "src/environments/environment";

describe('Tracking Numbers Feature', () => {
  const profile = environment.cypress;
  beforeEach(() => {
    cy.login(profile.username, profile.password);
    cy.intercept('GET', `${Cypress.env('trackingNumbersEndpoint')}/tracking_numbers*`).as('refreshedTrackingNumbers');
    cy.visit('/service/tracking-number');
    cy.wait(5000);

  });

  it('should navigate to tracking numbers screen', () => {
    cy.url().should('include', '/service/tracking-number');
  });

  it('should display the page title ', () => {
    cy.get('[data-cy="page-title"]').should('be.visible').and('contain.text', 'Tracking Numbers');
  });


  if (profile.username == 'sadmin') {
    it('should select a customer from the customers dropdown and search to retrieve tracking numbers and count', () => {
      cy.wait("@refreshedTrackingNumbers").then(() => {
        const addRequestAssertions = (interception: any) => {
          const decodedParams = JSON.parse(interception.request.query.filter);
          const customerIdConditon = decodedParams.where.customerId

          expect(decodedParams.limit).to.eq(10);
          expect(decodedParams.skip).to.eq(0);
          expect(decodedParams.order).to.eq("tracking_number asc");
          expect(customerIdConditon).to.eq(1);

        }
        cy.wait(2000);
        cy.get('[data-cy="tracking-numbers-customer-label"]').should('be.visible').should('have.text', 'Customer');
        cy.get('[data-cy="tracking-numbers-customer-dropdown"]').should("be.visible").click();
        cy.wait(2000)
        cy.get(".p-dropdown-item").should("be.visible", { force: true });
        cy.get(".p-dropdown-item").eq(1).click({ force: true });
        cy.wait(1000);
        cy.get('[data-cy="tracking-numbers-customer-dropdown"] .p-dropdown-label').should('contain', 'Tech Fusion ITc');
        cy.wait(1000);
        cy.intercept('GET', `${Cypress.env('trackingNumbersEndpoint')}/tracking_numbers*`).as('trackingNumbers');
        cy.intercept('GET', `${Cypress.env('trackingNumbersEndpoint')}/tracking_numbers/count*`).as('trackingNumbersCount');
        cy.get('[data-cy="tracking-numbers-search-button"]').should('be.visible').click();

        cy.wait('@trackingNumbers').then((interception: any) => {
          if (interception.request.query.filter) {
            addRequestAssertions(interception)
          }
          if (interception.response) {
            const results = interception.response.body;
            // Response Assertions
            expect(interception.response.statusCode).to.eq(200);
            if (results.length) {
              expect(results).to.have.length.greaterThan(0);
            } else {
              expect(results).to.have.length(0);
            }
          }

          cy.wait('@trackingNumbersCount').then((interception: any) => {
            if (interception.request.query.filter) {
              const decodedParams = JSON.parse(interception.request.query.filter);
              expect(decodedParams.where.customerId).to.eq(1);
              expect(decodedParams.access_token).to.exist;

            }
            // Response Assertions
            if (interception.response) {
              const count = interception.response.body;
              expect(interception.response.statusCode).to.eq(200);
              cy.get('[data-cy="tracking-numbers-total-count"]')
                .should('be.visible')
                .invoke('text')
                .then((text) => {
                  let totalCount = 0
                  const match = text.match(/\d+/)
                  if (match) {
                    totalCount = Number(match[0])
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
        })

      });
    })
  }
  
  it('it should type test keyword and  search to retrieve tracking numbers and count', () => {
    const addRequestAssertions = (interception: any) => {
      const decodedParams = JSON.parse(interception.request.query.filter);
      const filters = decodedParams.where.and[1].or;

      expect(decodedParams.limit).to.eq(10);
      expect(decodedParams.skip).to.eq(0);
      expect(decodedParams.order).to.eq("tracking_number asc");
      expect(filters).to.include.deep.members([
        { "description": { "like": "%test%" } },
        { "TrackingSources.name": { "like": "%test%" } },
        { "Customer.companyId": { "like": "%test%" } },
        { "SipGateways.address": { "like": "%test%" } },
        { "routing_action": { "like": "%test%" } }
      ]);
      expect(interception.request.query.access_token).to.exist;
    }

    cy.wait("@refreshedTrackingNumbers").then(() => {
      cy.get('[data-cy="tracking-numbers-search"]').should('be.visible').type('test');
      cy.intercept('GET', `${Cypress.env('trackingNumbersEndpoint')}/tracking_numbers*`).as('trackingNumbers');
      cy.intercept('GET', `${Cypress.env('trackingNumbersEndpoint')}/tracking_numbers/count*`).as('trackingNumbersCount');
      cy.get('[data-cy="tracking-numbers-search-button"]').should('be.visible').click();

      cy.wait('@trackingNumbers').then((interception: any) => {
        if (interception.request.query.filter) {
          addRequestAssertions(interception)
        }
        if (interception.response) {
          const results = interception.response.body;
          // Response Assertions
          expect(interception.response.statusCode).to.eq(200);
          if (results.length) {
            expect(results).to.have.length.greaterThan(0);
          } else {
            expect(results).to.have.length(0);
          }
        }
      });

      cy.wait('@trackingNumbersCount').then((interception: any) => {
        if (interception.request.query.filter) {
          const decodedParams = JSON.parse(interception.request.query.filter);
          const filters = decodedParams.where.and[1].or;

          // Request Assertions             
          expect(filters).to.include.deep.members([
            { "description": { "like": "%test%" } },
            { "TrackingSources.name": { "like": "%test%" } },
            { "Customer.companyId": { "like": "%test%" } },
            { "SipGateways.address": { "like": "%test%" } },
            { "routing_action": { "like": "%test%" } }
          ]);
          expect(interception?.request?.query?.access_token).to.exist;

        }
        // Response Assertions
        if (interception.response) {
          const count = interception.response.body;
          expect(interception.response.statusCode).to.eq(200);
          cy.get('[data-cy="tracking-numbers-total-count"]')
            .should('be.visible')
            .invoke('text')
            .then((text) => {
              let totalCount = 0
              const match = text.match(/\d+/)
              if (match) {
                totalCount = Number(match[0])
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


  it('should export tracking Numbers', () => {
    cy.wait("@refreshedTrackingNumbers").then(() => {
      cy.wait(2000);
      cy.intercept('GET', `${Cypress.env('trackingNumbersEndpoint')}/bulk_download*`).as('bulkDownloads');
      cy.get('[data-cy="tracking-numbers-export"]').should('be.visible').click({ force: true });
      cy.wait(1000);
      cy.wait('@bulkDownloads').then((interception: any) => {
        if (interception.request.query) {
          const queryparams = interception.request.query;
          expect(queryparams?.access_token).to.exist;
          expect(queryparams?.sorting).to.eq("tracking_number asc")
        }
        if (interception.response) {
          const results = JSON.parse(interception.response.body);
          expect(interception.response.statusCode).to.eq(200);
          expect(results.status).to.eq("OK")
          expect(results.csv_data).not.null
        }

      });
    });
  });

  it('should click New Tracking Number button and navigate to  add tracking Number screen', () => {
    cy.wait("@refreshedTrackingNumbers").then(() => {
      cy.get('[data-cy="tracking-numbers-add-new-button"]').should('be.visible').click();
      cy.wait(3000);
      cy.url().should('include', '/service/tracking-number/add');
    });
  });
  it('should click New Tracking Number button and navigate to  add tracking Number screen', () => {
    cy.wait("@refreshedTrackingNumbers").then(() => {
      cy.get('[data-cy="tracking-numbers-add-new-button"]').should('be.visible').click();
      cy.wait(3000);
      cy.url().should('include', '/service/tracking-number/add');
    });
  });



});
