import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    return this.csrf.fetchToken();
  },
  // actions: {
  //   didSelect: function(){
  //     debugger
  //   }
  // }
  // ,
  // redirect: function() {
  //   debugger;
  //   this.transitionTo('documents');
  // }
});
