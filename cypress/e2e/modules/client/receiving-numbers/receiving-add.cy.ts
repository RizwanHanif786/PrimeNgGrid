import { environment } from "src/environments/environment";

describe("New Receiving Number Feature", () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.visit("/service/routing/receiving/add");
        cy.wait(5000);
    });

    function generateRandomUSPhoneNumber() {
        const areaCodes = [201, 202, 212, 213, 312, 415, 516, 617, 718, 917];
        const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
        const centralOfficeCode = Math.floor(Math.random() * 900) + 100;
        const lineNumber = Math.floor(Math.random() * 9000) + 1000;

        return `${areaCode}${centralOfficeCode}${lineNumber}`;
    }

    it("should display the page title ", () => {
        cy.get('[data-cy="page_title"]')
            .should("be.visible")
            .and("contain.text", "New Receiving Number");
    });

    it("should select country, add phone number, select customer, and create a new receiving number and navigate  Receiving numbers screen", () => {
        const phoneNumber = generateRandomUSPhoneNumber();
        cy.wait(5000);
        cy.get('[data-cy="add-receiving-countries-dropdown"]')
            .should("be.visible")
            .click();
        cy.get(".p-dropdown-item").contains("United States").click();
        cy.get('[data-cy="add-receiving-country-phone-number"]')
            .should("be.visible")
            .type(phoneNumber);

        if (profile.username == 'sadmin') {
            cy.get('[data-cy="add-receiving-customer-dropdown"]')
                .should("be.visible")
                .click();
            cy.get(".p-dropdown-item").should("be.visible", { force: true });
            cy.get(".p-dropdown-item").eq(1).click({ force: true });
            cy.get(".p-dropdown-label").should("contain", "Tech Fusion ITc");
        }
        cy.get('[data-cy="add-receiving-description-field"]')
            .should("be.visible")
            .type('test');

        cy.intercept("POST", `${Cypress.env("receivingNumbersEndpoint")}*`).as(
            "addNewReceivingNumber"
        );
        cy.get('[data-cy="create-new-receiving-number-button"]').should("be.visible").click();
        cy.wait("@addNewReceivingNumber").then((interception: any) => {
            if (interception.request.body) {
                const payload = interception.request.body;
                expect(payload.customerId).to.exist;
                expect(payload.total_calls).to.exist;
                expect(payload.tracking_numbers).to.exist;
                expect(payload.description).to.eq("test");
                expect(payload.number).to.eq(`+1${phoneNumber}`);
            }
            if (interception.response.body) {
                const response = interception.response.body;
                if (response.error) {
                    expect(response.error.statusCode).to.eq("422");
                    expect(response.error.name).to.eq("Error");
                    expect(response.error.code).to.eq("ER_DUP_ENTRY");
                } else {
                    expect(response.customerId).to.eq(interception.request.body.customerId);
                    expect(response.total_calls).to.exist;
                    expect(response.id).to.exist;
                    expect(response.number).to.eq(interception.request.body.number);
                    cy.url().should("include", `/service/routing/receiving`);
                }
            }
        });
    });
});
