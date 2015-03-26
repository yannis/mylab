import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var document = this.modelFor("documents/show");
    return document.get('versions').sortBy('createdAt');
  },
  afterModel: function(model){
    this.transitionTo('versions.show', model.get('lastObject'));
  },

  // redirect: function (params) {
  //   var document = this.modelFor("documents/show");
  //   this.transitionTo('versions.show', document.get('lastVersion'));
  // },
  actions: {
    optionSelected: function(id) {
      this.transitionTo('versions.show', id);
    },
  }
});
