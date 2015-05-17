import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    return this.modelFor('groups.show');
  },
  redirect: function (model, transition) {
    if (model) {
      this.transitionTo('groups.show.documents');
    }
  },
});


