import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('login');
  this.route('logout');

  this.resource('categories', function() {
    this.route('new');
    this.route('show', { path: ':category_id' });
    this.route('edit', { path: ':category_id/edit' });
  });
  // this.resource('API::V1::picture', function() {});
  this.resource('documents', {path: '/documents'}, function() {
    this.route('show', {path: ':document_id'}, function(){
      this.resource('versions', function() {

        this.route('show', {
          path: ':version_id'
        });

        this.route('edit', {
          path: ':version_id/edit'
        });

        this.route('duplicate', {
          path: ':version_id/duplicate'
        });

        this.route('pdf', {
          path: ':version_id/pdf'
        });

        this.route('new');

      });
    });

    this.route('edit', {
      path: ':document_id/edit'
    });

    this.route('new');
  });
  this.resource('memberships', function() {
    this.route('show', {path: ':membership_id'});
    this.route('new');
    this.route('edit', {path: ':membership_id/edit'});
  });
  this.resource('users', function() {
    this.route('show', {
      path: ':user_id'
    });
    this.route('new');
    this.route('edit', {path: ':user_id/edit'});
  });
  this.resource('groups', function() {
    this.route('show', {path: ':group_id'});
    this.route('new');
    this.route('edit', {path: ':group_id/edit'});
  });
});

export default Router;
