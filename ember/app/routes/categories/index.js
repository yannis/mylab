import Ember from 'ember';

export default Ember.Route.extend({

  model: function(params){
    return this.modelFor('categories');
  },

  afterModel: function(model, transition) {
    if (model.length) {
      var lastCategory = model.sortBy('name:asc').get('firstObject');
      return this.transitionTo('categories.show', lastCategory);
    }
  }
});

