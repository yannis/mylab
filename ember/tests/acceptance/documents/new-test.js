import Ember from 'ember';
import DS from 'ember-data';
import pretenderServer from './../pretender-server';
import {
  module,
  test
} from 'qunit';
import startApp from 'mylab/tests/helpers/start-app';

var application, server;

module('Acceptance: DocumentsNew', {
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

test('visiting /documents/new', function(assert) {
  visit('/documents/new');

  andThen(function() {
    assert.equal(currentPath(), 'documents.new');
  });

  fillIn('input.document-form-name', 'a document');
  click('input[value="Save"]');

  andThen(function() {
    assert.equal(
      find("div.alert:contains(Document saved!)").length, 1, "Displays success flash"
    );
    assert.equal(currentPath(), 'documents.show.versions.index');
    assert.equal(currentRouteName(), 'documents.show.versions.index', 'Redirects to versions.index after create');
    assert.equal(currentURL(), '/documents/4/versions');
  });
});
