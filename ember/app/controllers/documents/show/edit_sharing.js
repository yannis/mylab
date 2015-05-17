import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    saveSharing: function() {
      var _this = this;
      this.get('model').save().then(function(document) {
        Ember.get(_this, 'flashMessages').success('Document saved!', {sticky: true});
        _this.transitionToRoute('documents.show', document);
      });
    },
    cancel: function() {
      this.render('documents/show/groups', {   // the template to render
        into: 'documents/show',                // the template to render into
        outlet: 'groups',              // the name of the outlet in that template
        controller: 'documents/show/groups'        // the controller to use for the template
      });
    }
  },
});
