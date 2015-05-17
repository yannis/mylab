import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    return this.store.find('version', params.version_id);
  },

   deactivate: function() {
    var model = this.modelFor('documents/show/versions/edit');
    model.rollback();
  },

  actions: {
    willTransition: function(transition){
      var model = this.get('controller.model');
      var leave;
      if (model.get('isDirty')) {
        leave = window.confirm("You have unsaved changes. Are you sure you want to leave?")
        if (leave) {
          model.rollback();
        } else {
          transition.abort();
        }
      }
    }
  }
});

