import Ember from 'ember';

export default Ember.Route.extend({

  model: function(params){
    return this.modelFor('versions');
  },

  redirect: function(model, transition) {
    var lastCreatedVersion = model.sortBy('createdAt:desc').get('firstObject');
    return this.transitionTo('versions.show', lastCreatedVersion);
  }
});

