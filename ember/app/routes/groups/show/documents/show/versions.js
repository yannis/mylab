import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.modelFor("documents.show").get('versions').sortBy('createdAt:desc');
  },

  actions: {
    optionSelected: function(id) {
      this.transitionTo('documents.show.versions.show', id);
    },
  }
});
