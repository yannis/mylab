import Ember from 'ember';
import config from '../config/environment';
// import { raw as icAjaxRaw } from 'ic-ajax';
import { request as icAjaxRequest } from 'ic-ajax';
import ic from 'ic-ajax';

export default Ember.Controller.extend({
  actions: {
    save: function() {
      var _this = this;
      var invitation = this.get('model');
      var user = this.get('user');
      debugger
      user.set("invitation_id", invitation.get("id"));
      user.set("token", invitation.get("token"));
      user.save().then(
        function(u) {
          var data = {identification: u.get("email"), password: u.get("password")};
          _this.get('session').authenticate('simple-auth-authenticator:devise', data).then(
            function(){
              _this.transitionToRoute('users.show', u.get('id'));

            },
            function(arg1) {
              _this.get('flashMessages').error(arg1.errors);
            }
          );
          // _this.get('flashMessages').success('User saved!');
          // debugger
          // _this.get('session').authenticate('simple-auth-authenticator:devise', {
          //   email: user.get('email'),
          //   password: user.get('password')
          // });
          // invitation.set('accepted_at', new Date);
          // invitation.save().then(function(){
          //   Ember.get(_this, 'flashMessages').success('Invitation accepted!');
          // }, function(){})
          // _this.transitionToRoute('users.show', user);
        },
        function() {
          _this.get('flashMessages').danger('User not saved!');
        }
      );
    }
  }
});
