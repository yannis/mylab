import Ember from 'ember';

export default Ember.Route.extend({

  model: function(params){
    return this.modelFor('groups');
  },

  afterModel: function(model, transition) {
    if (model.length) {
      var firstGroup = model.sortBy('name:asc').get('firstObject');
      return this.transitionTo('groups.show', firstGroup);
    }
  }
});

