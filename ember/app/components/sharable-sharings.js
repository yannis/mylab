import Ember from 'ember';

export default Ember.Component.extend({

  isEditing: false,

  model: function(){
    return this.get("targetObject.model")
  }.property("targetObject"),

  store: function() {
    return this.get("targetObject.store")
  }.property("targetObject"),

  sharedGroups: function() {
    return this.get("model.sharings").mapBy("group.content")
  }.property("model.sharings.@each.group"),

  availableGroups: function(){
    var _this = this;
    var currentGroupsName = this.get("model.sharings").mapBy('group.content');
    return this.get("store").filter('group', function(group) {
      return !currentGroupsName.contains(group);
    });
  }.property("store", "model.sharings.@each.group"),

  actions: {
    editSharings: function(){
      this.set('isEditing', true);
    },
    doneEditingSharings: function(){
      this.set('isEditing', false);
    },
    addSharing: function(group){
      var _this = this;
      var model = this.get('model');
      var store = this.get('store');
      var sharing = store.createRecord('sharing', {sharable: model, group: group});
      sharing.save().then( function(sharing) {
        model.get('sharings').addObject(sharing);
        Ember.get(_this, 'flashMessages').success("Shared with group '"+group.get('name')+"'!");
      });
    },
    destroySharing: function(group){
      var _this = this;
      var model = this.get('model');
      var store = this.get('store');
      var sharing = this.get("model.sharings.firstObject", {group: group});
      if (window.confirm("Are you sure you want to unshare this document?")) {
        sharing.destroyRecord().then( function(sharing) {
          // model.get('sharings').removeObject(sharing);
          Ember.get(_this, 'flashMessages').success("Unshared from group '"+group.get('name')+"'!");
        });
      }
    },
  }
});
