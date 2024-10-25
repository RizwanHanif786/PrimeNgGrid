import { environment } from "src/environments/environment";

describe("New Role Feature", () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.visit("/service/role/add");
        cy.wait(5000);
    });


    // it("should display the page title ", () => {
    //     cy.get('[data-cy="page_title"]')
    //         .should("be.visible")
    //         .and("contain.text", "New Role");
    // });

    it("should add name, description, customer and  create a new role and navigate to roles list screen", () => {
        const roleName = 'new user role'
        const description = 'new user role description'
        cy.wait(3000)
        cy.get('[data-cy="add-role-name"]').should("be.visible").type(roleName, { force: true })
        cy.get('[data-cy="add-role-description"]').should("be.visible").type(description, { force: true });

        if(profile.username === 'sadmin') {
        cy.get('[data-cy="add-role-customer-dropdown"]')
            .should("be.visible")
            .click();
        cy.get(".p-dropdown-item").should("be.visible", { force: true });
        cy.get(".p-dropdown-item").eq(0).click({ force: true });
        cy.get(".p-dropdown-label").should("contain", "Tech Fusion ITc");
        }
        cy.wait(1000)
        cy.contains("Assign Permission").click();
        cy.wait(1000)
        cy.get('[data-cy="check-all-button"]').click();


        cy.intercept("POST", `${Cypress.env("rolesEndpoint")}*`).as("addNewRole");
        cy.intercept("POST", `${Cypress.env("guiVisibilitiesEndpoint")}*`).as("guiVisibility");
        cy.get('[data-cy="create-role-button"]').should("be.visible").click();
        cy.wait("@addNewRole").then((interception: any) => {
            console.log(interception, 'addrole')
            if (interception.request.body) {
                const payload = interception.request.body;
                // expect(payload?.customerId).to.exist;
                expect(payload?.created).to.exist;
                expect(payload?.name).to.eq(roleName);
                expect(payload?.description).to.eq(description);
            }
            if (interception?.response?.body) {
                const response = interception.response.body;
                // expect(response?.customerId).to.exist;
                expect(response?.created).to.exist;
                expect(response?.name).to.eq(roleName);
                expect(response?.description).to.eq(description);
                expect(response?.id).to.exist;
                cy.url().should("include", `/service/role`);
            }
        });
        cy.wait("@guiVisibility").then((interception: any) => {
            console.log(interception, 'interception')
            if (interception.request.body) {
                const payload = interception.request.body;
                expect(payload?.guipermissionId).to.eq(3);
                expect(payload?.guisectionId).to.exist;
                expect(payload?.roleId).to.exist;
            }
            if (interception?.response?.body) {
                if(typeof (interception?.response?.body) == 'string') {
                const response = JSON.parse(interception.response.body);
                if(response.error){
                    expect(response.error.statusCode).to.eq(401)
                    expect(response.error.message).to.eq("Not allowed!")
                }
            }
                else{
                expect(interception?.response?.body?.guipermissionId).to.exist;
                expect(interception?.response?.body?.guisectionId).to.exist;
                expect(interception?.response?.body?.id).to.exist;
                }
            }
        });
    })

});
