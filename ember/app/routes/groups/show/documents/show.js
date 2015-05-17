import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    var documents = this.modelFor('documents');
    return documents.findBy('id', params.document_id);
  },

  setupController: function (controller, model) {
    // Call _super for default behavior
    var _this = this;
    this._super(controller, model);
    this.controllerFor('documents').set('currentDocument', model);
    this.controllerFor('documents/show/sharings').set('model', model);
    this.controllerFor('documents/show/sharings').set('groups', _this.store.find('group'));
  },

  // renderTemplate: function(){
  //   this._super();
  //   this.render('documents/show/sharings', {   // the template to render
  //     into: 'documents/show',                // the template to render into
  //     outlet: 'groups',              // the name of the outlet in that template
  //     controller: 'documents/show/sharings'        // the controller to use for the template
  //   });
  // },

  actions: {
    cancel: function() {
      console.log("doc canceled");
      this.model.rollback();
      this.transitionToRoute('documents.show', this.get('model'));
    },
    shareWithGroup: function(group){
      var _this = this;
      console.log('model', this.model);
      var sharing = this.store.createRecord('sharing', {sharable: document, group: group});
      sharing.save().then( function(sharing) {
        Ember.get(_this, 'flashMessages').success('Document shared!', {sticky: true});
        _this.transitionToRoute('documents.show', _this.model);
      });
    },
    // edit_sharing: function(){
    //   console.log("edit_sharing");
    //   this.render('documents/show/edit_sharing', {   // the template to render
    //     into: 'documents/show',                // the template to render into
    //     outlet: 'groups',              // the name of the outlet in that template
    //     controller: 'documents/show/sharings'        // the controller to use for the template
    //   });
    // },
    saveSharing: function() {
      var _this = this;
      this.model.save().then(function(document) {
        Ember.get(_this, 'flashMessages').success('Document saved!', {sticky: true});
        _this.transitionToRoute('documents.show', document);
      });
    },
    cancelSharing: function() {
      this.model.rollback();
      this.render('documents/show/sharings', {   // the template to render
        into: 'documents/show',                // the template to render into
        outlet: 'groups',              // the name of the outlet in that template
        controller: 'documents/show/sharings'        // the controller to use for the template
      });
    }
  }
});


