import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: ["documents/show"],
  sortProperties: ['createdAt'],
  sortAscending: false,

  currentVersionChanged: function(){
    if (this.get('currentVersion')) {
      this.transitionToRoute('versions.show', this.get('currentVersion'));
    } else {
      this.transitionToRoute('versions');
    }
  }.observes('currentVersion'),

  actions: {
    createVersionFromWordFile: function(file) {
      var _this = this;
      var docu = this.get('model.document');
      var docx = this.get('store').createRecord('docx', {
          doc: file
      });
      docx.save().then(function(d){
        var document = _this.get("controllers.documents/show.model");
        var version = _this.get('store').createRecord('version', {
          contentMd: d.get('markdown'),
          document: document
        });
        version.save().then(function(v){
          document.get('versions').pushObject(v);
          _this.flashMessage({
            content: 'Docx successfully converted', // String
            duration: 2000, // Number in milliseconds
            type: 'success', // String
          });
          _this.transitionToRoute('versions.show', v);
        });
      });
    }
  }
});
