import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    return this.modelFor('documents.show');
  },

  renderTemplate: function(){
    this.render('versions/show/edit_sharing', {   // the template to render
      into: 'documents/show',                // the template to render into
      outlet: 'groups',              // the name of the outlet in that template
      // controller: 'documents/show/edit_sharing'        // the controller to use for the template
    });
  },

  setupController: function (controller, model) {
    // Call _super for default behavior
    this._super(controller, model);
    controller.set('currentGroups', model.get('groups'));
    controller.set('availableGroups', this.store.find('group'));
  }
});
