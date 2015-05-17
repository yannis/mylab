import Ember from 'ember';

export default Ember.Route.extend({

  model: function(params){
    var groups = this.modelFor('groups');
    return groups.findBy('id', params.group_id);
  },

  actions: {
    delete: function(group){
      var _this = this;
      if (window.confirm("Are you sure you want to delete this group?")) {
        group.destroyRecord().then(function(v) {
          Ember.get(_this, 'flashMessages').success('Group deleted');
          _this.transitionTo('groups');
        });
      }
    },
    deleteMembership: function(membership){
      var _this = this;
      if (window.confirm("Are you sure you want to delete this membership?")) {
        membership.destroyRecord().then(function(v) {
          Ember.get(_this, 'flashMessages').success('Membership deleted');
        });
      }
    },
  }
});
