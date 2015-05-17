import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    return this.store.find('version', params.version_id);
  },

  setupController: function (controller, model) {
    // Call _super for default behavior
    this._super(controller, model);
    // Implement your custom setup after
    this.controllerFor('documents.show.versions').set('currentVersion', model);
  },

  actions: {
    delete: function(version){
      var _this = this;
      if (window.confirm("Are you sure you want to delete this version?")) {
        version.destroyRecord().then(function(v) {
          Ember.get(_this, 'flashMessages').success('Version deleted');
          _this.transitionTo('documents.show', v.get('document'));
        });
      }
    },
  }
});

