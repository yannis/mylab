import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: ["documents/show"],
  sortProperties: ['createdAt'],
  sortAscending: false,

  currentVersionChanged: function(){
    if (this.get('currentVersion')) {
      this.transitionToRoute('documents.show.versions.show', this.get('currentVersion'));
    } else {
      this.transitionToRoute('documents.show.versions');
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
          Ember.get(_this, 'flashMessages').success('Docx successfully converted!', {sticky: false});
          _this.transitionToRoute('documents.show.versions.show', v);
        });
      });
    }
  }
});
