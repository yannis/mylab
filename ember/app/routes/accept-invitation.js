import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function(){
    var session = this.get('session');
    if (session.isAuthenticated) {
      session.invalidate();
    }
  },

  model: function(params){
    return this.store.find('invitation', {id: params.id, token: params.token}).then(function(invitations){
      var inv = invitations.get('firstObject');
      inv.set('token', params.token);
      return inv;
    });
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    debugger
    controller.set('user', this.store.createRecord('user', {email: model.get('email')}));
  },
});
