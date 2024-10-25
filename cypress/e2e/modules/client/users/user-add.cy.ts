import { environment } from "src/environments/environment";

describe("New User Feature", () => {
    const profile = environment.cypress;
    beforeEach(() => {
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.visit("/service/user/add");
        cy.wait(5000);
    });

    function generateRandomUser() {
        const randomString = (length: number) => {
            const characters = 'abcdefghijklmnopqrstuvwxyz';
            return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
        };
        const randomNumber = () => Math.floor(Math.random() * 1000);
        const username = `user_${randomString(5)}_${randomNumber()}`;
        const email = `email_${randomString(5)}_${randomNumber()}@example.com`;
        const firstName = `firstName_${randomString(5)}`;
        const lastName = `lastName_${randomString(5)}`;
        return { username, email, firstName, lastName };
    }

    it("should display the page title ", () => {
        cy.get('[data-cy="page_title"]')
            .should("be.visible")
            .and("contain.text", "New User");
    });

    it("should add username, email, fname, lname and assign role and create a new user and navigate to users list screen", () => {
        cy.wait(1000)
        const randomUser = generateRandomUser();
        const password = "@Test1234"

        cy.get('[data-cy="add-user-name"]').should("be.visible").type(randomUser.username, { force: true })
        cy.get('[data-cy="add-user-email"]').should("be.visible").type(randomUser.email, { force: true });
        cy.get('[data-cy="add-user-fname"]').should("be.visible").type(randomUser.firstName, { force: true });
        cy.get('[data-cy="add-user-lname"]').should("be.visible").type(randomUser.lastName, { force: true });
        cy.get('[data-cy="add-user-timezone-dropdown"]').should("be.visible").click();
        cy.get(".p-dropdown-item").should("be.visible", { force: true });
        cy.get(".p-dropdown-item").eq(0).click({ force: true });
        cy.get(".p-dropdown-label").should("contain", "Auto Detect");
        cy.get('[data-cy="add-user-password"] input').should("be.visible").type(password, { force: true });
        cy.get('[data-cy="add-user-cfmpassword"] input').should("be.visible").type(password, { force: true });
        cy.contains('Assign Role').click();
        if (profile.username === 'sadmin') {
            cy.get('[data-cy="add-user-customer-dropdown"]')
                .should("be.visible")
                .click();
            cy.get(".p-dropdown-item").should("be.visible", { force: true });
            cy.get(".p-dropdown-item").eq(0).click({ force: true });
            cy.get(".p-dropdown-label").should("contain", "Tech Fusion ITc");
        }
        cy.get('[data-cy="add-user-role-dropdown"]')
            .should("be.visible")
            .click();
        cy.get(".p-dropdown-item").should("be.visible", { force: true });
        cy.get(".p-dropdown-item").eq(0).click({ force: true });
        cy.intercept("POST", `${Cypress.env("usersEndpoint")}*`).as("addNewUser");
        cy.get('[data-cy="add-user-create-button"]').click();
        cy.wait("@addNewUser").then((interception: any) => {
            if (interception.request.body) {
                const payload = interception.request.body;
                expect(payload?.customerId).to.exist;
                expect(payload?.email).to.eq(randomUser.email);
                expect(payload?.firstName).to.eq(randomUser.firstName);
                expect(payload?.lastName).to.eq(randomUser.lastName);
                expect(payload?.password).to.eq(password);
                expect(payload?.roleId).to.exist;
                expect(payload?.languagesId).to.eq(1);
                expect(payload?.uiSettings).to.eq("{\"timezone\":\"\",\"dateFormat\":\"mm/dd/yyyy\",\"weekendFormat\":1}");
                expect(payload?.username).to.eq(randomUser.username);
            }
            if (interception.response.body) {
                const response = interception.response.body;
                if (response.error) {
                    expect(response?.error.code).to.eq("ER_DUP_ENTRY");
                    expect(response?.error.name).to.eq("Error");
                    expect(response?.error.statusCode).to.eq("422");
                } else {
                    expect(response?.customerId).to.exist;
                    expect(response?.email).to.eq(randomUser.email);
                    expect(response?.firstName).to.eq(randomUser.firstName);
                    expect(response?.lastName).to.eq(randomUser.lastName);
                    expect(response?.roleId).to.exist;
                    expect(response?.id).to.exist;
                    expect(response?.languagesId).to.eq(1);
                    expect(response?.uiSettings).to.eq("{\"timezone\":\"\",\"dateFormat\":\"mm/dd/yyyy\",\"weekendFormat\":1}");
                    expect(response?.username).to.eq(randomUser.username);
                    cy.url().should("include", `/service/user`);
                }
            }
        });

    })

});
