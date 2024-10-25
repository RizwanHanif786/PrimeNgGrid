import { environment } from "src/environments/environment";

describe("New Tracking Number Feature", () => {
  const profile = environment.cypress;
  beforeEach(() => {
    cy.login(profile.username, profile.password);
    cy.wait(1000);
    cy.visit("/service/tracking-number/add");
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
    cy.wait(5000);
    cy.get('[data-cy="page_title"]')
      .should("be.visible")
      .and("contain.text", "New Tracking Number");
  });

  it("should select country, add phone number, select customer, and create a new tracking number and navigate to newly created Tracking number", () => {
    const phoneNumber = generateRandomUSPhoneNumber();
    cy.wait(5000);
    cy.get('[data-cy="add-tracking-countries-dropdown"]')
      .should("be.visible")
      .click();
    cy.get(".p-dropdown-item").contains("United States").click();
    cy.get('[data-cy="add-tracking-country-phone-number"]')
      .should("be.visible")
      .type(phoneNumber);
    if (profile.username == 'sadmin') {
      cy.get('[data-cy="add-tracking-customer-dropdown"]')
        .should("be.visible")
        .click();
      cy.get(".p-dropdown-item").should("be.visible", { force: true });
      cy.get(".p-dropdown-item").eq(0).click({ force: true });
      cy.wait(1000);
      cy.get(".p-dropdown-label").should("contain", "American Tax Solutions");
    }
    cy.intercept("PUT", `${Cypress.env("trackingNumbersEndpoint")}*`).as(
      "addNewTrackingNumber"
    );
    cy.get('[data-cy="create-new-tracking-number-buttom"]')
      .should("be.visible")
      .click();
    cy.wait("@addNewTrackingNumber").then((interception: any) => {
      if (interception.request.body) {
        const payload = interception.request.body;
        expect(payload.customerId).to.exist;
        expect(payload.notifications).to.eq(0);
        expect(payload.tracking_number).to.eq(`+1${phoneNumber}`);
        expect(payload.tracking_sourceId).to.eq(1);
      }
      if (interception.response.body) {
        const response = interception.response.body;
        if (response.error) {
          expect(response.error.statusCode).to.eq("422");
          expect(response.error.name).to.eq("Error");
          expect(response.error.code).to.eq("ER_DUP_ENTRY");
        } else {

          expect(response.customerId).to.eq(interception.request.body.customerId);
          expect(response.notifications).to.eq(0);
          expect(response.tracking_number).to.eq(interception.request.body.tracking_number);
          expect(response.tracking_sourceId).to.eq(1);
          expect(response.id).to.exist;
          cy.url().should(
            "include",
            `service/tracking-number/edit/${response.id}`
          );
        }
      }
    });
  });
});
