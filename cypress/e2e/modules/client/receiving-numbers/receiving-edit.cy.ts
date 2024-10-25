import { environment } from "src/environments/environment";

describe("Edit Receiving Number Feature", () => {
    const profile = environment.cypress;

    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.intercept("GET", `${Cypress.env("receivingNumbersEndpoint")}/receiving_numbers*`).as("receivingNumbers");
        cy.visit("/service/routing/receiving");
        cy.wait(5000);
    });

    function generateRandomUSPhoneNumber() {
        const areaCodes = [201, 202, 212, 213, 312, 415, 516, 617, 718, 917];
        const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
        const centralOfficeCode = Math.floor(Math.random() * 900) + 100;
        const lineNumber = Math.floor(Math.random() * 9000) + 1000;

        return `${areaCode}${centralOfficeCode}${lineNumber}`;
    }

    it("should Edit the tracking number by editing  the general tab form and save changes", () => {
        cy.wait("@receivingNumbers").then((interception) => {
            const body = interception.response?.body;
            if(body?.length) {
            const editReceivingId = body[0].id;
            cy.get('[data-cy="edit-receiving-number-button"]')
                .should("be.visible")
                .eq(0)
                .click();
            cy.wait(1000);
            cy.url().should(
                "include",
                `/service/routing/receiving/edit/${editReceivingId}`
            );
            cy.wait(5000);

            cy.get('[data-cy="page-title"]')
                .should("be.visible")
                .and("contain.text", "Edit Receiving Number");

            const phoneNumber = generateRandomUSPhoneNumber();
            cy.get('[data-cy="edit-receiving-countries-dropdown"]')
                .should("be.visible")
                .click();
            cy.get(".p-dropdown-item").contains("United States").click();
            cy.get('[data-cy="edit-receiving-country-phone-number"]')
                .should("be.visible")
                .clear()
                .type(phoneNumber);

            if (profile.username == 'sadmin') {
                cy.get('[data-cy="edit-receiving-customer-dropdown"]')
                    .should("be.visible")
                    .click();
                cy.get(".p-dropdown-item").should("be.visible", { force: true });
                cy.get(".p-dropdown-item").eq(0).click({ force: true });
                cy.get(".p-dropdown-label").should("contain", "Tech Fusion ITc");
            }
            cy.get('[data-cy="edit-receiving-description-field"]')
                .should("be.visible")
                .clear()
                .type('new receiving number description');


            cy.intercept("PUT", `${Cypress.env("receivingNumbersEndpoint")}*`).as("updateReceivingNumber");
            cy.get('[data-cy="edit-receiving-number-save-button"]').click();
            cy.wait("@updateReceivingNumber").then((interception: any) => {
                if (interception.request.body) {
                    const payload = interception.request.body;
                    expect(payload.customerId).to.exist;
                    expect(payload.tracking_numbers).to.exist;
                    expect(payload.description).to.eq("new receiving number description");
                    expect(payload.number).to.eq(`+1${phoneNumber}`);
                    expect(payload.id).to.eq(editReceivingId);

                }
                if (interception.response.body) {
                    const response = interception.response.body;
                    if (response.error) {
                        expect(response.error.statusCode).to.eq("422");
                        expect(response.error.name).to.eq("Error");
                        expect(response.error.code).to.eq("ER_DUP_ENTRY");
                    } else {
                        expect(response.customerId).to.exist;
                        expect(response.id).to.eq(editReceivingId);
                        expect(response.number).to.eq(interception.request.body.number);
                        cy.url().should("include", `/service/routing/receiving`);
                    }
                }
            });
        };
        });
    });


});
