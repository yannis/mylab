import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var group = this.modelFor('groups.show');
    return this.store.createRecord('invitation', {group: group});
  },

  setupController: function(controller, model){
    var _this = this;
    this._super(controller, model);
    controller.set('users', this.store.find('user'));
  }
});
