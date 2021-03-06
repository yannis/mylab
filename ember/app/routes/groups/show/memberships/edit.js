import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var memberships = this.modelFor('groups.show').get('memberships');
    return memberships.findBy('id', params.membership_id);
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('groups', this.store.find('group'));
    controller.set('users', this.store.find('user'));
  }
});
