import { environment } from "src/environments/environment";

describe('Dashboard Feature', () => {
    beforeEach(() => {
        const profile = environment.cypress;
        cy.login(profile.username, profile.password);
        cy.wait(5000)
    });


    it('should navigate to dashboard', () => {
    cy.url().should('include', '/service/dashboard');
    });

    it('should display the correct page title', () => {
        cy.get('[data-cy="pageTitle"]').should('contain', 'Welcome');
    });

    it('should display the correct log counts for today', () => {
        cy.get('[data-cy="today-logs"]').should('be.visible');
        cy.get('[data-cy="today"]').should('contain', 'Today');
    });

    it('should display the correct log counts for yesterday', () => {
        cy.get('[data-cy="yesterday-logs"]').should('be.visible');
        cy.get('[data-cy="yesterday"]').should('contain', 'Yesterday');
    });

    it('should display the correct log counts for this week', () => {
        cy.get('[data-cy="this-week-logs"]').should('be.visible');
        cy.get('[data-cy="this-week"]').should('contain', 'This Week');
    });

    it('should display the correct log counts for last week', () => {
        cy.get('[data-cy="last-week-logs"]').should('be.visible');
        cy.get('[data-cy="last-week"]').should('contain', 'Last Week');
    });

    it('should display the correct log counts for this month', () => {
        cy.get('[data-cy="this.month-logs"]').should('be.visible');
        cy.get('[data-cy="this-month"]').should('contain', 'This Month');
    });

    it('should display the correct log counts for last month', () => {
        cy.get('[data-cy="last-month-logs"]').should('be.visible');
        cy.get('[data-cy="last-month"]').should('contain', 'Last Month');
    });

    it('should display top customers by total calls chart', () => {
        cy.get('[data-cy="customer-total-calls"]').should('be.visible');

    });

    it('should display top customers by average duration chart', () => {
        cy.get('[data-cy="average-duration"]').should('be.visible');

    });

});
