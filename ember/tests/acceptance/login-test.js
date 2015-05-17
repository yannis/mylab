import Ember from 'ember';
import DS from 'ember-data';
import pretenderServer from './pretender-server';
import {
  module,
  test
} from 'qunit';
import startApp from 'mylab/tests/helpers/start-app';

var application, server;

module('Acceptance: Login', {
  beforeEach: function() {
    application = startApp();
    server = pretenderServer;
    invalidateSession();
  },

  afterEach: function() {
    invalidateSession();
    server.shutdown();
    Ember.run(application, 'destroy');
  }
});

test('visiting /login', function(assert) {

  visit('/login');

  andThen(function() {
    assert.equal(currentURL(), '/login');
    assert.equal(currentRouteName(), 'login');
    assert.equal(currentPath(), 'login');
  });
});

test('successfull login', function(assert) {
  server.post('/api/v1/users/sign_in', function(request) {
    return [200, {"Content-Type": "application/json"}, JSON.stringify({id: 1, name: 'user1', email: 'user1@mail.com', token: 'token1'})];
  });
  assert.expect(4);
  visit('/login');

  andThen(function() {
    fillIn('input#identification', 'user1@mail.com');
    fillIn('input#password', 'password');
    click('button[type="submit"]');
  });
  andThen(function() {
    assert.ok(find('.alert.alert-success:contains(Successfully signed in!)'));
    assert.equal(currentURL(), '/documents/1/versions');
    assert.equal(currentRouteName(), 'documents.show.versions.index');
    assert.equal(currentPath(), 'documents.show.versions.index');
  });
});

test('failed login', function(assert) {
  server.post('/api/v1/users/sign_in', function(request) {
    return [422, {"Content-Type": "application/json"}, JSON.stringify({"errors": "Invalid email or password"})];
  });
  assert.expect(5);
  visit('/login');

  andThen(function() {
    fillIn('input#identification', 'faker@mail.com'); // has to contain faker (see pretender-server)
    fillIn('input#password', 'nopassword');
    click('button[type="submit"]');
  });

  andThen(function() {
    assert.ok(find('.alert.alert-danger:contains(Invalid email or password!)'));
    assert.equal(currentURL(), '/login');
    assert.equal(currentRouteName(), 'login');
    assert.equal(currentPath(), 'login');
  });
});

