import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    save: function() {
      var _this = this;
      this.get('model').save().then(function(group) {
        Ember.get(_this, 'flashMessages').success('User saved!');
        _this.transitionToRoute('users.show', user);
      });
    }
  }
});
