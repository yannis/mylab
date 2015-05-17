import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.store.createRecord('category');
  },
  deactivate: function() {
    return this.modelFor('categories/new').rollback();
  },
});
