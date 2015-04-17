import Ember from 'ember';
import Session from 'simple-auth/session';
import DeviseAuthenticator from 'simple-auth-devise/authenticators/devise';
import config from '../config/environment';

export default {
  name:       'simple-auth-config',
  before:     'simple-auth',

  initialize: function(container, application) {

    DeviseAuthenticator.reopen({
      invalidate: function(){
        return Ember.$.ajax({
          url:  config.apiHost+'/users/sign_out',
          type: 'DELETE',
          dataType: 'JSON'
        });
      }
    })

    Session.reopen({
      currentUser : function() {
        var userId = this.get('user_id');
        if (!Ember.isEmpty(userId)) {
          return container.lookup('store:main').find('user', userId);
        };
      }.property('user_id')
    });
  }
};
