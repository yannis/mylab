/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'mylab',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    apiHost: "api/v1",
    proxy: "http://localhost:3000/",

    contentSecurityPolicy: {
      'default-src': "'self' mylab.dev",
      'img-src': "'self' mylab.dev data: www.gravatar.com",
      'script-src': "'self' 'unsafe-inline' 'unsafe-eval' 10.1.3.34:35729",
      'font-src': "'self'",
      'connect-src': "'self' mylab.dev",
      'style-src': "'self' 'unsafe-inline'",
      'report-uri': "'self'"
    },

    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  ENV['simple-auth'] = {
    authorizer: 'simple-auth-authorizer:devise',
    store: 'simple-auth-session-store:local-storage'
  };

  ENV['simple-auth-devise'] = {
    serverTokenEndpoint: ENV.apiHost+"/users/sign_in",
    // resourceName: 'account'
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    proxy: "http://mylab.dev/",
    ENV.apiHost = "api/v1";
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';

    ENV['simple-auth'].store = 'simple-auth-session-store:ephemeral';
  }

  if (environment === 'production') {

  }

  return ENV;
};
