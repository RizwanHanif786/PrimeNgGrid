import { environment } from "src/environments/environment";

describe("Edit Tracking Number Feature", () => {
  const profile = environment.cypress; 
  beforeEach(() => {
      console.log(profile, 'profile')
      cy.login(profile.username, profile.password);
      cy.wait(1000);
      cy.intercept("GET",`${Cypress.env("trackingNumbersEndpoint")}/tracking_numbers*`).as("trackingNumbers");
      cy.visit("/service/tracking-number");
      cy.wait(5000);
  });


  it("should Edit the tracking number by fill out the General Settings form, dial  action and service  and save changes", () => {
   
    cy.wait("@trackingNumbers").then((interception) => {
      const body = interception.response?.body;
      if(body.length){
      const editTrackingId = body[0].id;
      cy.get('[data-cy="edit-tracking-number-button"]')
        .should("be.visible")
        .eq(0)
        .click();
      cy.wait(1000);
      cy.url().should(
        "include",
        `/service/tracking-number/edit/${editTrackingId}`
      );
      cy.wait(5000);
      cy.get('[data-cy="general-tab-description-text-area"]')
        .clear()
        .type("new Test description");
       if(profile.username === 'sadmin') {   
      cy.get('[data-cy="general-tab-customer-dropdown"]')
        .click()
        .get("li")
        .contains("American Tax Solutions")
        .click();
       }
      cy.get('[data-cy="general-tab-trackingsource-dropdown"]').click();
      cy.wait(1000);
      cy.contains("Dial Routing").click();
      cy.get('[data-cy="routing-action-dropdown"]')
        .click()
        .get("li")
        .contains("Not Mapped")
        .click();
      cy.contains("Services").click();
      cy.wait(2000);

      cy.get("#inputtext").clear().type("123");
      cy.get('[data-cy="item"]').should("be.visible");
      cy.get('[data-cy="item"]').first().click({ force: true });

      cy.intercept(
        "POST",
        `${Cypress.env(
          "trackingNumbersEndpoint"
        )}/${editTrackingId}/UpdateTrackingSource*`
      ).as("updateTrackingNumber");
      cy.get('[data-cy="general-tab-save-changes-button-3"]').click({
        force: true,
      });

      cy.wait("@updateTrackingNumber").then((interception: any) => {
        if (interception.request.body) {
          const payload = interception.request.body;
          expect(payload.customerId).to.eq(2);
          expect(payload.description).to.eq("new Test description");
          expect(payload.id).to.eq(editTrackingId);
          expect(payload.routing_action).to.eq("NOT_MAPPED");
          expect(payload.Customer.companyName).to.eq("American Tax Solutions");
        }
        if (interception.response.body) {
          const response = interception.response.body;
          if (response) {
            expect(response.customerId).to.eq(2);
            expect(response.id).to.eq(editTrackingId);
            expect(response.recording_enable).to.eq("0");
            expect(response.routing_action).to.eq("NOT_MAPPED");
            expect(response.transcribe_enable).to.eq("0");
            cy.url().should("include", "service/tracking-number");
          }
        }
      });
    };
    });
  });

  it("should delete the tracking number", () => {
    
    cy.wait("@trackingNumbers").then((interception) => {
      const body = interception.response?.body;
      if(body.length){
      const editTrackingId = body[0].id;
      cy.get('[data-cy="edit-tracking-number-button"]')
        .should("be.visible")
        .eq(0)
        .click();
      cy.wait(1000);
      cy.url().should(
        "include",
        `/service/tracking-number/edit/${editTrackingId}`
      );
      cy.wait(5000);

      cy.get('[data-cy="release-tracking-number-button"]').click();
      cy.intercept("POST", `api/v1/NumberProviders/release*`).as(
        "releaseTrackingNumbers"
      );
      cy.contains("Yes").click();
      cy.wait("@releaseTrackingNumbers").then((interception: any) => {
        if (interception.request.body) {
          console.log(interception, 'interception')
          const payload = JSON.parse(interception.request.body.number);
          expect(payload.ReceivingNumber.customerId).to.eq(payload.customerId);
          expect(payload.TrackingSources.customerId).to.eq(payload.customerId);
          if (payload.customerId == 2)
            expect(payload.Customer.companyName).to.eq(
              "American Tax Solutions"
            );
        }
        if (interception.response.body) {
          const response = interception.response.body;
          if (response) {
            expect(response.message).to.eq("Number successfully released!");
            expect(response.statusCode).to.eq(200);
            cy.url().should("include", "service/tracking-number");
          }
        }
      });
    };
    });
  });
});
