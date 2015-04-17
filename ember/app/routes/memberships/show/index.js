import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    return this.modelFor('memberships.show');
  },
  redirect: function (model, transition) {
    this.transitionTo('versions');
  },
});


