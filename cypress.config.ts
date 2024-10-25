import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
    baseUrl:'http://devbox.techfusion.it:9095/',    
    setupNodeEvents(on, config) {}, 
    viewportWidth: 1440,
    viewportHeight: 900, 
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: false,
      html: false,
      json: false,
    },
    screenshotOnRunFailure: true,
    video: false,
    retries: {
      runMode: 2,
      openMode: 0
    },
  
  },
  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
    },
    specPattern: "**/*.cy.ts",
    
  },
  env: {
    callLogsEndpoint: "/api/v1/CallLogs", 
    trackingNumbersEndpoint: "/api/v1/OpNumbers", 
    receivingNumbersEndpoint: "/api/v1/ReceivingNumbers", 
    trackingSourcesEndpoint: "/api/v1/TrackingSources", 
    whitelistsEndpoint: "/api/v1/Whitelists", 
    sipGatewaysEndpoint: "/api/v1/SipGateways", 
    rolesEndpoint: "/api/v1/DashRoles", 
    guiVisibilitiesEndpoint: "/api/v1/GuiVisibilities", 
    rolesMappingEndpoint: "/api/v1/DashRoleMappings", 
    customersEndpoint: "/api/v1/Customers", 
    ivrsEndpoint: "/api/v1/Ivrs", 
    usersEndpoint: "/api/v1/DashUsers", 
    productsEndpoint: "/api/v1/Products", 
    productVariationsEndpoint: "/api/v1/ProductVariations", 
    
  },
});
