import Ember from 'ember';

export default Ember.Route.extend({

  model: function(params){
    return this.modelFor('documents');
  },

  afterModel: function(model, transition) {
    if (model.length) {
      var lastUpdatedDocument = model.sortBy('updatedAt:desc').get('firstObject');
      return this.transitionTo('documents.show', lastUpdatedDocument);
    }
  }
});

