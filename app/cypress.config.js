const { defineConfig } = require('cypress')

module.exports = defineConfig({
  screenshotsFolder: 'cypress/reports/screenshots',
  videosFolder: 'cypress/reports/videos',
  reporter: '../node_modules/mocha-junit-reporter',
  reporterOptions: {
    mochaFile: 'cypress/reports/test-results.[hash].xml',
  },
  defaultCommandTimeout: 10000,
  env: {
    defaultWaitTime: 3000,
  },
  watchForFileChanges: false,
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:8080',
    specPattern: [
      'cypress/e2e/**/Login.spec.js',
      'cypress/e2e/**/Home.spec.js',
      'cypress/e2e/**/NewArrangement.spec.js',
      'cypress/e2e/**/ReviewArrangement.spec.js',
      'cypress/e2e/**/ApproveArrangement.spec.js',
      'cypress/e2e/**/AttestationText.spec.js',
      'cypress/e2e/**/EditAttestationText.spec.js',
      'cypress/e2e/**/ArrangementsLookup.spec.js'
    ],
    testIsolation: false,
    viewportWidth: 1200
  },
})
