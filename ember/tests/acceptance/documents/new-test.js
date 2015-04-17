import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'mylab/tests/helpers/start-app';

var application;

module('Acceptance: DocumentsNew', {
  beforeEach: function() {
    application = startApp();
  },

  afterEach: function() {
    Ember.$.post("api/v1/empty_db");
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
    assert.equal(
      currentRouteName(),
      'versions.index',
      'Redirects to versions.index after create'
    );
  });
});
