import { environment } from "src/environments/environment";

describe("Edit IVR Feature", () => {
    beforeEach(() => {
        const profile = environment.cypress;
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.intercept('GET', `${Cypress.env('ivrsEndpoint')}*`).as('refreshedIvrs');
        cy.visit('/service/ivr');
        cy.wait(5000);
    });

    function generateRandomIVR() {
        const ivrNames = [
            "Customer Support",
            "Sales Inquiry",
            "Technical Assistance",
            "Account Management",
            "Billing Department",
            "Feedback Line",
            "Emergency Services",
            "Appointment Scheduler"
        ];

        const ivrDescriptions = [
            "Connect with a representative for assistance.",
            "Press 1 for product information, 2 for order status.",
            "Get help with your technical issues.",
            "Manage your account settings and preferences.",
            "Inquire about your billing and payment options.",
            "Share your feedback and suggestions with us.",
            "Dial 1 for emergencies, 2 for urgent inquiries.",
            "Schedule your appointments conveniently."
        ];

        const randomDescription = ivrDescriptions[Math.floor(Math.random() * ivrDescriptions.length)];
        const randomName = ivrNames[Math.floor(Math.random() * ivrNames.length)] + randomDescription;

        return {
            name: randomName,
            description: randomDescription
        };
    }


    it("should Edit the ivr name, description and prompt and save changes", () => {
        cy.wait("@refreshedIvrs").then((interception) => {
            const body = interception.response?.body;
            const randomIVR = generateRandomIVR();
            if (body?.length) {
                const ivrId = body[body.length - 1].id;
                cy.get('[data-cy="edit-ivr-button"]')
                    .should("be.visible")
                    .eq(body.length - 1)
                    .click();
                cy.wait(1000);
                cy.url().should(
                    "include",
                    `/service/ivr/edit/${ivrId}`
                ); 

                cy.wait(2000);
                cy.get('[data-cy="edit-ivr-name"]').should("be.visible").clear().type(randomIVR.name, { force: true })
                cy.get('[data-cy="edit-ivr-description"]').should("be.visible").clear().type(randomIVR.description, { force: true });
                cy.wait(1000)
                cy.get('[data-cy="info-next-button"]').click();
                cy.wait(1000)
                cy.get('[data-cy="edit-ivr-ts-button"]').click();
                cy.get('[data-cy="edit-ivr-wp-field"]').should("be.visible").type(randomIVR.description, { force: true });
                cy.get('[data-cy="prompt-next-button"]').click();
                cy.wait(1000)
                cy.intercept("PUT", `${Cypress.env("ivrsEndpoint")}/${ivrId}*`).as("updateIVR");
                cy.get('[data-cy="edit-ivr-save-button"]').click();
                cy.wait("@updateIVR").then((interception: any) => {
                    if (interception.request.body) {
                        const payload = interception.request.body;
                        expect(payload?.customerid).to.exist;
                        expect(payload?.rootTtsAudio).to.exist;
                        expect(payload?.id).to.exist;
                        expect(payload?.name).to.eq(randomIVR.name);
                        expect(payload?.description.replace(/\s/g, '')).to.eq(randomIVR.description.replace(/\s/g, ''));
                    }
                    if (interception.response.body) {
                        const response = interception.response.body;
                        if (response.error) {
                            expect(response?.error.code).to.eq("ER_DUP_ENTRY");
                            expect(response?.error.name).to.eq("Error");
                            expect(response?.error.statusCode).to.eq("422");
                        } else {
                            expect(response?.name).to.eq(randomIVR.name);
                            expect(response?.description.replace(/\s/g, '')).to.eq(randomIVR.description.replace(/\s/g, ''));
                            expect(response?.id).to.exist;
                            expect(response?.rootTtsAudio).to.exist;
                            cy.url().should("include", `/service/ivr`);
                        }

                    }
                });

            }
        });
    });


});
