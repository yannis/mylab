import Ember from 'ember';
import ajax from 'ic-ajax';

export default Ember.Controller.extend({
  actions: {
    save: function() {
      var _this = this;
      this.get('model.document').save();
      this.get('model').save().then(function(document) {
        _this.transitionToRoute('versions.show', document);
        _this.flashMessage({
          content: 'Version saved',
          duration: 2000, // Number in milliseconds
          type: 'success', // String
        });
      });
    }
  }
});
