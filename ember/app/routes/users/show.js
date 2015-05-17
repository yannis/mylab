import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate: function(controller, model) {
    var _this = this;
    this.get("session.currentUser").then(function(user){
      if (user == model) {
        _this.render('users/show/you');
      } else {
        _this.render('users/show/user');
      }
    })
  }
});

