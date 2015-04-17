import Ember from 'ember';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  beforeModel: function() {
    return this.csrf.fetchToken();
  },
  actions: {
    sessionAuthenticationSucceeded: function(){
      Ember.get(_this, 'flashMessages').success('Successfully signed in!');
      this._super();
    },
    invalidateSession: function() {
      this.get('session').invalidate();
    }
  }
});
