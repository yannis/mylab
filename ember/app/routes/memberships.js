import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {

  model: function(params) {
    return this.store.find('membership', {user_id: this.get('session.user_id')});
  },

  actions: {
    delete: function(membership){
      var _this = this;
      if (window.confirm("Are you sure you want to delete this membership?")) {
        membership.destroyRecord().then(function() {
          _this.transitionTo('memberships.index');
        });
      }
    }
  }
});

