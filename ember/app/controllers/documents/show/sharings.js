import Ember from 'ember';

export default Ember.Controller.extend({

  sharingsInEdition: false,

  sharedGroups: function(){
    return this.get("model.sharings").mapBy('group.content');
  }.observes("model.sharings").property(),

  availableGroups: function(){
    var _this = this;
    var currentGroupsName = this.model.get("sharings").mapBy('group.name');
    return this.store.filter('group', function(group) {
      return !currentGroupsName.contains(group.get('name'));
    });
  }.observes("model.sharings.@each.group").property(),

  actions: {
    editSharings: function(){
      this.set('sharingsInEdition', true);
      return false
    },
    doneEditingSharings: function(){
      this.set('sharingsInEdition', false);
    },
  }
});
