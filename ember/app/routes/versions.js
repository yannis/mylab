import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var document = this.modelFor("documents/show");
    return document.get('versions').sortBy('createdAt:desc');
  },

  actions: {
    optionSelected: function(id) {
      this.transitionTo('versions.show', id);
    },
  }
});
