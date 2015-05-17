import Ember from 'ember';
import DS from 'ember-data';
import pretenderServer from './../pretender-server';
import {
  module,
  test
} from 'qunit';
import startApp from 'mylab/tests/helpers/start-app';

var application, server;

module('Acceptance: DocumentsShow', {
  beforeEach: function() {
    application = startApp();
    server = pretenderServer;
    authenticateSession();
  },

  afterEach: function() {
    invalidateSession();
    server.shutdown();
    Ember.run(application, 'destroy');
  }
});

test('visiting /documents/show', function(assert) {
  visit('/documents/2');
  andThen(function() {
    assert.equal(currentRouteName(), 'documents.show.versions.index');
    assert.equal(currentPath(), 'documents.show.versions.index');
    assert.equal(currentURL(), '/documents/2/versions');
  });
  // click('a[href="/documents"]');
});
