import { environment } from "src/environments/environment";

describe('IVR Feature', () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.intercept('GET', `${Cypress.env('ivrsEndpoint')}*`).as('refreshedIvrs');
        cy.visit('/service/ivr');
        cy.wait(5000);

    });

    it('should navigate to Manage Voice Menus  screen', () => {
        cy.url().should('include', '/service/ivr');
    });

    it('should display the page title ', () => {
        cy.get('[data-cy="page-title"]').should('be.visible').and('contain.text', 'Manage Voice Menus');
    });


    if (profile.username == 'sadmin') {
        it('should select a customer from the customers dropdown to retrieve ivrs and count', () => {
            cy.wait("@refreshedIvrs").then(() => {
                const addRequestAssertions = (interception: any) => {
                    const decodedParams = JSON.parse(interception.request.query.filter);
                    const customerIdConditon = decodedParams.where.and[0].customerId

                    expect(decodedParams.limit).to.eq(15);
                    expect(decodedParams.skip).to.eq(0);
                    expect(customerIdConditon).to.eq(1);

                }
                cy.wait(2000);
                cy.intercept('GET', `${Cypress.env('ivrsEndpoint')}*`).as('ivrs');
                cy.intercept('GET', `${Cypress.env('ivrsEndpoint')}/count*`).as('ivrsCount');
                cy.get('[data-cy="ivr-customer-dropdown"]').should("be.visible").click();
                cy.wait(2000)
                cy.get(".p-dropdown-item").should("be.visible", { force: true });
                cy.get(".p-dropdown-item").eq(1).click({ force: true });
                cy.wait(1000);
                cy.get('[data-cy="ivr-customer-dropdown"] .p-dropdown-label').should('contain', 'Tech Fusion ITc');
                cy.wait(1000);


                cy.wait('@ivrs').then((interception: any) => {
                    if (interception.request.query.filter) {
                        addRequestAssertions(interception)
                    }
                    if (interception.response) {
                        const results = interception.response.body;
                        // Response Assertions
                        if (results.length) {
                            expect(results).to.have.length.greaterThan(0);
                        } else {
                            expect(results).to.have.length(0);
                        }
                    }

                    cy.wait('@ivrsCount').then((interception: any) => {
                        if (interception.request.query.filter) {
                            const decodedParams = JSON.parse(interception.request.query.filter);
                            expect(decodedParams.where.customerId).to.eq(1);
                            expect(decodedParams.access_token).to.exist;

                        }
                        // Response Assertions
                        if (interception.response) {
                            const count = interception.response.body.count;
                           if(interception.response.statusCode == 200)
                            expect(interception.response.statusCode).to.eq(200);;
                            cy.get('[data-cy="ivr-total-count"]')
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

    it('it should type ivr keyword and  search to retrieve ivrs and count', () => {
        const addRequestAssertions = (interception: any) => {
            const decodedParams = JSON.parse(interception.request.query.filter);
            const filters = decodedParams.where.and[0].or;

            expect(decodedParams.limit).to.eq(15);
            expect(decodedParams.skip).to.eq(0);
            expect(filters).to.include.deep.members([
                { "description": { "like": "%ivr%" } },
                { "name": { "like": "%ivr%" } }
            ]);
            expect(interception.request.query.access_token).to.exist;
        };


        cy.wait("@refreshedIvrs").then(() => {
            cy.get('[data-cy="ivr-search"]').should('be.visible').type('ivr');
            cy.intercept('GET', `${Cypress.env('ivrsEndpoint')}*`).as('ivrs');
            cy.intercept('GET', `${Cypress.env('ivrsEndpoint')}/count*`).as('ivrsCount');
            cy.get('[data-cy="ivr-search-button"]').should('be.visible').click();

            cy.wait('@ivrs').then((interception: any) => {
                if (interception.request.query.filter) {
                    addRequestAssertions(interception)
                }
                if (interception.response) {
                    const results = interception.response.body;
                    // Response Assertions
                   if(interception.response.statusCode == 200)
expect(interception.response.statusCode).to.eq(200);;
                    if (results.length) {
                        expect(results).to.have.length.greaterThan(0);
                    } else {
                        expect(results).to.have.length(0);
                    }
                }
            });

            cy.wait('@ivrsCount').then((interception: any) => {
                if (interception.request.query.filter) {
                    const decodedParams = JSON.parse(interception.request.query.filter);
                    const filters = decodedParams.where.or;

                    // Request Assertions             
                    expect(filters).to.include.deep.members([
                        { "description": { "like": "%ivr%" } },
                        { "name": { "like": "%ivr%" } }
                    ]);
                    expect(interception?.request?.query?.access_token).to.exist;

                }
                // Response Assertions
                if (interception.response) {
                    const count = interception.response.body.count;
                   if(interception.response.statusCode == 200)
expect(interception.response.statusCode).to.eq(200);;
                    cy.get('[data-cy="ivr-total-count"]')
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



    it('should click Add new voice menu button and navigate to  new voice menu screen', () => {
        cy.wait("@refreshedIvrs").then(() => {
            cy.get('[data-cy="ivr-add-new-button"]').should('be.visible').click();
            cy.wait(3000);
            cy.url().should('include', '/service/ivr/add');
        });
    });



});
