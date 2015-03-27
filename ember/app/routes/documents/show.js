import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    var documents = this.modelFor('documents');
    return documents.findBy('id', params.document_id);
  },

  setupController: function (controller, model) {
    // Call _super for default behavior
    this._super(controller, model);
    this.controllerFor('documents').set('currentDocument', model);
  },

  actions: {
    cancel: function() {
      this.model.rollback();
      this.transitionToRoute('documents.show', this.get('model'));
    },
  }
});


