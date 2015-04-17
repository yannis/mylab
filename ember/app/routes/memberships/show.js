import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    var memberships = this.modelFor('memberships');
    return memberships.findBy('id', params.membership_id);
  },

  setupController: function (controller, model) {
    // Call _super for default behavior
    this._super(controller, model);
    this.controllerFor('memberships').set('currentmembership', model);
  },

  actions: {
    cancel: function() {
      this.model.rollback();
      this.transitionToRoute('memberships.show', this.get('model'));
    },
  }
});


