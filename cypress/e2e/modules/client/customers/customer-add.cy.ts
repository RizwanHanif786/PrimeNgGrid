import { environment } from "src/environments/environment";

describe("New Customer Feature", () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.visit("/service/customer/add");
        cy.wait(5000);
    });

    if (profile.username == 'sadmin') {

        it("should display the page title ", () => {
            cy.get('[data-cy="page_title"]')
                .should("be.visible")
                .and("contain.text", "New Customer");
        });

        it("should add compnay name, id, email,address, city, state, zip, phone ,ein and  create a new customer  and navigate to customer list screen", () => {
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
            cy.get('[data-cy="add-company-name"]').should("be.visible").type(name, { force: true })
            cy.get('[data-cy="add-company-id"]').should("be.visible").type(id, { force: true });
            cy.get('[data-cy="add-company-email"]').should("be.visible").type(email, { force: true });
            cy.get('[data-cy="add-company-address"]').should("be.visible").type(address, { force: true });
            cy.get('[data-cy="add-company-city"]').should("be.visible").type(city, { force: true });
            cy.get('[data-cy="add-company-country"]').should("be.visible").type(country, { force: true });
            cy.get('[data-cy="add-company-state"]').should("be.visible").type(city, { force: true });
            cy.get('[data-cy="add-company-zip"]').should("be.visible").type(zip, { force: true });
            cy.get('[data-cy="add-company-ein"]').should("be.visible").type(ein, { force: true });
            cy.contains("Contact").click();
            cy.wait(1000)           
            cy.get('[data-cy="add-contact-fname"]').should("be.visible").type(fname, { force: true })
            cy.get('[data-cy="add-contact-lname"]').should("be.visible").type(lname, { force: true });
            cy.get('[data-cy="add-contact-email"]').should("be.visible").type(cEmail, { force: true });

            cy.intercept("POST", `${Cypress.env("customersEndpoint")}*`).as("addNewCustomer");
            cy.get('[data-cy="create-customer-button"]').should("be.visible").click();
            cy.wait("@addNewCustomer").then((interception: any) => {
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
           
        })
    }
});
