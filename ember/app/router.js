import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
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

  // this.resource('API::V1::picture', function() {});
});

export default Router;
