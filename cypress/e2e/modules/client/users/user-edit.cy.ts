import { environment } from "src/environments/environment";

describe("Edit User Feature", () => {
    beforeEach(() => {
        const profile = environment.cypress;
        cy.login(profile.username, profile.password);
        cy.wait(1000);
        cy.intercept("GET", `${Cypress.env("usersEndpoint")}*`).as("refreshedUsers");
        cy.visit("/service/user");
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


    it("should Edit the user details and assign roles and save changes", () => {
        const randomUser = generateRandomUser();
        
        cy.wait("@refreshedUsers").then((interception) => {
            const body = interception.response?.body;
            if (body?.length) {
                const userId = body[body.length - 1].id;
                cy.get('[data-cy="edit-users-button"]')
                    .should("be.visible")
                    .eq(body.length - 1)
                    .click();
                cy.wait(1000);
                cy.url().should(
                    "include",
                    `/service/user/edit/${userId}`
                );                 
                cy.get('[data-cy="edit-user-email"]').should("be.visible").clear().type(randomUser.email, { force: true });
                cy.get('[data-cy="edit-user-fname"]').should("be.visible").clear().type(randomUser.firstName, { force: true });
                cy.get('[data-cy="edit-user-lname"]').should("be.visible").clear().type(randomUser.lastName, { force: true });
                cy.intercept("PATCH", `${Cypress.env("usersEndpoint")}/${userId}*`).as("updateUser");
                cy.get('[data-cy="edit-user-save-button"]').click();
                cy.wait("@updateUser").then((interception: any) => {
                    if (interception.request.body) {
                        const payload = interception.request.body;
                        expect(payload?.customerId).to.exist;
                        expect(payload?.Customer.id).to.eq(payload.customerId);
                        expect(payload?.Languages.id).to.eq(payload.languagesId);
                        expect(payload?.email).to.eq(randomUser.email);
                        expect(payload?.firstName).to.eq(randomUser.firstName);
                        expect(payload?.lastName).to.eq(randomUser.lastName);
                        expect(payload?.languagesId).to.eq(1);
                        expect(payload?.id).to.exist;
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
                            expect(response?.languagesId).to.eq(1);
                            expect(response?.id).to.exist;
                        }

                    }
                    
                });

            }
        });
    });


});
