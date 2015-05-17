import Ember from 'ember';

export default Ember.Controller.extend({

  pdfUrlWithCredentials: function(){
    return new this.get('model.pdfUrl')+"?token="+this.session.get('token')+"&user_email="+this.session.get('user_email').htmlSafe();
  }.property('model.pdfUrl'),

})
