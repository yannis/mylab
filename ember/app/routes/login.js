import Ember from 'ember';

export default Ember.Route.extend({

  redirect: function(){
    var session = this.get('session');
    if (session.isAuthenticated) {
      this.get('flashMessages').success('Already logged in');
      this.transitionTo("users.show", session.get("currentUser"));
    }
  },

  // setupController: function(controller, model) {
  //   return controller.set('validationErrors', null);
  // }
});
