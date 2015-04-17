import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate: function(controller) {
    controller.logout();
  }
});
