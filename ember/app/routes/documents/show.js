import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    return this.store.find('document', params.document_id);
  },

  // afterModel: function(model){
  //   this.transitionTo('versions.index');
  // },

  redirect: function (model) {
    this.transitionTo('versions.index');
    // var _this = this;
    // var document = this.store.find('document', params.id).then(function(document){
    //   _this.transitionTo('versions.show', document.get('lastVersion'));
    // });
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


