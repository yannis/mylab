import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.store.createRecord('document');
  },

  deactivate: function() {
    return this.modelFor('documents/new').rollback();
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('categories', this.store.find('category'));
  }

});
