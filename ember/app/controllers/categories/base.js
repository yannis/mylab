import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    save: function() {
      var _this = this;
      this.get('model').save().then(function(category) {
        Ember.get(_this, 'flashMessages').success('Category saved!');
        _this.transitionToRoute('categories.show', category);
      });
    }
  }
});
