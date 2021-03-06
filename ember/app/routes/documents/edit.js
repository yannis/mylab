import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var documents = this.modelFor('documents');
    return documents.findBy('id', params.document_id);
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('categories', this.store.find('category'));
  }
});
