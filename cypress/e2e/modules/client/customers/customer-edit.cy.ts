import { environment } from "src/environments/environment";

describe("Edit Customer Feature", () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.intercept("GET", `${Cypress.env("customersEndpoint")}*`).as("refreshedCustomers");
        cy.visit("/service/customer");
        cy.wait(5000);
    });

   if(profile.username == 'sadmin'){
    it("should Edit compnay name, id, email, address, city, state, zip, phone ,ein and  save changes  and navigate to customer list screen", () => {
        cy.wait("@refreshedCustomers").then((interception) => {
            const body = interception.response?.body;
            if (body?.length) {
                const customerId = body[body.length - 1].id;
                cy.get('[data-cy="edit-customer-button"]')
                    .should("be.visible")
                    .eq(body.length - 1)
                    .click();
                cy.wait(1000);
                cy.url().should(
                    "include",
                    `/service/customer/edit/${customerId}`
                );
                const name = 'American Consultancy Firm'
                const id = "9909"
                const email = "test@123.com"
                const address = "Hometown, Florida"
                const city = "Florida"
                const country = "USA"
                const zip = "10001"
                const ein = "656"
                const fname = "Mike"
                const lname = "Tyson"
                const cEmail = "mkty101@gmail.com"

                cy.wait(3000)
                cy.get('[data-cy="edit-company-name"]').should("be.visible").clear().type(name, { force: true })
                cy.get('[data-cy="edit-company-id"]').should("be.visible").clear().type(id, { force: true });
                cy.get('[data-cy="edit-company-email"]').should("be.visible").clear().type(email, { force: true });
                cy.get('[data-cy="edit-company-address"]').should("be.visible").clear().type(address, { force: true });
                cy.get('[data-cy="edit-company-city"]').should("be.visible").clear().type(city, { force: true });
                cy.get('[data-cy="edit-company-country"]').should("be.visible").clear().type(country, { force: true });
                cy.get('[data-cy="edit-company-state"]').should("be.visible").clear().type(city, { force: true });
                cy.get('[data-cy="edit-company-zip"]').should("be.visible").clear().type(zip, { force: true });
                cy.get('[data-cy="edit-company-ein"]').should("be.visible").clear().type(ein, { force: true });
                cy.contains("Contact").click();
                cy.wait(1000)
                cy.get('[data-cy="edit-contact-fname"]').should("be.visible").clear().type(fname, { force: true })
                cy.get('[data-cy="edit-contact-lname"]').should("be.visible").clear().type(lname, { force: true });
                cy.get('[data-cy="edit-contact-email"]').should("be.visible").clear().type(cEmail, { force: true });

                cy.contains("Billing Settings").click();
                cy.wait(1000)

                cy.get('[data-cy="inbound-cost-field"] input').should("be.visible").clear().type('0.0002', { force: true })
                cy.get('[data-cy="outbound-cost-field"] input').should("be.visible").clear().type('0.0002', { force: true });

                cy.intercept("PUT", `${Cypress.env("customersEndpoint")}*`).as("updateCustomer");
                cy.get('[data-cy="save-settings-changes-button"]').click();
                cy.wait("@updateCustomer").then((interception: any) => {
                    if (interception.request.body) {
                        const payload = interception.request.body;
                        expect(payload?.companyName).to.eq(name);
                        expect(payload?.companyId).to.eq(id);
                        expect(payload?.billingEmail).to.eq(email);
                        expect(payload?.address).to.eq(address);
                        expect(payload?.city).to.eq(city);
                        expect(payload?.country).to.eq(country);
                        expect(payload?.contactEmail).to.eq(cEmail);
                        expect(payload?.zip).to.eq(zip);
                        expect(payload?.vatNumber).to.eq(ein);
                        expect(payload?.id).to.exist;
                    }
                    if (interception.response.body) {
                        const response = interception.response.body;
                        expect(response?.companyName).to.eq(name);
                        expect(response?.companyId).to.eq(id);
                        expect(response?.billingEmail).to.eq(email);
                        expect(response?.address).to.eq(address);
                        expect(response?.city).to.eq(city);
                        expect(response?.country).to.eq(country);
                        expect(response?.contactEmail).to.eq(cEmail);
                        expect(response?.zip).to.eq(zip);
                        expect(response?.vatNumber).to.eq(ein);
                        expect(response?.id).to.exist;
                        cy.url().should("include", `/service/customer`);
                    }
                });

            }
        });
    });
   }

});
