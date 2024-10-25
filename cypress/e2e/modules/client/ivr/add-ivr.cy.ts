import { environment } from "src/environments/environment";

describe("New IVR Feature", () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.visit("/service/ivr/add");
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

    it("should display the page title ", () => {
        cy.get('[data-cy="page_title"]')
            .should("be.visible")
            .and("contain.text", "New Voice Menu");
    });

    it("should add name, description, customer and  create a new voice menue and navigate to voice menus list screen", () => {
        const randomIVR = generateRandomIVR();
        cy.wait(3000)
        cy.get('[data-cy="add-ivr-name"]').should("be.visible").type(randomIVR.name, { force: true })
        cy.get('[data-cy="add-ivr-description"]').should("be.visible").type(randomIVR.description, { force: true });

        if (profile.username === 'sadmin') {
            cy.get('[data-cy="add-ivr-customer-dropdown"]')
                .should("be.visible")
                .click();
            cy.get(".p-dropdown-item").should("be.visible", { force: true });
            cy.get(".p-dropdown-item").eq(1).click({ force: true });
            cy.get(".p-dropdown-label").should("contain", "Tech Fusion ITc");
        }
        cy.wait(1000)
        cy.get('[data-cy="info-next-button"]').click();
        cy.wait(1000)
        cy.get('[data-cy="add-ivr-ts-button"]').click();
        cy.get('[data-cy="add-ivr-wp-field"]').should("be.visible").type(randomIVR.description, { force: true });
        cy.get('[data-cy="prompt-next-button"]').click();
        cy.wait(1000)

        cy.intercept("POST", `${Cypress.env("ivrsEndpoint")}*`).as("addNewIVR");
        cy.get('[data-cy="add-ivr-create-button"]').click();
        cy.wait("@addNewIVR").then((interception: any) => {
            if (interception.request.body) {
                const payload = interception.request.body;
                expect(payload?.customerid).to.exist;
                expect(payload?.rootTtsAudio).to.exist;
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

    })

});
