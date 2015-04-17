import Ember from 'ember';
import DS from 'ember-data';
import Pretender from 'pretender';
import {
  module,
  test
} from 'qunit';
import startApp from 'mylab/tests/helpers/start-app';

var application, server;

module('Acceptance: DocumentsShow', {
  beforeEach: function() {
    application = startApp();
    var documents = [
      {
        id: 1,
        name: 'Bugs Bunny'
      },
      {
        id: 2,
        name: 'Wile E. Coyote'
      },
      {
        id: 3,
        name: 'Yosemite Sam'
      }
    ];

    server = new Pretender(function() {
      this.get('/api/v1/csrf', function(request) {
        return [200, {"Content-Type": "application/json"}, JSON.stringify({authenticity_token: "an_authenticity_token"})];
      });

      this.get('/api/v1/documents', function(request) {
        return [200, {"Content-Type": "application/json"}, JSON.stringify({documents: documents})];
      });

      this.get('/api/v1/documents/:id', function(request) {
        var speaker = documents.find(function(document) {
          if (document.id === parseInt(request.params.id, 10)) {
            return document;
          }
        });

        return [200, {"Content-Type": "application/json"}, JSON.stringify({document: document})];
      });
    });
  },

  afterEach: function() {
    // Ember.$.post("api/v1/empty_db");
    Ember.run(application, 'destroy');
    server.shutdown();
  }
});

test('visiting /documents/show', function(assert) {
  visit('/documents/2');
  andThen(function() {
    assert.equal(currentRouteName(), 'versions.index');
    assert.equal(currentPath(), 'documents.show.versions.index');
    assert.equal(currentURL(), '/documents/2/versions');
  });
  // click('a[href="/documents"]');
});
