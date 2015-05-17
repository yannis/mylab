import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    return this.modelFor('documents.show');
  },
  redirect: function (model, transition) {
    if (model) {
      this.transitionTo('documents.show.versions');
      // model.get("versions").then(
      //   function(versions){
      //     if (versions.length) {
      //       this.transitionTo('documents.show.versions');
      //     }
      //   }
      // )
    }
  },
});


