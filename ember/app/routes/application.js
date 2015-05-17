import Ember from 'ember';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  beforeModel: function(transition) {
    this._super(transition);
    return this.csrf.fetchToken();
  },
  actions: {
    sessionAuthenticationSucceeded: function(){
      this.get('flashMessages').success('Successfully signed in!');
      this._super();
    },
    sessionAuthenticationFailed: function(message){
      this.get('flashMessages').danger(message.errors);
      this._super();
    },
    invalidateSession: function() {
      this.get('session').invalidate();
      this._super();
    }
  }
});
