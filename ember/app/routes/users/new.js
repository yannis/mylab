import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.store.createRecord('user');
  },

  deactivate: function() {
    return this.modelFor('users/new').rollback();
  },
});
