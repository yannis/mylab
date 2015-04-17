import Ember from 'ember';

export default Ember.Route.extend({
  setupController: function(controller, model) {
    return controller.set('validationErrors', null);
  }
});
