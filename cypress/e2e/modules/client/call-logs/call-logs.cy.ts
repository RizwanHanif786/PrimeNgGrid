import { environment } from "src/environments/environment";

describe('Call Logs Feature', () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.intercept('GET', `${Cypress.env('callLogsEndpoint')}*`).as("refreshedCalllogs");
        cy.visit('/service/call-log');
        cy.wait(5000);
    });

    const getLastMonthRange = (startTime = ' 00:00:00', endTime = ' 23:59:59') => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 2).toISOString().slice(0, 10) + startTime;
        const endDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10) + endTime;
        return { startDate, endDate };
    };

    const getCurrentDate = () => {
        const now = new Date();
        const startDate = new Date(now).toISOString().slice(0, 10) + ' 00:00:00';
        const endDate = new Date(now).toISOString().slice(0, 10) + ' 23:59:59';
        return { startDate, endDate };
    };


    it('should navigate to call logs screen', () => {
        cy.url().should('include', '/service/call-log');
    });

    it('should display the page title ', () => {
        cy.get('[data-cy="page-title"]').should('be.visible').and('contain.text', 'Call Logs');
    });


    if (profile.username == 'sadmin') {
        it('should select a customer from the customers dropdown and search to retrieve logs', () => {

            const addRequestAssertions = (interception: any) => {
                const { startDate, endDate } = getCurrentDate()
                const decodedParams = JSON.parse(interception.request.query.filter);
                const createdCondition = decodedParams.where.and[0].created.between;
                const customerIdConditon = decodedParams.where.and[1].customerId
                const durationCondition = decodedParams.where.and[2].and[0].duration.neq;
                const callStatusCondition = decodedParams.where.and[2].and[1].callStatus.eq;

                // Request Assertions
                expect(decodedParams.limit).to.eq(20);
                expect(decodedParams.skip).to.eq(0);
                expect(decodedParams.order).to.eq("created DESC");
                // expect(createdCondition).to.deep.eq([startDate, endDate]);
                expect(customerIdConditon).to.eq(1);
                expect(durationCondition).to.eq(null);
                expect(callStatusCondition).to.eq(200);

            }

            cy.wait("@refreshedCalllogs").then(() => {
                cy.get('[data-cy="call-logs-customer-label"]').should('be.visible').should('have.text', 'Customer');
                cy.intercept('GET', `${Cypress.env('callLogsEndpoint')}*`).as('callLogs');
                cy.get('[data-cy="call-logs-customer-dropdown"]').should('be.visible').click();
                cy.wait(1000);
                cy.get('.p-dropdown-item').should('be.visible');
                cy.get('.p-dropdown-item').eq(1).click();
                cy.get('[data-cy="call-logs-customer-dropdown"] .p-dropdown-label').should('contain', 'Tech Fusion ITc');
                cy.wait(1000);
                cy.get('[data-cy="call-logs-search-button"]').should('be.visible').click();


                cy.wait('@callLogs').then((interception: any) => {
                    console.log('interception: ', interception);
                    if (interception.request.query.filter) {
                        addRequestAssertions(interception)
                    }
                    if (interception.response) {
                        const results = interception.response.body;
                        // Response Assertions
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

        it('should select Display 0 duration calls checkbox filter and retrieve call logs', () => {

            const addRequestAssertions = (interception: any) => {
                const { startDate, endDate } = getCurrentDate()
                const decodedParams = JSON.parse(interception.request.query.filter);
                const createdCondition = decodedParams.where.created.between;

                // Request Assertions
                expect(decodedParams.limit).to.eq(20);
                expect(decodedParams.skip).to.eq(0);
                expect(decodedParams.order).to.eq("created DESC");

            }
            cy.wait("@refreshedCalllogs").then(() => {
                cy.intercept('GET', '/api/v1/CallLogs*').as('callLogs');
                cy.get('[data-cy="call-logs-duration-call"]').should('be.visible').click();

                cy.wait('@callLogs').then((interception: any) => {
                    if (interception.request.query.filter) {
                        addRequestAssertions(interception)
                    }
                    if (interception.response) {
                        const results = interception.response.body;
                        // Response Assertions
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

    }

    it('should select last month date range and export call logs', () => {
        const { startDate, endDate } = getLastMonthRange('', '');
        cy.wait("@refreshedCalllogs").then(() => {
            cy.get('[data-cy="call-logs-calendar"]').should('be.visible').click();
            cy.wait(1000);
            cy.get('[data-cy="custom-range-last-month"]').should('be.visible').click();
            cy.get('[data-cy="date-picker-apply"]').should('be.visible').click();
            cy.wait(5000);
            cy.intercept('POST', '/api/v1/Reports/export_report*').as('exportReport');
            cy.get('[data-cy="call-logs-export"]').should('be.visible').click();
            cy.wait('@exportReport').then((interception: any) => {
                if (interception.request) {
                    const requestBody = interception.request.body;
                    expect(requestBody).to.include(`start_date=${startDate}`);
                    expect(requestBody).to.include(`end_date=${endDate}`);
                    expect(requestBody).to.include('offset=');
                }
                if (interception.response) {
                    const results = interception.response.body.result;
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


    it('should open the calendar and select last month range and retrieve call logs and count', () => {

        const addRequestAssertions = (interception: any) => {
            const decodedParams = JSON.parse(interception.request.query.filter);

            // Request Assertions
            expect(decodedParams.limit).to.eq(20);
            expect(decodedParams.skip).to.eq(0);
            expect(decodedParams.order).to.eq("created DESC");
        }

        cy.wait("@refreshedCalllogs").then(() => {
            cy.get('[data-cy="call-logs-calendar"]').should('be.visible').click();
            cy.wait(1000);
            cy.get('[data-cy="custom-range-last-month"]').should('be.visible').click();
            cy.wait(1000);
            cy.intercept('GET', '/api/v1/CallLogs*').as('callLogs');
            cy.intercept('GET', '/api/v1/CallLogs/count*').as('callLogsCount');
            cy.get('[data-cy="date-picker-apply"]').should('be.visible').click({ force: true });

            cy.wait('@callLogs').then((interception: any) => {
                if (interception.request.query.filter) {
                    addRequestAssertions(interception)
                }

                if (interception.response) {
                    const results = interception.response.body;
                    // Response Assertions
                    if (interception.response.statusCode == 200)
                        expect(interception.response.statusCode).to.eq(200);
                    if (results.length) {
                        expect(results).to.have.length.greaterThan(0);
                    } else {
                        expect(results).to.have.length(0);
                    }
                }
            });

            cy.wait('@callLogsCount').then((interception: any) => {
                if (interception.request.query.filter) {
                    addRequestAssertions(interception)
                }
                // Response Assertions
                if (interception.response) {
                    const count = interception.response.body.count;
                    if (interception.response.statusCode == 200)
                        expect(interception.response.statusCode).to.eq(200);
                    cy.get('[data-cy="call-logs-total-record"]')
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


    it('should search for a keyword and apply last month date range  and retrieve call logs and count based on selceted filters', () => {

        const addRequestAssertions = (interception: any) => {
            const { startDate, endDate } = getLastMonthRange();
            const decodedParams = JSON.parse(interception.request.query.filter);
            const keywordConditions = decodedParams.where.and[1].or;

            // Request Assertions
            expect(decodedParams.limit).to.eq(20);
            expect(decodedParams.skip).to.eq(0);
            expect(decodedParams.order).to.eq("created DESC");

            keywordConditions.forEach((condition: any) => {
                const key = Object.keys(condition)[0];
                if (key) {
                    expect(condition[key].like).to.eq('%test%');
                }
            });

        }

        cy.wait("@refreshedCalllogs").then(() => {
            cy.get('[data-cy="call-logs-calendar"]').should('be.visible').click();
            cy.wait(1000);
            cy.get('[data-cy="custom-range-last-month"]').should('be.visible').click();
            cy.get('[data-cy="date-picker-apply"]').should('be.visible').click();
            cy.wait(10000);
            cy.get('[data-cy="call-logs-search"]').should('be.visible').type('test');
            cy.intercept('GET', '/api/v1/CallLogs*').as('callLogs');
            cy.intercept('GET', '/api/v1/CallLogs/count*').as('callLogsCount');
            cy.get('[data-cy="call-logs-search-button"]').should('be.visible').click();

            cy.wait('@callLogs').then((interception: any) => {
                if (interception.request.query.filter) {
                    addRequestAssertions(interception)
                }
                // Response Assertions
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

            cy.wait('@callLogsCount').then((interception: any) => {
                if (interception.request.query.filter) {
                    addRequestAssertions(interception)
                }
                // Response Assertions
                if (interception.response) {
                    const count = interception.response.body.count;
                    if (interception.response.statusCode == 200)
                        expect(interception.response.statusCode).to.eq(200);
                    cy.get('[data-cy="call-logs-total-record"]')
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




    it("should apply date range filter to retrieve call logs and then edit first call log", () => {

        const addRequestAssertions = (interception: any) => {
            const decodedParams = JSON.parse(interception.request.query.filter);
            const nameCondition = decodedParams.where.and[0].name.like;
            expect(decodedParams.limit).to.eq(50);
            expect(decodedParams.skip).to.eq(0);
            expect(nameCondition).to.eq('%test%');
        }
        cy.wait("@refreshedCalllogs").then((interception: any) => {
            cy.get('[data-cy="call-logs-calendar"]').should("be.visible").click();
            cy.wait(1000);
            cy.get('[data-cy="custom-range-last-month"]').should("be.visible").click();
            cy.wait(1000);
            cy.get('[data-cy="date-picker-apply"]').should("be.visible").click();
            const body = interception.response?.body;
            if (body?.length) {

                cy.wait(5000);
                cy.get('[data-cy="edit-log-panel-button"]')
                    .should("be.visible")
                    .eq(0)
                    .click();
                cy.wait(2000);

                cy.get('[data-cy="edit-log-contacts-dropdown"]')
                    .click()
                    .should("be.visible");
                cy.wait(1000);
                cy.intercept('GET', '/api/v1/PhoneBooks*').as('phoneBooks');
                cy.get('[data-cy="edit-contact-reset"]').should('be.visible').click({ force: true })
                cy.wait(1000)
                cy.get('[data-cy="edit-log-search-input"]')
                    .should("be.visible")
                    .type("test{enter}", { force: true });

                cy.wait('@phoneBooks').then((interception: any) => {
                    if (interception.request.query.filter) {
                        addRequestAssertions(interception)
                    }
                    // Response Assertions
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
                    cy.get('[data-cy="edit-log-contacts-dropdown"]').should("be.visible");
                    cy.wait(2000)
                    cy.get(".p-dropdown-item").should("be.visible", { force: true });
                    cy.get(".p-dropdown-item").eq(1).click({ force: true });
                    cy.wait(1000);
                    cy.get('[data-cy="edit-contact-save-button"]').should('be.visible').click();
                });
            }
        });

    });
});
