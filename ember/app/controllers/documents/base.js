import Ember from 'ember';

export default Ember.Controller.extend({

  // needs: ["documents/show/versions"],

  categories: function(){
    return this.get('model.store').find('document');
  },
  actions: {
    save: function() {
      var _this = this;
      this.get('model').save().then(
        function(document) {
          Ember.get(_this, 'flashMessages').success('Document saved!', {sticky: true});
          // _this.get("controllers.documents/show/versions").set("model", document.get('versions'));
          _this.transitionToRoute('documents.show', document);
        },
        function(){}
      );
    },
  },
});
