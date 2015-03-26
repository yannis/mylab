import Ember from 'ember';

export default Ember.ArrayController.extend({
  sortProperties: ['name'],
  currentDocumentChanged: function(){
    if (this.get('currentDocument')) {
      this.transitionToRoute('documents.show', this.get('currentDocument'));
    } else {
      this.transitionToRoute('documents');
    }
  }.observes('currentDocument'),

});
